import { Schema, model } from 'mongoose';
import { IEnrollment } from './enrollment.interface';

const paymentSchema = new Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ['bkash', 'sslcommerz', 'manual', 'free'],
      required: true,
    },
    transactionId: { type: String },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paidAt: { type: Date },
    gatewayData: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const enrollmentSchema = new Schema<IEnrollment>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch' },
    status: {
      type: String,
      enum: ['pending', 'active', 'expired', 'cancelled', 'completed'],
      default: 'pending',
    },
    enrolledAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    payment: { type: paymentSchema, required: true },
    completionPercent: { type: Number, default: 0, min: 0, max: 100 },
    completedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// A student can only be enrolled once per course
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ courseId: 1, status: 1 });
enrollmentSchema.index({ studentId: 1, status: 1 });

export const Enrollment = model<IEnrollment>('Enrollment', enrollmentSchema);
