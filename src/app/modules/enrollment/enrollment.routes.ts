import express from 'express';
import { EnrollmentController } from './enrollment.controller';
import { authMiddleware, authorize } from '../../middlewares/auth';

const router = express.Router();

// ── Student Routes ──────────────────────────────────────────
router.post(
  '/enroll',
  authMiddleware,
  authorize('student'),
  EnrollmentController.createEnrollment
);

router.get(
  '/my-enrollments',
  authMiddleware,
  authorize('student'),
  EnrollmentController.getMyEnrollments
);

router.get(
  '/check-access/:courseId',
  authMiddleware,
  EnrollmentController.checkAccess
);

// ── Payment ─────────────────────────────────────────────────
router.post(
  '/verify-payment',
  authMiddleware,
  EnrollmentController.verifyPayment
);

// ── Admin Routes ────────────────────────────────────────────
router.get(
  '/all',
  authMiddleware,
  authorize('admin', 'trainingManager'),
  EnrollmentController.getAllEnrollments
);

router.get(
  '/course/:courseId',
  authMiddleware,
  authorize('admin', 'trainingManager', 'mentor'),
  EnrollmentController.getCourseEnrollments
);

router.post(
  '/admin-enroll',
  authMiddleware,
  authorize('admin', 'trainingManager'),
  EnrollmentController.adminEnroll
);

router.patch(
  '/cancel/:id',
  authMiddleware,
  authorize('admin', 'trainingManager'),
  EnrollmentController.cancelEnrollment
);

router.get(
  '/stats',
  authMiddleware,
  authorize('admin', 'trainingManager'),
  EnrollmentController.getStats
);

export const EnrollmentRoutes = router;
