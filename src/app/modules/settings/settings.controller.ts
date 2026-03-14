/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { SettingsService } from './settings.services';

// GET Site Settings
const getSettingsController = async (req: Request, res: Response) => {
    try {
        const settings = await SettingsService.getSettingsService();
        res.status(200).json({
            success: true,
            message: 'Settings retrieved successfully',
            data: settings,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// UPDATE Site Settings
const updateSettingsController = async (req: Request, res: Response) => {
    try {
        const updatedSettings = await SettingsService.updateSettingsService(req.body);
        res.status(200).json({
            success: true,
            message: 'Settings updated successfully',
            data: updatedSettings,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const SettingsController = {
    getSettingsController,
    updateSettingsController,
};
