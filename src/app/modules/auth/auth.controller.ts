/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/modules/auth/auth.controller.ts
import { Request, Response } from 'express';
import { AuthService } from './auth.service';


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
