import { ICategory } from "./courseCategory.interface";
import { Category } from "./courseCategory.model";


// CREATE → নতুন category তৈরি করে
const createCategoryServices = async (payload: ICategory): Promise<ICategory> => {
  const newCategory = await Category.create(payload);
  return newCategory;
};

// READ → সব category নিয়ে আসে - ID অনুযায়ী ascending order
const getAllCategoriesServices = async (): Promise<ICategory[]> => {
  const categories = await Category.find({}).sort({ _id: 1 });
  return categories;
};

// READ → একক category আইডি দিয়ে নিয়ে আসে
const getSingleCategoryServices = async (id: number): Promise<ICategory | null> => {
  const category = await Category.findOne({ id });
  return category;
};

// DELETE → মঙ্গোডিবি _id দিয়ে ডিলিট
const deleteCategoryServices = async (id: string): Promise<ICategory | null> => {
  return await Category.findByIdAndDelete(id);
};

// UPDATE → মঙ্গোডিবি _id দিয়ে আপডেট
const updateCategoryServices = async (
  id: string,
  payload: Partial<ICategory>
): Promise<ICategory | null> => {
  return await Category.findByIdAndUpdate(id, payload, { new: true });
};

export const CategoryService = {
  createCategoryServices,
  getAllCategoriesServices,
  getSingleCategoryServices,
  updateCategoryServices,
  deleteCategoryServices,
};
