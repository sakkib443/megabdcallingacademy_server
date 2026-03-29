import express from 'express';
import { AnalyticsController } from './analytics.controller';
import { authMiddleware, authorize } from '../../middlewares/auth';

const router = express.Router();

router.get('/dashboard', authMiddleware, authorize('admin', 'trainingManager'), AnalyticsController.getDashboardStats);
router.get('/enrollment-trends', authMiddleware, authorize('admin', 'trainingManager'), AnalyticsController.getEnrollmentTrends);
router.get('/revenue-by-month', authMiddleware, authorize('admin'), AnalyticsController.getRevenueByMonth);
router.get('/popular-courses', authMiddleware, authorize('admin', 'trainingManager'), AnalyticsController.getPopularCourses);
router.get('/revenue-summary', authMiddleware, authorize('admin'), AnalyticsController.getRevenueSummary);
router.get('/student-growth', authMiddleware, authorize('admin', 'trainingManager'), AnalyticsController.getStudentGrowth);

export const AnalyticsRoutes = router;
