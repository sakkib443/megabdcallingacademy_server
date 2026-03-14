import { Router } from 'express';
import { BatchController } from './batch.controller';

const router = Router();

// Create new batch
router.post('/', BatchController.createBatchController);

// Get all batches
router.get('/', BatchController.getAllBatchesController);

// Get single batch by ID
router.get('/:id', BatchController.getBatchByIdController);

// Update batch
router.patch('/:id', BatchController.updateBatchController);

// Delete batch
router.delete('/:id', BatchController.deleteBatchController);

export const BatchRoutes = router;
