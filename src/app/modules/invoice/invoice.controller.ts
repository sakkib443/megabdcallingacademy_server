/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Enrollment } from '../enrollment/enrollment.model';
import { InvoiceService } from './invoice.service';

// ─── Download Invoice PDF ────────────────────────────────────
const downloadInvoice = async (req: Request, res: Response) => {
  try {
    const { enrollmentId } = req.params;
    const user = (req as any).user;

    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('courseId', 'title type fee')
      .populate('studentId', 'firstName lastName email phoneNumber')
      .populate('batchId', 'name');

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    // Security: Only the student or admin can download
    const studentData = enrollment.studentId as any;
    if (user.role !== 'superAdmin' && user.role !== 'admin' && user._id !== String(studentData._id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const courseData = enrollment.courseId as any;
    const batchData = enrollment.batchId as any;

    const pdfBuffer = await InvoiceService.generateInvoicePDF({
      invoiceNumber: `INV-${enrollment._id.toString().slice(-8).toUpperCase()}`,
      date: new Date(enrollment.enrolledAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      studentName: `${studentData.firstName || ''} ${studentData.lastName || ''}`.trim(),
      studentEmail: studentData.email,
      studentPhone: studentData.phoneNumber,
      courseName: courseData?.title || 'Course',
      courseType: courseData?.type || 'Online',
      batchName: batchData?.name,
      amount: enrollment.payment.amount,
      paymentMethod: enrollment.payment.method,
      transactionId: enrollment.payment.transactionId,
      paidAt: enrollment.payment.paidAt
        ? new Date(enrollment.payment.paidAt).toLocaleDateString('en-GB')
        : undefined,
      status: enrollment.payment.status === 'paid' ? 'Paid' : enrollment.payment.status,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${enrollment._id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error('Invoice generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate invoice',
    });
  }
};

export const InvoiceController = {
  downloadInvoice,
};
