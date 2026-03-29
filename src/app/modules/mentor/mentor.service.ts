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

// READ SINGLE - supports both MongoDB _id and custom id
const getSingleMentorServices = async (id: string): Promise<TMentor | null> => {
  const mongoose = await import('mongoose');
  if (mongoose.default.Types.ObjectId.isValid(id) && id.length === 24) {
    const result = await Mentor.findById(id);
    if (result) return result;
  }
  return await Mentor.findOne({ id });
};

// UPDATE - supports both _id and custom id
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

// DELETE - supports both _id and custom id
const deleteMentorServices = async (id: string): Promise<TMentor | null> => {
  const mongoose = await import('mongoose');
  if (mongoose.default.Types.ObjectId.isValid(id) && id.length === 24) {
    const result = await Mentor.findByIdAndDelete(id);
    if (result) return result;
  }
  return await Mentor.findOneAndDelete({ id });
};

export const MentorService = {
  createMentorServices,
  getAllMentorsServices,
  getSingleMentorServices,
  updateMentorServices,
  deleteMentorServices,
};