import { Request, Response } from 'express';
import { SeminarService } from './seminar.service';

// ==========================================
// SEMINAR CRUD Controllers
// ==========================================

const createSeminar = async (req: Request, res: Response) => {
  try {
    const result = await SeminarService.createSeminar(req.body);
    res.status(201).json({
      success: true,
      message: 'Seminar created successfully',
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAllSeminars = async (req: Request, res: Response) => {
  try {
    const result = await SeminarService.getAllSeminars(req.query);
    res.status(200).json({
      success: true,
      message: 'Seminars fetched successfully',
      ...result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSingleSeminar = async (req: Request, res: Response) => {
  try {
    const result = await SeminarService.getSingleSeminar(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Seminar fetched successfully',
      data: result,
    });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const updateSeminar = async (req: Request, res: Response) => {
  try {
    const result = await SeminarService.updateSeminar(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Seminar updated successfully',
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteSeminar = async (req: Request, res: Response) => {
  try {
    const result = await SeminarService.deleteSeminar(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Seminar deleted successfully',
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getTodaySeminar = async (req: Request, res: Response) => {
  try {
    const result = await SeminarService.getTodaySeminar();
    res.status(200).json({
      success: true,
      message: result ? 'Today\'s seminar found' : 'No seminar today',
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// REGISTRATION Controllers
// ==========================================

const registerForSeminar = async (req: Request, res: Response) => {
  try {
    const result = await SeminarService.registerForSeminar(req.params.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Registration successful! আমাদের টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে।',
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getRegistrations = async (req: Request, res: Response) => {
  try {
    const result = await SeminarService.getRegistrations(req.params.id, req.query);
    res.status(200).json({
      success: true,
      message: 'Registrations fetched successfully',
      ...result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRegistrationStats = async (req: Request, res: Response) => {
  try {
    const result = await SeminarService.getRegistrationStats(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Stats fetched successfully',
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCallStatus = async (req: Request, res: Response) => {
  try {
    const result = await SeminarService.updateCallStatus(req.params.regId, req.body);
    res.status(200).json({
      success: true,
      message: 'Call status updated',
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ==========================================
// ATTENDEE (Live Join) Controllers
// ==========================================

const joinSeminar = async (req: Request, res: Response) => {
  try {
    const result = await SeminarService.joinSeminar(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: result.alreadyJoined
        ? 'Welcome back! You already joined this seminar.'
        : 'Successfully joined! Enjoy the seminar.',
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAttendees = async (req: Request, res: Response) => {
  try {
    const result = await SeminarService.getAttendees(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Attendees fetched successfully',
      ...result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// LIVE TODAY Toggle Controller
// ==========================================
const toggleLiveToday = async (req: Request, res: Response) => {
  try {
    const result = await SeminarService.toggleLiveToday(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: result?.isLiveToday
        ? 'Seminar is now LIVE on the website!'
        : 'Seminar removed from LIVE.',
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ==========================================
// EXPORT
// ==========================================
export const SeminarController = {
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
