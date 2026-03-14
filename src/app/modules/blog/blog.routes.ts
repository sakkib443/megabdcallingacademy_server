import express from 'express';
import { BlogController } from './blog.controller';

const router = express.Router();

// Create blog
router.post('/create', BlogController.createBlogController);

// Get all blogs
router.get('/', BlogController.getAllBlogsController);

// Get featured blogs
router.get('/featured', BlogController.getFeaturedBlogsController);

// Get blogs by category
router.get('/category/:category', BlogController.getBlogsByCategoryController);

// Get single blog by ID
router.get('/:id', BlogController.getSingleBlogController);

// Update blog by ID
router.patch('/:id', BlogController.updateBlogController);

// Delete blog by ID
router.delete('/:id', BlogController.deleteBlogController);

export const BlogRoutes = router;
