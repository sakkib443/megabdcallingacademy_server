import { User } from './user.model';
import { IUser } from './user.interface';
import jwt from 'jsonwebtoken';

/**
 * Generate a user id in format: bac-(YYYY)-NN
 * Example: bac-(2025)-01, bac-(2025)-02, etc.
 */
async function generateUserId(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `bac-(${year})-`;

  // Count total users to get the next sequence number
  // This ensures unique IDs even if previous IDs were malformed
  const totalUsers = await User.countDocuments({});

  // Also check for the highest sequence number in existing IDs with proper format
  const usersWithProperFormat = await User.find({
    id: { $regex: `^bac-\\(\\d{4}\\)-\\d+$` }
  }).select('id').lean();

  let maxSeq = totalUsers; // Start with total count as minimum

  for (const user of usersWithProperFormat) {
    if (user.id) {
      const match = user.id.match(/-(\d+)$/);
      if (match) {
        const seq = parseInt(match[1], 10);
        if (!Number.isNaN(seq) && seq >= maxSeq) {
          maxSeq = seq;
        }
      }
    }
  }

  const nextSeq = maxSeq + 1;
  const seqStr = String(nextSeq).padStart(2, '0');
  return `${prefix}${seqStr}`;
}

interface CreateUserResponse {
  user: IUser;
  token: string;
}

const createUserServices = async (payload: IUser): Promise<CreateUserResponse> => {
  // Do not accept externally provided id — generate it here
  const id = await generateUserId();
  const toCreate = { ...payload, id } as IUser;

  const newUser = await User.create(toCreate);

  // Generate JWT token for automatic login after registration
  const token = jwt.sign(
    {
      _id: newUser._id,
      role: newUser.role,
      email: newUser.email,
    },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: '7d' }
  );

  return {
    user: newUser,
    token
  };
};

const getAllUsersServices = async (): Promise<IUser[]> => {
  const users = await User.find({ isDeleted: false });
  return users;
};

const getSingleUserServices = async (id: string): Promise<IUser | null> => {
  // Try to find by MongoDB _id first, then by custom id field
  const isValidObjectId = /^[a-f\d]{24}$/i.test(id);

  const query = isValidObjectId
    ? { $or: [{ _id: id }, { id: id }], isDeleted: false }
    : { id: id, isDeleted: false };

  const user = await User.findOne(query);
  return user;
};

const updateUserServices = async (id: string, payload: Partial<IUser>): Promise<IUser | null> => {
  // Try to find by MongoDB _id first, then by custom id field
  const isValidObjectId = /^[a-f\d]{24}$/i.test(id);

  const query = isValidObjectId
    ? { $or: [{ _id: id }, { id: id }], isDeleted: false }
    : { id: id, isDeleted: false };

  const updatedUser = await User.findOneAndUpdate(
    query,
    payload,
    { new: true }
  );
  return updatedUser;
};

const deleteUserServices = async (id: string): Promise<IUser | null> => {
  // Try to find by MongoDB _id first, then by custom id field
  const isValidObjectId = /^[a-f\d]{24}$/i.test(id);

  const query = isValidObjectId
    ? { $or: [{ _id: id }, { id: id }], isDeleted: false }
    : { id: id, isDeleted: false };

  const deletedUser = await User.findOneAndUpdate(
    query,
    { isDeleted: true },
    { new: true }
  );
  return deletedUser;
};

export const UserService = {
  createUserServices,
  getAllUsersServices,
  getSingleUserServices,
  updateUserServices,
  deleteUserServices,
};
