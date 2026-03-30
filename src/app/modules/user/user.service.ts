import { User } from './user.model';
import { IUser } from './user.interface';
import jwt from 'jsonwebtoken';
import { NotificationService } from '../notification/notification.service';

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
  const toCreate = { ...payload, id, authProvider: 'local' as const } as IUser;

  const newUser = await User.create(toCreate);

  const token = jwt.sign(
    { _id: newUser._id, role: newUser.role, email: newUser.email },
    process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'default_secret',
    { expiresIn: '7d' }
  );

  // ── Notify admins about new registration ──
  try {
    const studentName = `${newUser.firstName} ${newUser.lastName || ''}`.trim();
    console.log(`📢 Sending admin notification: New registration - ${studentName}`);
    await NotificationService.triggerNewRegistrationForAdmins(
      studentName,
      newUser.email,
      'local',
    );
    console.log('✅ Admin registration notification sent');
  } catch (e) {
    console.error('❌ Admin notification (new registration) failed:', e);
  }

  return { user: newUser, token };
};

// Google Login/Register
const googleLoginServices = async (payload: {
  firstName: string;
  lastName?: string;
  email: string;
  image?: string;
  googleId: string;
}): Promise<CreateUserResponse> => {
  // Check if user already exists
  let user = await User.findOne({ email: payload.email, isDeleted: false });
  let isNewUser = false;

  if (user) {
    // Update google info if needed
    if (!user.googleId) {
      user.googleId = payload.googleId;
      user.authProvider = 'google';
      if (payload.image) user.image = payload.image;
      await user.save();
    }
  } else {
    // Create new user
    isNewUser = true;
    const id = await generateUserId();
    user = await User.create({
      id,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName || '',
      phoneNumber: '',
      password: '',
      role: 'student',
      status: 'active',
      image: payload.image || '',
      googleId: payload.googleId,
      authProvider: 'google',
    });
  }

  const token = jwt.sign(
    { _id: user._id, role: user.role, email: user.email },
    process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'default_secret',
    { expiresIn: '7d' }
  );

  // ── Notify admins about new Google registration (only for new users) ──
  if (isNewUser) {
    try {
      const studentName = `${payload.firstName} ${payload.lastName || ''}`.trim();
      console.log(`📢 Sending admin notification: New Google registration - ${studentName}`);
      await NotificationService.triggerNewRegistrationForAdmins(
        studentName,
        payload.email,
        'google',
      );
      console.log('✅ Admin Google registration notification sent');
    } catch (e) {
      console.error('❌ Admin notification (google registration) failed:', e);
    }
  }

  return { user, token };
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
  googleLoginServices,
  getAllUsersServices,
  getSingleUserServices,
  updateUserServices,
  deleteUserServices,
};
