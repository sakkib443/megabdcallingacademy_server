import express from 'express';
import { ClassScheduleController } from './classSchedule.controller';
import { authMiddleware, authorize } from '../../middlewares/auth';

const router = express.Router();

// ── Student routes (BEFORE /:id) ─────────────────────────
router.get('/student/schedule', authMiddleware, ClassScheduleController.studentSchedule);
router.get('/student/today', authMiddleware, ClassScheduleController.todayClasses);

// ── Mentor routes (BEFORE /:id) ──────────────────────────
router.get('/mentor/my-classes', authMiddleware, authorize('mentor'), ClassScheduleController.myClasses);

// ── Admin / Training Manager routes ──────────────────────
router.post('/', authMiddleware, authorize('admin', 'trainingManager', 'mentor'), ClassScheduleController.create);
router.get('/all', authMiddleware, authorize('admin', 'trainingManager'), ClassScheduleController.getAll);
router.get('/stats', authMiddleware, authorize('admin', 'trainingManager'), ClassScheduleController.stats);

// ── Parameterized routes (AFTER named routes) ────────────
router.get('/:id', authMiddleware, ClassScheduleController.getOne);
router.patch('/:id', authMiddleware, authorize('admin', 'trainingManager', 'mentor'), ClassScheduleController.update);
router.delete('/:id', authMiddleware, authorize('admin', 'trainingManager'), ClassScheduleController.remove);

// ── Mentor actions on specific class ─────────────────────
router.patch('/:id/recording', authMiddleware, authorize('mentor', 'admin'), ClassScheduleController.uploadRecording);
router.post('/:id/material', authMiddleware, authorize('mentor', 'admin'), ClassScheduleController.addMaterial);
router.delete('/:id/material/:index', authMiddleware, authorize('mentor', 'admin'), ClassScheduleController.removeMaterial);

export const ClassScheduleRoutes = router;
