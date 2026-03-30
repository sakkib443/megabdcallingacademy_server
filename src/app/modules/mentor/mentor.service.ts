import { TMentor } from './mentor.interface';
import { Mentor } from './mentor.model';
import { User } from '../user/user.model';

// CREATE — Auto creates a User account with role 'mentor'
const createMentorServices = async (payload: TMentor & { password?: string }) => {
  const mentorEmail = payload.email;
  const mentorName = payload.name || 'Mentor';
  const nameParts = mentorName.trim().split(' ');

  // Generate email if missing
  const email = mentorEmail || mentorName.toLowerCase().replace(/\s+/g, '') + '@gmail.com';

  // Check if user already exists
  let user = await User.findOne({ email });
  if (user) {
    // Update role to mentor if different
    if (user.role !== 'mentor') {
      user.role = 'mentor' as any;
      await user.save();
    }
  } else {
    // Create new user
    const userCount = await User.countDocuments();
    const userId = `bac-mentor-${String(userCount + 1).padStart(3, '0')}`;
    user = await User.create({
      id: userId,
      email,
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(' ') || '',
      phoneNumber: payload.phone || '',
      password: payload.password || 'Mentor@123456',
      role: 'mentor',
      status: 'active',
      isDeleted: false,
      isPasswordChanged: false,
      image: payload.image || '',
    });
  }

  // Create mentor with userId link
  const mentorData = { ...payload, email, userId: user._id };
  delete (mentorData as any).password; // Don't save password in mentor collection
  const result = await Mentor.create(mentorData);
  return result;
};

// READ ALL
const getAllMentorsServices = async () => {
  return await Mentor.find().populate('userId', 'email role status').sort({ _id: 1 });
};

// READ SINGLE
const getSingleMentorServices = async (id: string): Promise<TMentor | null> => {
  const mongoose = await import('mongoose');
  if (mongoose.default.Types.ObjectId.isValid(id) && id.length === 24) {
    const result = await Mentor.findById(id).populate('userId', 'email role status');
    if (result) return result;
  }
  return await Mentor.findOne({ id }).populate('userId', 'email role status');
};

// UPDATE
const updateMentorServices = async (
  id: string,
  payload: Partial<TMentor>
): Promise<TMentor | null> => {
  const mongoose = await import('mongoose');
  if (mongoose.default.Types.ObjectId.isValid(id) && id.length === 24) {
    const result = await Mentor.findByIdAndUpdate(id, payload, { new: true });
    if (result) return result;
  }
  return await Mentor.findOneAndUpdate({ id }, payload, { new: true });
};

// DELETE — Also deactivates the linked User account
const deleteMentorServices = async (id: string): Promise<TMentor | null> => {
  const mongoose = await import('mongoose');
  let mentor: any = null;
  if (mongoose.default.Types.ObjectId.isValid(id) && id.length === 24) {
    mentor = await Mentor.findByIdAndDelete(id);
  }
  if (!mentor) {
    mentor = await Mentor.findOneAndDelete({ id });
  }
  // Deactivate linked user
  if (mentor?.userId) {
    await User.findByIdAndUpdate(mentor.userId, { status: 'blocked', isDeleted: true });
  }
  return mentor;
};

export const MentorService = {
  createMentorServices,
  getAllMentorsServices,
  getSingleMentorServices,
  updateMentorServices,
  deleteMentorServices,
};