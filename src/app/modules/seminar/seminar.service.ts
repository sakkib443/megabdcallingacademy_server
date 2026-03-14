import { Seminar, SeminarRegistration, SeminarAttendee } from './seminar.model';
import { ISeminar, ISeminarRegistration, ISeminarAttendee } from './seminar.interface';
import mongoose from 'mongoose';

// ==========================================
// SEMINAR CRUD
// ==========================================

const createSeminar = async (payload: ISeminar) => {
  const result = await Seminar.create(payload);
  return result;
};

const getAllSeminars = async (query: Record<string, unknown>) => {
  const { status, type, upcoming, search, page = 1, limit = 10 } = query;

  const filter: Record<string, unknown> = { isDeleted: false };

  if (status) filter.status = status;
  if (type) filter.type = type;
  if (upcoming === 'true') {
    filter.date = { $gte: new Date() };
    filter.status = { $in: ['upcoming', 'ongoing'] };
  }
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { titleBn: { $regex: search, $options: 'i' } },
      { speaker: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const seminars = await Seminar.find(filter)
    .sort({ date: 1, startTime: 1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Seminar.countDocuments(filter);

  return {
    data: seminars,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

const getSingleSeminar = async (id: string) => {
  const result = await Seminar.findById(id);
  if (!result || result.isDeleted) throw new Error('Seminar not found');
  return result;
};

const updateSeminar = async (id: string, payload: Partial<ISeminar>) => {
  const result = await Seminar.findByIdAndUpdate(id, payload, { new: true });
  if (!result) throw new Error('Seminar not found');
  return result;
};

const deleteSeminar = async (id: string) => {
  const result = await Seminar.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  if (!result) throw new Error('Seminar not found');
  return result;
};

// Get today's live seminar (admin controlled via isLiveToday flag)
const getTodaySeminar = async () => {
  const seminar = await Seminar.findOne({
    isLiveToday: true,
    isDeleted: false,
  });
  return seminar;
};

// Toggle Live Today — admin controlled
// Only one seminar can be live at a time
const toggleLiveToday = async (seminarId: string, liveData?: { zoomJoinLink?: string; zoomPasscode?: string; startTime?: string; endTime?: string }) => {
  // Check current seminar FIRST (before any updates)
  const seminar = await Seminar.findById(seminarId);
  if (!seminar || seminar.isDeleted) throw new Error('Seminar not found');

  const wasLive = seminar.isLiveToday;

  if (wasLive) {
    // Turn OFF — seminar was already live, just disable it
    const result = await Seminar.findByIdAndUpdate(
      seminarId,
      { isLiveToday: false },
      { new: true }
    );
    return result;
  }

  // Turn ON — first disable all others, then enable this one
  await Seminar.updateMany(
    { isLiveToday: true, isDeleted: false },
    { isLiveToday: false }
  );

  const updatePayload: Record<string, unknown> = { isLiveToday: true };
  
  // Update zoom/meet link and time if provided
  if (liveData?.zoomJoinLink) updatePayload.zoomJoinLink = liveData.zoomJoinLink;
  if (liveData?.zoomPasscode) updatePayload.zoomPasscode = liveData.zoomPasscode;
  if (liveData?.startTime) updatePayload.startTime = liveData.startTime;
  if (liveData?.endTime) updatePayload.endTime = liveData.endTime;

  const result = await Seminar.findByIdAndUpdate(seminarId, updatePayload, { new: true });
  return result;
};

// ==========================================
// REGISTRATION (Part 1 - Public Registration)
// ==========================================

const registerForSeminar = async (seminarId: string, payload: Partial<ISeminarRegistration>) => {
  // Check seminar exists
  const seminar = await Seminar.findById(seminarId);
  if (!seminar || seminar.isDeleted) throw new Error('Seminar not found');
  if (seminar.status === 'cancelled') throw new Error('This seminar is cancelled');
  if (seminar.status === 'completed') throw new Error('This seminar is already completed');

  // Check max seats
  const currentCount = await SeminarRegistration.countDocuments({
    seminarId,
    isDeleted: false,
  });
  if (currentCount >= seminar.maxSeats) {
    throw new Error('Sorry, all seats are full!');
  }

  // Check duplicate (phone or email)
  const existing = await SeminarRegistration.findOne({
    seminarId,
    $or: [{ phone: payload.phone }, { email: payload.email }],
    isDeleted: false,
  });
  if (existing) {
    throw new Error('You have already registered for this seminar');
  }

  const result = await SeminarRegistration.create({
    ...payload,
    seminarId,
  });

  return result;
};

const getRegistrations = async (seminarId: string, query: Record<string, unknown>) => {
  const { callStatus, search, page = 1, limit = 50 } = query;

  const filter: Record<string, unknown> = {
    seminarId,
    isDeleted: false,
  };

  if (callStatus && callStatus !== 'all') filter.callStatus = callStatus;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const registrations = await SeminarRegistration.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await SeminarRegistration.countDocuments(filter);

  // Stats
  const stats = await SeminarRegistration.aggregate([
    { $match: { seminarId: new mongoose.Types.ObjectId(seminarId), isDeleted: false } },
    { $group: { _id: '$callStatus', count: { $sum: 1 } } },
  ]).catch(() => []);

  return {
    data: registrations,
    meta: { total, page: Number(page), limit: Number(limit) },
    stats,
  };
};

const getRegistrationStats = async (seminarId: string) => {
  const total = await SeminarRegistration.countDocuments({ seminarId, isDeleted: false });
  const notCalled = await SeminarRegistration.countDocuments({ seminarId, callStatus: 'not_called', isDeleted: false });
  const called = await SeminarRegistration.countDocuments({ seminarId, callStatus: 'called', isDeleted: false });
  const interested = await SeminarRegistration.countDocuments({ seminarId, callStatus: 'interested', isDeleted: false });
  const notInterested = await SeminarRegistration.countDocuments({ seminarId, callStatus: 'not_interested', isDeleted: false });
  const enrolled = await SeminarRegistration.countDocuments({ seminarId, callStatus: 'enrolled', isDeleted: false });

  return { total, notCalled, called, interested, notInterested, enrolled };
};

const updateCallStatus = async (registrationId: string, payload: { callStatus: string; callNotes?: string; calledBy?: string }) => {
  const result = await SeminarRegistration.findByIdAndUpdate(
    registrationId,
    payload,
    { new: true }
  );
  if (!result) throw new Error('Registration not found');
  return result;
};

// ==========================================
// ATTENDEE (Part 2 - Live Join)
// ==========================================

const joinSeminar = async (seminarId: string, payload: Partial<ISeminarAttendee>) => {
  const seminar = await Seminar.findById(seminarId);
  if (!seminar || seminar.isDeleted) throw new Error('Seminar not found');

  // Check duplicate
  const existing = await SeminarAttendee.findOne({
    seminarId,
    phone: payload.phone,
    isDeleted: false,
  });

  if (existing) {
    // Already joined — return seminar info
    return { attendee: existing, seminar, alreadyJoined: true };
  }

  const attendee = await SeminarAttendee.create({
    ...payload,
    seminarId,
    joinedAt: new Date(),
  });

  // Update seminar to ongoing if not already
  if (seminar.status === 'upcoming') {
    await Seminar.findByIdAndUpdate(seminarId, { status: 'ongoing' });
  }

  return { attendee, seminar, alreadyJoined: false };
};

const getAttendees = async (seminarId: string) => {
  const attendees = await SeminarAttendee.find({
    seminarId,
    isDeleted: false,
  }).sort({ joinedAt: -1 });

  const total = attendees.length;
  return { data: attendees, total };
};

// ==========================================
// EXPORT
// ==========================================
export const SeminarService = {
  createSeminar,
  getAllSeminars,
  getSingleSeminar,
  updateSeminar,
  deleteSeminar,
  getTodaySeminar,
  toggleLiveToday,
  registerForSeminar,
  getRegistrations,
  getRegistrationStats,
  updateCallStatus,
  joinSeminar,
  getAttendees,
};
