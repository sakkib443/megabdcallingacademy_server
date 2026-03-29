import { Router } from 'express';
import { BatchController } from './batch.controller';
import { authMiddleware, authorize } from '../../middlewares/auth';

const router = Router();

// Create new batch (admin only)
router.post('/', authMiddleware, authorize('admin', 'superAdmin', 'trainingManager'), BatchController.createBatchController);

// Get all batches (no auth needed for reading)
router.get('/', BatchController.getAllBatchesController);

// Get batches by course
router.get('/course/:courseId', BatchController.getBatchesByCourseController);

// Get single batch by ID
router.get('/:id', BatchController.getBatchByIdController);

// Update batch (admin only)
router.patch('/:id', authMiddleware, authorize('admin', 'superAdmin', 'trainingManager'), BatchController.updateBatchController);

// Delete batch (admin only)
router.delete('/:id', authMiddleware, authorize('admin', 'superAdmin'), BatchController.deleteBatchController);

export const BatchRoutes = router;
