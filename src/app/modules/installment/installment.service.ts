import { Installment } from './installment.model';
import { Enrollment } from '../enrollment/enrollment.model';

// ─── Create Installment Plan ──────────────────────────────
const createPlan = async (payload: {
  enrollmentId: string;
  studentId: string;
  courseId: string;
  totalAmount: number;
  numberOfInstallments: number;
  firstDueDate: Date;
  intervalDays?: number;
}) => {
  const {
    enrollmentId, studentId, courseId,
    totalAmount, numberOfInstallments,
    firstDueDate, intervalDays = 30,
  } = payload;

  const amountPerInstallment = Math.ceil(totalAmount / numberOfInstallments);
  const installments = [];

  for (let i = 0; i < numberOfInstallments; i++) {
    const dueDate = new Date(firstDueDate);
    dueDate.setDate(dueDate.getDate() + (i * intervalDays));

    // First installment might be slightly different to handle rounding
    const amount = i === numberOfInstallments - 1
      ? totalAmount - (amountPerInstallment * (numberOfInstallments - 1))
      : amountPerInstallment;

    installments.push({
      enrollmentId,
      studentId,
      courseId,
      installmentNumber: i + 1,
      amount,
      dueDate,
      status: i === 0 ? 'due' : 'upcoming',
    });
  }

  const created = await Installment.insertMany(installments);
  return created;
};

// ─── Get Student Installments ─────────────────────────────
const getStudentInstallments = async (studentId: string) => {
  return Installment.find({ studentId, isDeleted: false })
    .populate('courseId', 'title image fee')
    .populate('enrollmentId', 'status')
    .sort({ dueDate: 1 });
};

// ─── Get Installments by Enrollment ──────────────────────
const getByEnrollment = async (enrollmentId: string) => {
  return Installment.find({ enrollmentId, isDeleted: false })
    .sort({ installmentNumber: 1 });
};

// ─── Pay Installment ─────────────────────────────────────
const payInstallment = async (installmentId: string, payload: {
  transactionId: string;
  method: string;
}) => {
  const installment = await Installment.findById(installmentId);
  if (!installment) throw new Error('Installment not found');
  if (installment.status === 'paid') throw new Error('Already paid');

  installment.status = 'paid';
  installment.paidDate = new Date();
  installment.transactionId = payload.transactionId;
  installment.method = payload.method;
  await installment.save();

  // Check if all installments are paid → activate enrollment
  const allInstallments = await Installment.find({
    enrollmentId: installment.enrollmentId,
    isDeleted: false,
  });
  const allPaid = allInstallments.every(i => i.status === 'paid');
  const firstPaid = allInstallments.some(i => i.status === 'paid');

  // Activate enrollment on first payment
  if (firstPaid) {
    await Enrollment.findByIdAndUpdate(installment.enrollmentId, {
      status: 'active',
      'payment.status': allPaid ? 'paid' : 'pending',
    });
  }

  // Mark next installment as 'due'
  if (!allPaid) {
    const nextInstallment = allInstallments
      .filter(i => i.status === 'upcoming')
      .sort((a, b) => a.installmentNumber - b.installmentNumber)[0];
    if (nextInstallment) {
      nextInstallment.status = 'due';
      await nextInstallment.save();
    }
  }

  return installment;
};

// ─── Admin: Verify Installment Payment ────────────────────
const adminVerify = async (installmentId: string) => {
  return payInstallment(installmentId, {
    transactionId: `ADMIN_VERIFY_${Date.now()}`,
    method: 'admin_verified',
  });
};

// ─── Get All Installments (Admin) ─────────────────────────
const getAllInstallments = async (query: { status?: string }) => {
  const filter: any = { isDeleted: false };
  if (query.status) filter.status = query.status;

  return Installment.find(filter)
    .populate('studentId', 'firstName lastName email phoneNumber')
    .populate('courseId', 'title fee')
    .populate('enrollmentId', 'status')
    .sort({ dueDate: 1 });
};

// ─── Update Overdue Status (call via cron/manual) ─────────
const updateOverdueStatus = async () => {
  const now = new Date();
  const result = await Installment.updateMany(
    {
      status: { $in: ['upcoming', 'due'] },
      dueDate: { $lt: now },
      isDeleted: false,
    },
    { $set: { status: 'overdue' } }
  );
  return result;
};

// ─── Get Installment Stats (Admin) ────────────────────────
const getStats = async () => {
  const [total, paid, due, overdue] = await Promise.all([
    Installment.countDocuments({ isDeleted: false }),
    Installment.countDocuments({ status: 'paid', isDeleted: false }),
    Installment.countDocuments({ status: 'due', isDeleted: false }),
    Installment.countDocuments({ status: 'overdue', isDeleted: false }),
  ]);

  const revenueResult = await Installment.aggregate([
    { $match: { status: 'paid', isDeleted: false } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const overdueAmount = await Installment.aggregate([
    { $match: { status: 'overdue', isDeleted: false } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  return {
    total, paid, due, overdue,
    totalCollected: revenueResult[0]?.total || 0,
    totalOverdue: overdueAmount[0]?.total || 0,
  };
};

export const InstallmentService = {
  createPlan,
  getStudentInstallments,
  getByEnrollment,
  payInstallment,
  adminVerify,
  getAllInstallments,
  updateOverdueStatus,
  getStats,
};
