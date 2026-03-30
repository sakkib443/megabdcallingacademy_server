import { Enrollment } from './enrollment.model';
import { Course } from '../courses/course.model';
import { User } from '../user/user.model';
import { NotificationService } from '../notification/notification.service';

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

  // ── Helper: Send admin notification ──────────────────────
  const notifyAdmins = async () => {
    try {
      const [student, course] = await Promise.all([
        User.findById(payload.studentId).select('firstName lastName name').lean(),
        Course.findById(payload.courseId).select('title').lean(),
      ]);
      const studentName = student
        ? `${(student as any).firstName || (student as any).name || 'Student'} ${(student as any).lastName || ''}`.trim()
        : 'Unknown Student';
      const courseName = (course as any)?.title || 'Unknown Course';
      console.log(`📢 Sending admin notification: ${studentName} ordered ${courseName}`);
      await NotificationService.triggerNewOrderForAdmins(
        studentName,
        courseName,
        payload.payment.amount,
        payload.payment.method,
      );
      console.log('✅ Admin notification sent successfully');
    } catch (notifErr) {
      console.error('❌ Admin notification (new order) failed:', notifErr);
    }
  };

  // If there's an existing cancelled/expired enrollment, update it
  if (existing) {
    existing.status = 'pending';
    existing.payment = {
      ...payload.payment,
      status: payload.payment.method === 'free' ? 'paid' : 'pending',
      paidAt: payload.payment.method === 'free' ? new Date() : undefined,
    } as any;
    await existing.save();
    // Notify admins about re-enrollment too
    await notifyAdmins();
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

  // ── Notify admins about new order ───────
  await notifyAdmins();

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
  includeDeleted?: boolean;
}) => {
  const { status, page = 1, limit = 20, includeDeleted = false } = query;
  const filter: any = {};
  if (!includeDeleted) {
    filter.isDeleted = false;
  }
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

// ─── Approve Enrollment (Admin) ─────────────────────────────
const approveEnrollment = async (enrollmentId: string) => {
  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment) throw new Error('Enrollment not found');
  if (enrollment.status === 'active') throw new Error('Already active');

  enrollment.status = 'active';
  enrollment.payment.status = 'paid';
  enrollment.payment.paidAt = new Date();

  // Auto-assign batch if not already assigned
  if (!enrollment.batchId) {
    try {
      const { Batch } = await import('../batch/batch.model');
      const course = await Course.findById(enrollment.courseId);
      if (course) {
        const availableBatch = await Batch.findOne({
          courseName: course.title,
          status: { $in: ['active', 'upcoming'] },
          isDeleted: false,
        }).sort({ startDate: 1 });
        if (availableBatch) {
          enrollment.batchId = availableBatch._id;
        }
      }
    } catch (e) {
      console.error('Batch auto-assign failed:', e);
    }
  }

  await enrollment.save();

  await Course.findByIdAndUpdate(enrollment.courseId, {
    $inc: { totalStudentsEnroll: 1 },
  });

  return enrollment;
};

// ─── Get Student Payment History ────────────────────────────
const getStudentPayments = async (studentId: string) => {
  const enrollments = await Enrollment.find({ studentId, isDeleted: false })
    .populate('courseId', 'title image slug fee type')
    .sort({ createdAt: -1 });

  // Also fetch installments
  let installments: any[] = [];
  try {
    const { Installment } = await import('../installment/installment.model');
    installments = await Installment.find({ studentId, isDeleted: false })
      .populate('courseId', 'title')
      .sort({ dueDate: 1 });
  } catch (e) {
    console.error('Installment fetch failed:', e);
  }

  return { enrollments, installments };
};


// ─── Mentor: Get students in mentor's batches ──────────────
const getMentorStudents = async (userId: string) => {
  // Find mentor by userId
  const { Mentor } = await import('../mentor/mentor.model');
  const { Batch } = await import('../batch/batch.model');
  const mentor = await Mentor.findOne({ userId });
  if (!mentor) return { students: [], batches: [] };

  // Find all batches assigned to this mentor
  const mentorBatches = await Batch.find({ mentorId: mentor._id, isDeleted: false })
    .populate('courseId', 'title image type')
    .lean();

  if (mentorBatches.length === 0) return { students: [], batches: mentorBatches };

  const batchIds = mentorBatches.map(b => b._id);

  // Find all enrollments in those batches
  const students = await Enrollment.find({
    batchId: { $in: batchIds },
    isDeleted: false,
  })
    .populate('studentId', 'firstName lastName name email phoneNumber')
    .populate('courseId', 'title image slug fee')
    .populate('batchId', 'id name courseName classTime classDays')
    .sort({ createdAt: -1 })
    .lean();

  return { students, batches: mentorBatches };
};


// ─── Admin: Transfer student to another course ────────────
const transferCourse = async (enrollmentId: string, newCourseId: string, newBatchId?: string) => {
  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment) throw new Error('Enrollment not found');

  const oldCourseId = enrollment.courseId;
  
  // Check if student already enrolled in new course
  const existing = await Enrollment.findOne({
    studentId: enrollment.studentId,
    courseId: newCourseId,
    isDeleted: false,
    status: { $in: ['active', 'pending'] },
  });
  if (existing) throw new Error('Student is already enrolled in the target course');

  // Update enrollment to new course
  enrollment.courseId = newCourseId as any;
  enrollment.batchId = newBatchId ? (newBatchId as any) : undefined;
  enrollment.completionPercent = 0;
  enrollment.studentStatus = 'active';
  await enrollment.save();

  // Update old course count
  await Course.findByIdAndUpdate(oldCourseId, { $inc: { totalStudentsEnroll: -1 } });
  // Update new course count
  await Course.findByIdAndUpdate(newCourseId, { $inc: { totalStudentsEnroll: 1 } });

  return enrollment;
};

// ─── Soft-delete Enrollment (from Enrollments page) ────────
// Sets enrollment status to 'deleted' so Orders page shows "Deleted" status
const softDeleteEnrollment = async (enrollmentId: string) => {
  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment) throw new Error('Enrollment not found');

  // Decrease course enrolled count if it was active
  if (enrollment.status === 'active') {
    await Course.findByIdAndUpdate(enrollment.courseId, {
      $inc: { totalStudentsEnroll: -1 },
    });
  }

  enrollment.status = 'deleted' as any;
  enrollment.isDeleted = true;
  await enrollment.save();

  return enrollment;
};

// ─── Hard-delete Order (from Orders page) ──────────────────
// Completely removes the enrollment document from the database
const hardDeleteOrder = async (enrollmentId: string) => {
  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment) throw new Error('Order not found');

  // Decrease course enrolled count if it was active
  if (enrollment.status === 'active') {
    await Course.findByIdAndUpdate(enrollment.courseId, {
      $inc: { totalStudentsEnroll: -1 },
    });
  }

  // Also delete related installments if any
  try {
    const { Installment } = await import('../installment/installment.model');
    await Installment.deleteMany({ enrollmentId: enrollment._id });
  } catch (e) {
    console.error('Installment cleanup failed:', e);
  }

  await Enrollment.findByIdAndDelete(enrollmentId);

  return { message: 'Order deleted permanently' };
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
  approveEnrollment,
  getStudentPayments,
  getMentorStudents,
  transferCourse,
  softDeleteEnrollment,
  hardDeleteOrder,
};
