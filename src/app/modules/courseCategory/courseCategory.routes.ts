import express from 'express';
import { CategoryController } from './courseCategory.controller';
import validateRequest from '../../middlewares/validateRequest';
import { categoryValidationSchema } from './courseCategory.validation';


const router = express.Router();


router.post('/create-category',validateRequest(categoryValidationSchema), CategoryController.createCategoryController);
router.get('/', CategoryController.getAllCategoriesController);
router.get('/:id', CategoryController.getSingleCategoryController);
router.patch('/:id', CategoryController.updateCategoryController);
router.delete('/:id', CategoryController.deleteCategoryController);

export const CategoryRoutes = router;
