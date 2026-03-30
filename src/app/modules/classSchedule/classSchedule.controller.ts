/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { ClassScheduleService } from './classSchedule.service';

const create = async (req: Request, res: Response) => {
  try {
    const result = await ClassScheduleService.createClass(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAll = async (req: Request, res: Response) => {
  try {
    const result = await ClassScheduleService.getAllClasses(req.query as any);
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getOne = async (req: Request, res: Response) => {
  try {
    const result = await ClassScheduleService.getClass(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'Class not found' });
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const update = async (req: Request, res: Response) => {
  try {
    const result = await ClassScheduleService.updateClass(req.params.id, req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const remove = async (req: Request, res: Response) => {
  try {
    await ClassScheduleService.deleteClass(req.params.id);
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Mentor: My Classes
const myClasses = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { dateFrom, dateTo } = req.query;
    const result = await ClassScheduleService.getMentorClasses(
      user._id, dateFrom as string, dateTo as string
    );
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Mentor: Upload Recording
const uploadRecording = async (req: Request, res: Response) => {
  try {
    const { recordingUrl } = req.body;
    const result = await ClassScheduleService.uploadRecording(req.params.id, recordingUrl);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Add material to class
const addMaterial = async (req: Request, res: Response) => {
  try {
    const result = await ClassScheduleService.addMaterial(req.params.id, req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Remove material
const removeMaterial = async (req: Request, res: Response) => {
  try {
    const { index } = req.params;
    const result = await ClassScheduleService.removeMaterial(req.params.id, Number(index));
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Student: My schedule (by enrolled batches)
const studentSchedule = async (req: Request, res: Response) => {
  try {
    const { batchIds, dateFrom, dateTo } = req.query;
    const ids = typeof batchIds === 'string' ? batchIds.split(',') : [];
    const result = await ClassScheduleService.getStudentClasses(
      ids, dateFrom as string, dateTo as string
    );
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Today's classes
const todayClasses = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const result = await ClassScheduleService.getTodayClasses(user._id, user.role);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Stats
const stats = async (req: Request, res: Response) => {
  try {
    const result = await ClassScheduleService.getStats();
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Send to Students
const sendToStudents = async (req: Request, res: Response) => {
  try {
    const result = await ClassScheduleService.sendToStudents(req.params.id);
    res.status(200).json({ success: true, message: 'Sent to students', data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get classes by batch
const getByBatch = async (req: Request, res: Response) => {
  try {
    const result = await ClassScheduleService.getClassesByBatch(req.params.batchId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const ClassScheduleController = {
  create, getAll, getOne, update, remove,
  myClasses, uploadRecording, addMaterial, removeMaterial,
  studentSchedule, todayClasses, stats,
  sendToStudents, getByBatch,
};
