import { Schema, model, Types } from 'mongoose';

export interface IAttendance {
  classId: Types.ObjectId;
  batchId: Types.ObjectId;
  studentId: Types.ObjectId;
  status: 'present' | 'absent' | 'late' | 'excused';
  checkInTime?: Date;
  method: 'manual' | 'qr' | 'auto';
  markedBy: Types.ObjectId;
  notes?: string;
  isDeleted: boolean;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    classId: { type: Schema.Types.ObjectId, ref: 'ClassSchedule', required: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused'],
      default: 'absent',
    },
    checkInTime: { type: Date },
    method: { type: String, enum: ['manual', 'qr', 'auto'], default: 'manual' },
    markedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

attendanceSchema.index({ classId: 1, studentId: 1 }, { unique: true });
attendanceSchema.index({ studentId: 1, batchId: 1 });
attendanceSchema.index({ batchId: 1, classId: 1 });

export const Attendance = model<IAttendance>('Attendance', attendanceSchema);
