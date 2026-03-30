/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Enrollment } from '../enrollment/enrollment.model';
import { Course } from '../courses/course.model';
import { User } from '../user/user.model';
import { Certificate } from '../certificate/certificate.model';
import { ClassSchedule } from '../classSchedule/classSchedule.model';
import { Exam, ExamSubmission } from '../exam/exam.model';
import { Batch } from '../batch/batch.model';

// ─── Helper: Parse date range from query ────────────────────
const getDateRange = (req: Request) => {
  const { startDate, endDate } = req.query;
  const filter: any = {};
  if (startDate) filter.$gte = new Date(startDate as string);
  if (endDate) {
    const end = new Date(endDate as string);
    end.setHours(23, 59, 59, 999);
    filter.$lte = end;
  }
  return Object.keys(filter).length > 0 ? filter : null;
};

// ─── Helper: Get month range ────────────────────────────────
const getMonthRange = (year: number, month: number) => {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

// ─── Dashboard Stats (supports date filter) ─────────────────
const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const dateRange = getDateRange(req);
    const dateFilter = dateRange ? { createdAt: dateRange } : {};

    const [
      totalStudents, totalCourses, totalMentors,
      totalEnrollments, activeEnrollments, pendingPayments,
      totalCertificates, totalClasses,
    ] = await Promise.all([
      User.countDocuments({ role: 'student', ...dateFilter }),
      Course.countDocuments({ isDeleted: false, ...dateFilter }),
      User.countDocuments({ role: 'mentor', ...dateFilter }),
      Enrollment.countDocuments(dateFilter),
      Enrollment.countDocuments({ status: 'active', ...dateFilter }),
      Enrollment.countDocuments({ paymentStatus: 'pending', ...dateFilter }),
      Certificate.countDocuments({ status: 'active', isDeleted: false, ...dateFilter }),
      ClassSchedule.countDocuments({ isDeleted: false, ...dateFilter }),
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

// ─── Monthly Dashboard (for Dashboard Home) ─────────────────
const getMonthlyDashboard = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const year = parseInt(req.query.year as string) || now.getFullYear();
    const month = parseInt(req.query.month as string) ?? now.getMonth();
    const monthIdx = month >= 0 && month <= 11 ? month : now.getMonth();

    const { start: currentStart, end: currentEnd } = getMonthRange(year, monthIdx);
    // Previous month
    const prevDate = new Date(year, monthIdx - 1, 1);
    const { start: prevStart, end: prevEnd } = getMonthRange(prevDate.getFullYear(), prevDate.getMonth());

    const currentFilter = { createdAt: { $gte: currentStart, $lte: currentEnd } };
    const prevFilter = { createdAt: { $gte: prevStart, $lte: prevEnd } };

    const [
      // Current month
      newStudents, newEnrollments, pendingOrders,
      currentPaidEnrollments, newBatches, newCourses,
      // Previous month
      prevStudents, prevEnrollments, prevPendingOrders,
      prevPaidEnrollments, prevBatches, prevCourses,
    ] = await Promise.all([
      // Current
      User.countDocuments({ role: 'student', ...currentFilter }),
      Enrollment.countDocuments(currentFilter),
      Enrollment.countDocuments({ paymentStatus: 'pending', ...currentFilter }),
      Enrollment.find({ paymentStatus: 'paid', ...currentFilter }).populate('courseId', 'fee'),
      Batch.countDocuments(currentFilter),
      Course.countDocuments({ isDeleted: false, ...currentFilter }),
      // Previous
      User.countDocuments({ role: 'student', ...prevFilter }),
      Enrollment.countDocuments(prevFilter),
      Enrollment.countDocuments({ paymentStatus: 'pending', ...prevFilter }),
      Enrollment.find({ paymentStatus: 'paid', ...prevFilter }).populate('courseId', 'fee'),
      Batch.countDocuments(prevFilter),
      Course.countDocuments({ isDeleted: false, ...prevFilter }),
    ]);

    const currentRevenue = currentPaidEnrollments.reduce((sum, e) => sum + ((e.courseId as any)?.fee || 0), 0);
    const prevRevenue = prevPaidEnrollments.reduce((sum, e) => sum + ((e.courseId as any)?.fee || 0), 0);

    const calcChange = (current: number, prev: number) => {
      if (prev === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - prev) / prev) * 100);
    };

    res.json({
      success: true,
      data: {
        period: { year, month: monthIdx, label: currentStart.toLocaleDateString('en', { month: 'long', year: 'numeric' }) },
        current: {
          newStudents,
          newEnrollments,
          pendingOrders,
          revenue: currentRevenue,
          paidOrders: currentPaidEnrollments.length,
          newBatches,
          newCourses,
        },
        changes: {
          students: calcChange(newStudents, prevStudents),
          enrollments: calcChange(newEnrollments, prevEnrollments),
          pendingOrders: calcChange(pendingOrders, prevPendingOrders),
          revenue: calcChange(currentRevenue, prevRevenue),
          batches: calcChange(newBatches, prevBatches),
          courses: calcChange(newCourses, prevCourses),
        },
        previous: {
          newStudents: prevStudents,
          newEnrollments: prevEnrollments,
          pendingOrders: prevPendingOrders,
          revenue: prevRevenue,
          paidOrders: prevPaidEnrollments.length,
          newBatches: prevBatches,
          newCourses: prevCourses,
        },
      },
    });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── Enrollment Trends (supports date filter) ───────────────
const getEnrollmentTrends = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    let rangeStart: Date, rangeEnd: Date;

    if (startDate && endDate) {
      rangeStart = new Date(startDate as string);
      rangeEnd = new Date(endDate as string);
      rangeEnd.setHours(23, 59, 59, 999);
    } else {
      rangeEnd = new Date();
      rangeStart = new Date();
      rangeStart.setMonth(rangeStart.getMonth() - 11);
      rangeStart.setDate(1);
      rangeStart.setHours(0, 0, 0, 0);
    }

    const months = [];
    const cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
    const endMonth = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth() + 1, 0);

    while (cursor <= endMonth) {
      const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
      const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59);
      const count = await Enrollment.countDocuments({ createdAt: { $gte: start, $lte: end } });
      months.push({
        month: start.toLocaleDateString('en', { month: 'short', year: '2-digit' }),
        count,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    res.json({ success: true, data: months });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── Revenue by Month (supports date filter) ────────────────
const getRevenueByMonth = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    let rangeStart: Date, rangeEnd: Date;

    if (startDate && endDate) {
      rangeStart = new Date(startDate as string);
      rangeEnd = new Date(endDate as string);
      rangeEnd.setHours(23, 59, 59, 999);
    } else {
      rangeEnd = new Date();
      rangeStart = new Date();
      rangeStart.setMonth(rangeStart.getMonth() - 11);
      rangeStart.setDate(1);
      rangeStart.setHours(0, 0, 0, 0);
    }

    const months = [];
    const cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
    const endMonth = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth() + 1, 0);

    while (cursor <= endMonth) {
      const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
      const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59);

      const enrollments = await Enrollment.find({
        paymentStatus: 'paid',
        createdAt: { $gte: start, $lte: end },
      }).populate('courseId', 'fee');

      const revenue = enrollments.reduce((sum, e) => sum + ((e.courseId as any)?.fee || 0), 0);
      months.push({
        month: start.toLocaleDateString('en', { month: 'short', year: '2-digit' }),
        revenue,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    res.json({ success: true, data: months });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── Popular Courses (supports date filter) ─────────────────
const getPopularCourses = async (req: Request, res: Response) => {
  try {
    const dateRange = getDateRange(req);
    const dateFilter = dateRange ? { createdAt: dateRange } : {};

    const courses = await Course.find({ isDeleted: false }).select('title image fee');
    const result = await Promise.all(courses.map(async (c) => {
      const count = await Enrollment.countDocuments({ courseId: c._id, ...dateFilter });
      return { courseId: c._id, title: c.title, image: c.image, fee: c.fee, enrollments: count };
    }));
    result.sort((a, b) => b.enrollments - a.enrollments);
    res.json({ success: true, data: result.slice(0, 10) });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── Revenue Summary (supports date filter) ─────────────────
const getRevenueSummary = async (req: Request, res: Response) => {
  try {
    const dateRange = getDateRange(req);
    const dateFilter = dateRange ? { createdAt: dateRange } : {};

    const allPaid = await Enrollment.find({ paymentStatus: 'paid', ...dateFilter }).populate('courseId', 'fee');
    const totalRevenue = allPaid.reduce((sum, e) => sum + ((e.courseId as any)?.fee || 0), 0);

    // This month (within filtered range or overall)
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
        isFiltered: !!dateRange,
      },
    });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── Student Growth (supports date filter) ──────────────────
const getStudentGrowth = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    let rangeStart: Date, rangeEnd: Date;

    if (startDate && endDate) {
      rangeStart = new Date(startDate as string);
      rangeEnd = new Date(endDate as string);
      rangeEnd.setHours(23, 59, 59, 999);
    } else {
      rangeEnd = new Date();
      rangeStart = new Date();
      rangeStart.setMonth(rangeStart.getMonth() - 11);
      rangeStart.setDate(1);
      rangeStart.setHours(0, 0, 0, 0);
    }

    const months = [];
    const cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
    const endMonth = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth() + 1, 0);

    while (cursor <= endMonth) {
      const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59);
      const count = await User.countDocuments({ role: 'student', createdAt: { $lte: end } });
      months.push({
        month: end.toLocaleDateString('en', { month: 'short', year: '2-digit' }),
        count,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    res.json({ success: true, data: months });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── Daily Sales for a specific month ───────────────────────
const getDailySales = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const year = parseInt(req.query.year as string) || now.getFullYear();
    const month = parseInt(req.query.month as string) ?? now.getMonth();
    const monthIdx = month >= 0 && month <= 11 ? month : now.getMonth();

    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
    const dailyData = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStart = new Date(year, monthIdx, day, 0, 0, 0, 0);
      const dayEnd = new Date(year, monthIdx, day, 23, 59, 59, 999);
      const count = await Enrollment.countDocuments({
        createdAt: { $gte: dayStart, $lte: dayEnd },
      });
      dailyData.push({ day, count });
    }

    res.json({ success: true, data: dailyData });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── Enrollment Distribution by Course Type (Online/Offline/Recorded) ─
const getTypeDistribution = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const year = parseInt(req.query.year as string) || now.getFullYear();
    const month = parseInt(req.query.month as string) ?? now.getMonth();
    const monthIdx = month >= 0 && month <= 11 ? month : now.getMonth();

    const start = new Date(year, monthIdx, 1);
    const end = new Date(year, monthIdx + 1, 0, 23, 59, 59, 999);

    // Get enrollments for the month with course data
    const enrollments = await Enrollment.find({
      createdAt: { $gte: start, $lte: end },
    }).populate('courseId', 'type');

    const typeCounts: Record<string, number> = {};
    enrollments.forEach(e => {
      const courseType = (e.courseId as any)?.type || 'Other';
      // Normalize type names
      const normalized = courseType.charAt(0).toUpperCase() + courseType.slice(1).toLowerCase();
      typeCounts[normalized] = (typeCounts[normalized] || 0) + 1;
    });

    const data = Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      data,
      total: enrollments.length,
    });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
};

// ─── Batch Overview (upcoming, running, completed + enrollment counts) ──
const getBatchOverview = async (req: Request, res: Response) => {
  try {
    const now = new Date();

    // Get all non-deleted batches
    const allBatches = await Batch.find({ isDeleted: { $ne: true } })
      .populate('courseId', 'title image type fee')
      .populate('mentorId', 'name image designation')
      .sort({ startDate: 1 })
      .lean();

    // Categorize
    const upcoming: any[] = [];
    const running: any[] = [];
    const completed: any[] = [];

    for (const batch of allBatches) {
      const start = new Date(batch.startDate);
      const end = new Date(batch.endDate);

      // Count enrollments for this batch
      const enrollCount = await Enrollment.countDocuments({ batchId: batch._id });

      const batchData = {
        ...batch,
        enrolledStudents: enrollCount,
        seatsFilled: batch.maxStudents ? Math.round((enrollCount / batch.maxStudents) * 100) : 0,
      };

      if (batch.status === 'completed' || end < now) {
        completed.push(batchData);
      } else if (batch.status === 'active' || (start <= now && end >= now)) {
        running.push(batchData);
      } else {
        upcoming.push(batchData);
      }
    }

    res.json({
      success: true,
      data: {
        summary: {
          total: allBatches.length,
          upcoming: upcoming.length,
          running: running.length,
          completed: completed.length,
        },
        upcoming,
        running,
        completed,
      },
    });
  } catch (e: any) { res.status(500).json({ success: false, message: e.message }); }
};

export const AnalyticsController = {
  getDashboardStats, getMonthlyDashboard, getEnrollmentTrends, getRevenueByMonth,
  getPopularCourses, getRevenueSummary, getStudentGrowth, getDailySales, getTypeDistribution,
  getBatchOverview,
};
