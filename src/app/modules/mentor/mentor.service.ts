import { TMentor } from './mentor.interface';
import { Mentor } from './mentor.model';

// CREATE
const createMentorServices = async (payload: TMentor) => {
  const result = await Mentor.create(payload);
  return result;
};

// READ ALL - ID অনুযায়ী ascending order
const getAllMentorsServices = async () => {
  return await Mentor.find().sort({ _id: 1 });
};

// READ SINGLE (এখানে পরিবর্তন করা হয়েছে)
const getSingleMentorServices = async (id: string): Promise<TMentor | null> => {
  // id এর বদলে findById(id) ব্যবহার করুন যা MongoDB _id দিয়ে খুঁজবে
  return await Mentor.findById(id);
};

// UPDATE (এখানে পরিবর্তন করা হয়েছে)
const updateMentorServices = async (
  id: string,
  payload: Partial<TMentor>
): Promise<TMentor | null> => {
  // findOneAndUpdate({id}) এর বদলে findByIdAndUpdate(id)
  return await Mentor.findByIdAndUpdate(id, payload, { new: true });
};

// DELETE (এখানে পরিবর্তন করা হয়েছে)
const deleteMentorServices = async (id: string): Promise<TMentor | null> => {
  // findOneAndDelete({id}) এর বদলে findByIdAndDelete(id)
  return await Mentor.findByIdAndDelete(id);
};

export const MentorService = {
  createMentorServices,
  getAllMentorsServices,
  getSingleMentorServices,
  updateMentorServices,
  deleteMentorServices,
};