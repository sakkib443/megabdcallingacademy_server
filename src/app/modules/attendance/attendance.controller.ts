/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { AttendanceService } from './attendance.service';

const mark = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const result = await AttendanceService.markAttendance({ ...req.body, markedBy: user._id });
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const bulkMark = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { classId, batchId, records } = req.body;
    const result = await AttendanceService.bulkMark(classId, batchId, user._id, records);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getClassAttendance = async (req: Request, res: Response) => {
  try {
    const result = await AttendanceService.getClassAttendance(req.params.classId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getStudentAttendance = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { batchId } = req.query;
    const result = await AttendanceService.getStudentAttendance(user._id, batchId as string);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getBatchReport = async (req: Request, res: Response) => {
  try {
    const result = await AttendanceService.getBatchReport(req.params.batchId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getStudentSummary = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const result = await AttendanceService.getStudentSummary(user._id);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const AttendanceController = {
  mark, bulkMark, getClassAttendance,
  getStudentAttendance, getBatchReport, getStudentSummary,
};
