import { ClassSchedule } from './classSchedule.model';

// ─── Create Class ───────────────────────────────────────────
const createClass = async (payload: any) => {
  return ClassSchedule.create(payload);
};

// ─── Get All Classes (Admin/TM) ─────────────────────────────
const getAllClasses = async (query: {
  batchId?: string;
  courseId?: string;
  mentorId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}) => {
  const filter: any = { isDeleted: false };
  const { batchId, courseId, mentorId, status, dateFrom, dateTo, page = 1, limit = 50 } = query;

  if (batchId) filter.batchId = batchId;
  if (courseId) filter.courseId = courseId;
  if (mentorId) filter.mentorId = mentorId;
  if (status) filter.status = status;
  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = new Date(dateFrom);
    if (dateTo) filter.date.$lte = new Date(dateTo);
  }

  const total = await ClassSchedule.countDocuments(filter);
  const classes = await ClassSchedule.find(filter)
    .populate('batchId', 'id courseName status')
    .populate('courseId', 'title image')
    .populate('mentorId', 'firstName lastName email')
    .sort({ date: 1, startTime: 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { classes, total, page, totalPages: Math.ceil(total / limit) };
};

// ─── Get Single Class ───────────────────────────────────────
const getClass = async (id: string) => {
  return ClassSchedule.findById(id)
    .populate('batchId', 'id courseName status')
    .populate('courseId', 'title image')
    .populate('mentorId', 'firstName lastName email');
};

// ─── Update Class ───────────────────────────────────────────
const updateClass = async (id: string, payload: any) => {
  return ClassSchedule.findByIdAndUpdate(id, payload, { new: true });
};

// ─── Delete Class (soft) ────────────────────────────────────
const deleteClass = async (id: string) => {
  return ClassSchedule.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
};

// ─── Get Mentor's Classes ───────────────────────────────────
const getMentorClasses = async (mentorId: string, dateFrom?: string, dateTo?: string) => {
  const filter: any = { mentorId, isDeleted: false };
  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = new Date(dateFrom);
    if (dateTo) filter.date.$lte = new Date(dateTo);
  }

  return ClassSchedule.find(filter)
    .populate('batchId', 'id courseName')
    .populate('courseId', 'title image')
    .sort({ date: 1, startTime: 1 });
};

// ─── Get Student's Classes (by batch) ───────────────────────
const getStudentClasses = async (batchIds: string[], dateFrom?: string, dateTo?: string) => {
  const filter: any = { batchId: { $in: batchIds }, isDeleted: false };
  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = new Date(dateFrom);
    if (dateTo) filter.date.$lte = new Date(dateTo);
  }

  return ClassSchedule.find(filter)
    .populate('batchId', 'id courseName')
    .populate('courseId', 'title image')
    .populate('mentorId', 'firstName lastName')
    .sort({ date: 1, startTime: 1 });
};

// ─── Upload Recording ───────────────────────────────────────
const uploadRecording = async (classId: string, recordingUrl: string) => {
  return ClassSchedule.findByIdAndUpdate(
    classId,
    { recordingUrl, status: 'completed' },
    { new: true }
  );
};

// ─── Add Material ───────────────────────────────────────────
const addMaterial = async (classId: string, material: { title: string; fileUrl: string; fileType: string }) => {
  return ClassSchedule.findByIdAndUpdate(
    classId,
    { $push: { materials: material } },
    { new: true }
  );
};

// ─── Remove Material ────────────────────────────────────────
const removeMaterial = async (classId: string, materialIndex: number) => {
  const cls = await ClassSchedule.findById(classId);
  if (!cls) throw new Error('Class not found');
  cls.materials.splice(materialIndex, 1);
  return cls.save();
};

// ─── Get Today's Classes ────────────────────────────────────
const getTodayClasses = async (userId: string, role: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const filter: any = {
    date: { $gte: today, $lt: tomorrow },
    isDeleted: false,
    status: { $ne: 'cancelled' },
  };

  if (role === 'mentor') filter.mentorId = userId;

  return ClassSchedule.find(filter)
    .populate('batchId', 'id courseName')
    .populate('courseId', 'title')
    .populate('mentorId', 'firstName lastName')
    .sort({ startTime: 1 });
};

// ─── Get Upcoming Classes (next 7 days) ─────────────────────
const getUpcomingClasses = async (filter: any, days = 7) => {
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + days);

  return ClassSchedule.find({
    ...filter,
    date: { $gte: now, $lte: future },
    isDeleted: false,
    status: { $ne: 'cancelled' },
  })
    .populate('batchId', 'id courseName')
    .populate('courseId', 'title image')
    .populate('mentorId', 'firstName lastName')
    .sort({ date: 1, startTime: 1 });
};

// ─── Stats ──────────────────────────────────────────────────
const getStats = async () => {
  const [total, scheduled, completed, cancelled] = await Promise.all([
    ClassSchedule.countDocuments({ isDeleted: false }),
    ClassSchedule.countDocuments({ status: 'scheduled', isDeleted: false }),
    ClassSchedule.countDocuments({ status: 'completed', isDeleted: false }),
    ClassSchedule.countDocuments({ status: 'cancelled', isDeleted: false }),
  ]);
  return { total, scheduled, completed, cancelled };
};

// ─── Send to Students (notify) ──────────────────────────────
const sendToStudents = async (classId: string) => {
  const cls = await ClassSchedule.findByIdAndUpdate(
    classId,
    { sentToStudents: true, sentAt: new Date() },
    { new: true }
  ).populate('batchId', 'id courseName');
  if (!cls) throw new Error('Class not found');

  // Create notifications for enrolled students
  try {
    const { Enrollment } = await import('../enrollment/enrollment.model');
    const { Notification } = await import('../notification/notification.model');
    const enrollments = await Enrollment.find({ batchId: cls.batchId, isDeleted: false, status: 'active' });
    const notifications = enrollments.map(e => ({
      userId: e.studentId,
      title: `New Class Material: ${cls.title}`,
      message: `New material has been uploaded for ${(cls.batchId as any)?.courseName || 'your course'}. Check your batch materials.`,
      type: 'info',
      isRead: false,
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (e) {
    console.error('Notification send failed:', e);
  }

  return cls;
};

// ─── Get Classes by Batch ───────────────────────────────────
const getClassesByBatch = async (batchId: string) => {
  return ClassSchedule.find({ batchId, isDeleted: false })
    .populate('batchId', 'id courseName status classTime classDays')
    .populate('courseId', 'title image')
    .populate('mentorId', 'firstName lastName')
    .sort({ date: 1, startTime: 1 });
};

export const ClassScheduleService = {
  createClass,
  getAllClasses,
  getClass,
  updateClass,
  deleteClass,
  getMentorClasses,
  getStudentClasses,
  uploadRecording,
  addMaterial,
  removeMaterial,
  getTodayClasses,
  getUpcomingClasses,
  getStats,
  sendToStudents,
  getClassesByBatch,
};
