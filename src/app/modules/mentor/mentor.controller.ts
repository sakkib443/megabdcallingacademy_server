/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { MentorService } from './mentor.service';

// CREATE → নতুন Mentor তৈরি
export const createMentorController = async (req: Request, res: Response) => {
  try {
    const mentor = await MentorService.createMentorServices(req.body);
    res.status(201).json({
      success: true,
      message: 'Mentor created successfully',
      data: mentor,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// READ ALL → সব Mentor
export const getAllMentorsController = async (req: Request, res: Response) => {
  try {
    const mentors = await MentorService.getAllMentorsServices();
    res.status(200).json({
      success: true,
      message: 'Mentors fetched successfully',
      data: mentors,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// READ SINGLE → নির্দিষ্ট Mentor
export const getSingleMentorController = async (req: Request, res: Response) => {
  try {
    const mentor = await MentorService.getSingleMentorServices(req.params.id);
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Mentor fetched successfully',
      data: mentor,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE → Mentor আপডেট
export const updateMentorController = async (req: Request, res: Response) => {
  try {
    const updatedMentor = await MentorService.updateMentorServices(
      req.params.id,
      req.body
    );
    if (!updatedMentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Mentor updated successfully',
      data: updatedMentor,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE → Mentor ডিলিট
export const deleteMentorController = async (req: Request, res: Response) => {
  try {
    const deletedMentor = await MentorService.deleteMentorServices(req.params.id);
    if (!deletedMentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Mentor deleted successfully',
      data: deletedMentor,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const MentorController = {
  createMentorController,
  getAllMentorsController,
  getSingleMentorController,
  updateMentorController,
  deleteMentorController,
};
