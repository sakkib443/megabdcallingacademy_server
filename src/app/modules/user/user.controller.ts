/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { UserService } from './user.service';

export const createUserController = async (req: Request, res: Response) => {
  try {
    const data = req.body
    const result = await UserService.createUserServices(data);
    res.status(200).json({
      success: true,
      message: 'Registration successful! You are now logged in.',
      data: result.user,
      token: result.token,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    const users = await UserService.getAllUsersServices();
    res.status(200).json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSingleUserController = async (req: Request, res: Response) => {
  try {
    const user = await UserService.getSingleUserServices(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserController = async (req: Request, res: Response) => {
  try {
    const updatedUser = await UserService.updateUserServices(req.params.id, req.body);
    if (!updatedUser)
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUserController = async (req: Request, res: Response) => {
  try {
    const deletedUser = await UserService.deleteUserServices(req.params.id);
    if (!deletedUser)
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: deletedUser });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const UserController = {
  createUserController,
  deleteUserController,
  updateUserController,
  getAllUsersController,
  getSingleUserController,
};
