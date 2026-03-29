/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Enrollment } from '../enrollment/enrollment.model';
import { Course } from '../courses/course.model';
import { User } from '../user/user.model';
import { Certificate } from '../certificate/certificate.model';
import { ClassSchedule } from '../classSchedule/classSchedule.model';
import { Exam, ExamSubmission } from '../exam/exam.model';

// ─── Dashboard Stats ────────────────────────────────────────
const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const [
      totalStudents, totalCourses, totalMentors,
      totalEnrollments, activeEnrollments, pendingPayments,
      totalCertificates, totalClasses,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Course.countDocuments({ isDeleted: false }),
      User.countDocuments({ role: 'mentor' }),
      Enrollment.countDocuments({}),
      Enrollment.countDocuments({ status: 'active' }),
      Enrollment.countDocuments({ paymentStatus: 'pending' }),
      Certificate.countDocuments({ status: 'active', isDeleted: false }),
      ClassSchedule.countDocuments({ isDeleted: false }),
    ]);

    res.json({
      success: true, data: {
        totalStudents, totalCourses, totalMentors,
        totalEnrollments, activeEnrollments, pendingPayments,
        totalCertificates, totalClasses,
      },
    });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── Enrollment Trends (last 12 months) ─────────────────────
const getEnrollmentTrends = async (_req: Request, res: Response) => {
  try {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
      const count = await Enrollment.countDocuments({ createdAt: { $gte: start, $lte: end } });
      months.push({
        month: start.toLocaleDateString('en', { month: 'short', year: '2-digit' }),
        count,
      });
    }
    res.json({ success: true, data: months });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── Revenue by Month ───────────────────────────────────────
const getRevenueByMonth = async (_req: Request, res: Response) => {
  try {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const enrollments = await Enrollment.find({
        paymentStatus: 'paid',
        createdAt: { $gte: start, $lte: end },
      }).populate('courseId', 'fee');

      const revenue = enrollments.reduce((sum, e) => sum + ((e.courseId as any)?.fee || 0), 0);
      months.push({
        month: start.toLocaleDateString('en', { month: 'short', year: '2-digit' }),
        revenue,
      });
    }
    res.json({ success: true, data: months });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── Popular Courses ────────────────────────────────────────
const getPopularCourses = async (_req: Request, res: Response) => {
  try {
    const courses = await Course.find({ isDeleted: false }).select('title image fee');
    const result = await Promise.all(courses.map(async (c) => {
      const count = await Enrollment.countDocuments({ courseId: c._id });
      return { courseId: c._id, title: c.title, image: c.image, fee: c.fee, enrollments: count };
    }));
    result.sort((a, b) => b.enrollments - a.enrollments);
    res.json({ success: true, data: result.slice(0, 10) });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── Revenue Summary ────────────────────────────────────────
const getRevenueSummary = async (_req: Request, res: Response) => {
  try {
    const allPaid = await Enrollment.find({ paymentStatus: 'paid' }).populate('courseId', 'fee');
    const totalRevenue = allPaid.reduce((sum, e) => sum + ((e.courseId as any)?.fee || 0), 0);

    // This month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthPaid = allPaid.filter(e => new Date(e.createdAt as any) >= monthStart);
    const thisMonthRevenue = thisMonthPaid.reduce((sum, e) => sum + ((e.courseId as any)?.fee || 0), 0);

    // Payment method breakdown
    const methods: Record<string, number> = {};
    allPaid.forEach(e => {
      const m = (e as any).paymentMethod || 'other';
      methods[m] = (methods[m] || 0) + ((e.courseId as any)?.fee || 0);
    });

    res.json({
      success: true, data: {
        totalRevenue, thisMonthRevenue,
        totalTransactions: allPaid.length,
        paymentMethods: Object.entries(methods).map(([method, amount]) => ({ method, amount })),
      },
    });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── Student Growth ─────────────────────────────────────────
const getStudentGrowth = async (_req: Request, res: Response) => {
  try {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
      const count = await User.countDocuments({ role: 'student', createdAt: { $lte: end } });
      months.push({
        month: end.toLocaleDateString('en', { month: 'short', year: '2-digit' }),
        count,
      });
    }
    res.json({ success: true, data: months });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
};

export const AnalyticsController = {
  getDashboardStats, getEnrollmentTrends, getRevenueByMonth,
  getPopularCourses, getRevenueSummary, getStudentGrowth,
};
