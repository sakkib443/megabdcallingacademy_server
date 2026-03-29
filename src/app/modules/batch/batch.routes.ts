import { Router } from 'express';
import { BatchController } from './batch.controller';
import { authMiddleware, authorize } from '../../middlewares/auth';

const router = Router();

// Create new batch
router.post('/', authMiddleware, authorize('admin', 'superAdmin', 'trainingManager'), BatchController.createBatchController);

// Get all batches
router.get('/', authMiddleware, BatchController.getAllBatchesController);

// Get batches by course
router.get('/course/:courseId', authMiddleware, BatchController.getBatchesByCourseController);

// Get single batch by ID
router.get('/:id', authMiddleware, BatchController.getBatchByIdController);

// Update batch
router.patch('/:id', authMiddleware, authorize('admin', 'superAdmin', 'trainingManager'), BatchController.updateBatchController);

// Delete batch
router.delete('/:id', authMiddleware, authorize('admin', 'superAdmin'), BatchController.deleteBatchController);

export const BatchRoutes = router;
