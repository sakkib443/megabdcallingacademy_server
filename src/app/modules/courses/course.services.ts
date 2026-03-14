import { Course } from './course.model';
import { ICourse } from './course.interface';



// CREATE → নতুন কোর্স তৈরি করার সার্ভিস
const createCourseServices = async (payload: ICourse): Promise<ICourse> => {


  // ৩. যদি mentor ও category উভয়টাই থাকে, তাহলে কোর্স তৈরি করা হবে
  const newCourse = await Course.create(payload);
  return newCourse;
};


// READ → সব কোর্স রিটার্ন করে (mentor ও category সহ) - ID অনুযায়ী ascending order
const getAllCoursesServices = async (): Promise<ICourse[]> => {
  const courses = await Course.find({}).sort({ _id: 1 });
  return courses;
};


const getSingleCourseServices = async (id: string) => {
  return await Course.findById(id).populate('mentor').populate('category');
};

const updateCourseServices = async (id: string, payload: any) => {
  return await Course.findByIdAndUpdate(id, payload, { new: true });
};

// DELETE → নির্দিষ্ট কোর্স ডিলিট করার সার্ভিস
// CourseService.ts
const deleteCourseServices = async (id: string): Promise<ICourse | null> => {
  // findOneAndDelete({id}) এর বদলে findByIdAndDelete ব্যবহার করুন
  const deletedCourse = await Course.findByIdAndDelete(id)
    .populate('mentor')
    .populate('category');
  return deletedCourse;
};


// সব সার্ভিস এক্সপোর্ট করা হচ্ছে
export const CourseService = {
  createCourseServices,
  getAllCoursesServices,
  getSingleCourseServices,
  updateCourseServices,
  deleteCourseServices,
};
