import { Attendance } from './attendance.model';

// ─── Mark Attendance (single student) ──────────────────────
const markAttendance = async (payload: {
  classId: string;
  batchId: string;
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  method?: string;
  markedBy: string;
  notes?: string;
}) => {
  const existing = await Attendance.findOne({
    classId: payload.classId,
    studentId: payload.studentId,
  });

  if (existing) {
    existing.status = payload.status;
    existing.method = (payload.method || 'manual') as any;
    existing.checkInTime = payload.status !== 'absent' ? new Date() : undefined;
    existing.notes = payload.notes;
    return existing.save();
  }

  return Attendance.create({
    ...payload,
    checkInTime: payload.status !== 'absent' ? new Date() : undefined,
    method: payload.method || 'manual',
  });
};

// ─── Bulk Mark (all students in a class) ───────────────────
const bulkMark = async (classId: string, batchId: string, markedBy: string, records: { studentId: string; status: string }[]) => {
  const results = [];
  for (const record of records) {
    const result = await markAttendance({
      classId,
      batchId,
      studentId: record.studentId,
      status: record.status as any,
      method: 'manual',
      markedBy,
    });
    results.push(result);
  }
  return results;
};

// ─── Get Attendance for a Class ────────────────────────────
const getClassAttendance = async (classId: string) => {
  return Attendance.find({ classId, isDeleted: false })
    .populate('studentId', 'firstName lastName email phoneNumber')
    .populate('markedBy', 'firstName lastName')
    .sort({ createdAt: 1 });
};

// ─── Get Student Attendance (all classes) ──────────────────
const getStudentAttendance = async (studentId: string, batchId?: string) => {
  const filter: any = { studentId, isDeleted: false };
  if (batchId) filter.batchId = batchId;

  return Attendance.find(filter)
    .populate('classId', 'title date startTime endTime topic')
    .sort({ createdAt: -1 });
};

// ─── Get Batch Attendance Report ───────────────────────────
const getBatchReport = async (batchId: string) => {
  const records = await Attendance.find({ batchId, isDeleted: false })
    .populate('studentId', 'firstName lastName email')
    .populate('classId', 'title date');

  // Group by student
  const studentMap: Record<string, { student: any; total: number; present: number; absent: number; late: number; rate: number }> = {};

  records.forEach((r) => {
    const sid = r.studentId?._id?.toString() || '';
    if (!studentMap[sid]) {
      studentMap[sid] = {
        student: r.studentId,
        total: 0, present: 0, absent: 0, late: 0, rate: 0,
      };
    }
    studentMap[sid].total++;
    if (r.status === 'present') studentMap[sid].present++;
    else if (r.status === 'absent') studentMap[sid].absent++;
    else if (r.status === 'late') studentMap[sid].late++;
  });

  // Calculate rates
  Object.values(studentMap).forEach((s) => {
    s.rate = s.total > 0 ? Math.round(((s.present + s.late) / s.total) * 100) : 0;
  });

  return Object.values(studentMap);
};

// ─── Student Attendance Summary ────────────────────────────
const getStudentSummary = async (studentId: string) => {
  const records = await Attendance.find({ studentId, isDeleted: false });
  const total = records.length;
  const present = records.filter(r => r.status === 'present').length;
  const late = records.filter(r => r.status === 'late').length;
  const absent = records.filter(r => r.status === 'absent').length;
  const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  return { total, present, late, absent, rate };
};

export const AttendanceService = {
  markAttendance,
  bulkMark,
  getClassAttendance,
  getStudentAttendance,
  getBatchReport,
  getStudentSummary,
};
