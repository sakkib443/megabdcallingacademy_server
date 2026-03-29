/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { EnrollmentService } from './enrollment.service';

// ─── Student: Create enrollment ─────────────────────────────
const createEnrollment = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { courseId, batchId, payment } = req.body;

    const result = await EnrollmentService.createEnrollment({
      studentId: user._id,
      courseId,
      batchId,
      payment,
    });

    res.status(201).json({
      success: true,
      message: 'Enrollment created successfully',
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create enrollment',
    });
  }
};

// ─── Verify payment ─────────────────────────────────────────
const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { enrollmentId, transactionId } = req.body;
    const result = await EnrollmentService.verifyPayment(enrollmentId, transactionId);

    res.status(200).json({
      success: true,
      message: 'Payment verified & enrollment activated',
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Payment verification failed',
    });
  }
};

// ─── Student: My enrollments ────────────────────────────────
const getMyEnrollments = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const result = await EnrollmentService.getStudentEnrollments(user._id);

    res.status(200).json({
      success: true,
      message: 'Enrollments retrieved',
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch enrollments',
    });
  }
};

// ─── Check course access ────────────────────────────────────
const checkAccess = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { courseId } = req.params;
    const result = await EnrollmentService.checkAccess(user._id, courseId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Access check failed',
    });
  }
};

// ─── Admin: Get all enrollments ─────────────────────────────
const getAllEnrollments = async (req: Request, res: Response) => {
  try {
    const { status, page, limit } = req.query;
    const result = await EnrollmentService.getAllEnrollments({
      status: status as string,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    });

    res.status(200).json({
      success: true,
      message: 'All enrollments retrieved',
      data: result.enrollments,
      meta: result.meta,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch enrollments',
    });
  }
};

// ─── Admin: Course enrollments ──────────────────────────────
const getCourseEnrollments = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const result = await EnrollmentService.getCourseEnrollments(courseId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch course enrollments',
    });
  }
};

// ─── Cancel enrollment ──────────────────────────────────────
const cancelEnrollment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await EnrollmentService.cancelEnrollment(id);

    res.status(200).json({
      success: true,
      message: 'Enrollment cancelled',
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to cancel enrollment',
    });
  }
};

// ─── Admin: Manual enroll ───────────────────────────────────
const adminEnroll = async (req: Request, res: Response) => {
  try {
    const { studentId, courseId, batchId } = req.body;
    const result = await EnrollmentService.adminEnroll({ studentId, courseId, batchId });

    res.status(201).json({
      success: true,
      message: 'Student enrolled manually',
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to enroll student',
    });
  }
};

// ─── Enrollment stats ───────────────────────────────────────
const getStats = async (req: Request, res: Response) => {
  try {
    const result = await EnrollmentService.getStats();

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch stats',
    });
  }
};

export const EnrollmentController = {
  createEnrollment,
  verifyPayment,
  getMyEnrollments,
  checkAccess,
  getAllEnrollments,
  getCourseEnrollments,
  cancelEnrollment,
  adminEnroll,
  getStats,
};
