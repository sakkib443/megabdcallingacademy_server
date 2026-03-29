/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { AssignmentService } from './assignment.service';

const create = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const result = await AssignmentService.create({ ...req.body, createdBy: user._id });
    res.status(201).json({ success: true, data: result });
  } catch (e: any) { res.status(400).json({ success: false, message: e.message }); }
};

const getAll = async (req: Request, res: Response) => {
  try {
    const result = await AssignmentService.getAll(req.query as any);
    res.status(200).json({ success: true, data: result });
  } catch (e: any) { res.status(400).json({ success: false, message: e.message }); }
};

const getOne = async (req: Request, res: Response) => {
  try {
    const result = await AssignmentService.getOne(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (e: any) { res.status(400).json({ success: false, message: e.message }); }
};

const update = async (req: Request, res: Response) => {
  try {
    const result = await AssignmentService.update(req.params.id, req.body);
    res.status(200).json({ success: true, data: result });
  } catch (e: any) { res.status(400).json({ success: false, message: e.message }); }
};

const remove = async (req: Request, res: Response) => {
  try {
    await AssignmentService.remove(req.params.id);
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (e: any) { res.status(400).json({ success: false, message: e.message }); }
};

const submit = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const result = await AssignmentService.submit({ ...req.body, assignmentId: req.params.id, studentId: user._id });
    res.status(200).json({ success: true, data: result });
  } catch (e: any) { res.status(400).json({ success: false, message: e.message }); }
};

const getSubmissions = async (req: Request, res: Response) => {
  try {
    const result = await AssignmentService.getSubmissions(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (e: any) { res.status(400).json({ success: false, message: e.message }); }
};

const grade = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { marks, feedback } = req.body;
    const result = await AssignmentService.grade(req.params.submissionId, marks, feedback, user._id);
    res.status(200).json({ success: true, data: result });
  } catch (e: any) { res.status(400).json({ success: false, message: e.message }); }
};

const mySubmissions = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const result = await AssignmentService.getStudentSubmissions(user._id);
    res.status(200).json({ success: true, data: result });
  } catch (e: any) { res.status(400).json({ success: false, message: e.message }); }
};

const studentAssignments = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const result = await AssignmentService.getStudentAssignments(user._id, req.params.courseId);
    res.status(200).json({ success: true, data: result });
  } catch (e: any) { res.status(400).json({ success: false, message: e.message }); }
};

export const AssignmentController = {
  create, getAll, getOne, update, remove,
  submit, getSubmissions, grade,
  mySubmissions, studentAssignments,
};
