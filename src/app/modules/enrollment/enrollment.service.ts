import { Enrollment } from './enrollment.model';
import { Course } from '../courses/course.model';

// ─── Create Enrollment (after payment) ──────────────────────
const createEnrollment = async (payload: {
  studentId: string;
  courseId: string;
  batchId?: string;
  payment: {
    amount: number;
    method: 'bkash' | 'sslcommerz' | 'manual' | 'free';
    transactionId?: string;
  };
}) => {
  // Check if already enrolled
  const existing = await Enrollment.findOne({
    studentId: payload.studentId,
    courseId: payload.courseId,
    isDeleted: false,
  });

  if (existing && existing.status === 'active') {
    throw new Error('Already enrolled in this course');
  }

  // If there's an existing cancelled/expired enrollment, update it
  if (existing) {
    existing.status = 'pending';
    existing.payment = {
      ...payload.payment,
      status: payload.payment.method === 'free' ? 'paid' : 'pending',
      paidAt: payload.payment.method === 'free' ? new Date() : undefined,
    } as any;
    await existing.save();
    return existing;
  }

  const enrollment = await Enrollment.create({
    studentId: payload.studentId,
    courseId: payload.courseId,
    batchId: payload.batchId,
    status: payload.payment.method === 'free' ? 'active' : 'pending',
    payment: {
      amount: payload.payment.amount,
      method: payload.payment.method,
      transactionId: payload.payment.transactionId,
      status: payload.payment.method === 'free' ? 'paid' : 'pending',
      paidAt: payload.payment.method === 'free' ? new Date() : undefined,
    },
  });

  // Update course's enrolled count
  if (enrollment.status === 'active') {
    await Course.findByIdAndUpdate(payload.courseId, {
      $inc: { totalStudentsEnroll: 1 },
    });
  }

  return enrollment;
};

// ─── Verify Payment & Activate ──────────────────────────────
const verifyPayment = async (transactionOrId: string, verifiedTrxId: string) => {
  // Try to find by transactionId first, then by _id
  let enrollment = await Enrollment.findOne({
    'payment.transactionId': transactionOrId,
    isDeleted: false,
  });
  if (!enrollment) {
    enrollment = await Enrollment.findById(transactionOrId);
  }
  if (!enrollment) throw new Error('Enrollment not found');

  enrollment.payment.status = 'paid';
  enrollment.payment.transactionId = verifiedTrxId || transactionOrId;
  enrollment.payment.paidAt = new Date();
  enrollment.status = 'active';

  // ── Batch Auto-Assign ──────────────────────────────────
  if (!enrollment.batchId) {
    try {
      const { Batch } = await import('../batch/batch.model');
      const course = await Course.findById(enrollment.courseId);
      if (course) {
        // Find an active or upcoming batch for this course
        const availableBatch = await Batch.findOne({
          courseName: course.title,
          status: { $in: ['active', 'upcoming'] },
          isDeleted: false,
        }).sort({ startDate: 1 });

        if (availableBatch) {
          enrollment.batchId = availableBatch._id;
        }
      }
    } catch (batchErr) {
      console.error('Batch auto-assign failed (non-blocking):', batchErr);
    }
  }

  await enrollment.save();

  // Update course enrolled count
  await Course.findByIdAndUpdate(enrollment.courseId, {
    $inc: { totalStudentsEnroll: 1 },
  });

  return enrollment;
};



// ─── Get Student Enrollments ────────────────────────────────
const getStudentEnrollments = async (studentId: string) => {
  const enrollments = await Enrollment.find({ studentId, isDeleted: false })
    .populate('courseId', 'title image slug fee type durationMonth lectures')
    .populate('batchId', 'name')
    .sort({ createdAt: -1 });
  return enrollments;
};

// ─── Get Course Enrollments (Admin) ─────────────────────────
const getCourseEnrollments = async (courseId: string) => {
  const enrollments = await Enrollment.find({ courseId, isDeleted: false })
    .populate('studentId', 'firstName lastName email phoneNumber')
    .populate('batchId', 'name')
    .sort({ createdAt: -1 });
  return enrollments;
};

// ─── Check if Student has Active Enrollment ─────────────────
const checkAccess = async (studentId: string, courseId: string) => {
  const enrollment = await Enrollment.findOne({
    studentId,
    courseId,
    status: 'active',
    isDeleted: false,
  });
  return { hasAccess: !!enrollment, enrollment };
};

// ─── Get All Enrollments (Admin) ────────────────────────────
const getAllEnrollments = async (query: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const { status, page = 1, limit = 20 } = query;
  const filter: any = { isDeleted: false };
  if (status) filter.status = status;

  const total = await Enrollment.countDocuments(filter);
  const enrollments = await Enrollment.find(filter)
    .populate('studentId', 'firstName lastName email phoneNumber')
    .populate('courseId', 'title image slug fee')
    .populate('batchId', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    enrollments,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// ─── Cancel Enrollment ──────────────────────────────────────
const cancelEnrollment = async (enrollmentId: string) => {
  const enrollment = await Enrollment.findByIdAndUpdate(
    enrollmentId,
    { status: 'cancelled' },
    { new: true }
  );
  if (!enrollment) throw new Error('Enrollment not found');
  return enrollment;
};

// ─── Admin: Manual Enroll ───────────────────────────────────
const adminEnroll = async (payload: {
  studentId: string;
  courseId: string;
  batchId?: string;
}) => {
  return createEnrollment({
    ...payload,
    payment: { amount: 0, method: 'manual' },
  });
};

// ─── Get Enrollment Stats ───────────────────────────────────
const getStats = async () => {
  const [total, active, pending, cancelled, pendingPayment] = await Promise.all([
    Enrollment.countDocuments({ isDeleted: false }),
    Enrollment.countDocuments({ status: 'active', isDeleted: false }),
    Enrollment.countDocuments({ status: 'pending', isDeleted: false }),
    Enrollment.countDocuments({ status: 'cancelled', isDeleted: false }),
    Enrollment.countDocuments({ 'payment.status': 'pending', isDeleted: false }),
  ]);

  // Revenue calculation
  const revenueResult = await Enrollment.aggregate([
    { $match: { 'payment.status': 'paid', isDeleted: false } },
    { $group: { _id: null, totalRevenue: { $sum: '$payment.amount' } } },
  ]);

  return {
    total,
    active,
    pending,
    cancelled,
    pendingPayment,
    totalRevenue: revenueResult[0]?.totalRevenue || 0,
  };
};


export const EnrollmentService = {
  createEnrollment,
  verifyPayment,
  getStudentEnrollments,
  getCourseEnrollments,
  checkAccess,
  getAllEnrollments,
  cancelEnrollment,
  adminEnroll,
  getStats,
};
