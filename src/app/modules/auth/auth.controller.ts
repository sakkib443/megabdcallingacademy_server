/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/modules/auth/auth.controller.ts
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

// ─── Get current user (token verify) ────────────────────────
export const getMeController = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
      },
    });
  } catch (error: any) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};


export const loginController = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.loginUser(req.body);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message || 'Login failed',
    });
  }
};

export const refreshTokenController = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }
    const result = await AuthService.refreshAccessToken(refreshToken);
    res.status(200).json({
      success: true,
      message: 'Token refreshed',
      data: result,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message || 'Token refresh failed',
    });
  }
};
export const changePasswordController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new passwords are required' });
    }
    await AuthService.changePassword(userId, currentPassword, newPassword);
    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to change password' });
  }
};
