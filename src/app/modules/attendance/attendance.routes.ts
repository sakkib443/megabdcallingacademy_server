import express from 'express';
import { AttendanceController } from './attendance.controller';
import { authMiddleware, authorize } from '../../middlewares/auth';

const router = express.Router();

// Mentor/Admin: Mark attendance
router.post('/mark', authMiddleware, authorize('mentor', 'admin', 'trainingManager'), AttendanceController.mark);
router.post('/bulk-mark', authMiddleware, authorize('mentor', 'admin', 'trainingManager'), AttendanceController.bulkMark);

// Get attendance for a class
router.get('/class/:classId', authMiddleware, AttendanceController.getClassAttendance);

// Batch report (admin/TM)
router.get('/batch/:batchId/report', authMiddleware, authorize('admin', 'trainingManager', 'mentor'), AttendanceController.getBatchReport);

// Student: My attendance
router.get('/my', authMiddleware, AttendanceController.getStudentAttendance);
router.get('/my/summary', authMiddleware, AttendanceController.getStudentSummary);

export const AttendanceRoutes = router;
