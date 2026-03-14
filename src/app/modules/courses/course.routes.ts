import express from 'express';
import { CourseController } from './course.controller';
import validateRequest from '../../middlewares/validateRequest';
import { courseValidationSchema } from './course.validation';

const router = express.Router();

router.post('/create-course',validateRequest(courseValidationSchema), CourseController.createCourseController);
router.get('/', CourseController.getAllCoursesController);
router.get('/:id', CourseController.getSingleCourseController);
router.patch('/:id', CourseController.updateCourseController);
router.delete('/:id', CourseController.deleteCourseController);

export const CourseRoutes = router;
