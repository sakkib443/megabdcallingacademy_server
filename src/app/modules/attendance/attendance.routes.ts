import express from 'express';
import { AttendanceController } from './attendance.controller';
import { authMiddleware, authorize } from '../../middlewares/auth';

const router = express.Router();

// Take/Update attendance
router.post('/', authMiddleware, authorize('mentor', 'admin'), AttendanceController.takeAttendance);

// Get attendance by batch + date
router.get('/', authMiddleware, AttendanceController.getByDate);

// Get attendance history for a batch
router.get('/history/:batchId', authMiddleware, AttendanceController.getHistory);

// Get attendance stats for a batch
router.get('/stats/:batchId', authMiddleware, AttendanceController.getStats);

// Delete attendance
router.delete('/:id', authMiddleware, authorize('mentor', 'admin'), AttendanceController.deleteAttendance);

export const AttendanceRoutes = router;
