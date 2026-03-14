import express from 'express';
import { SettingsController } from './settings.controller';

const router = express.Router();

// Get site settings (public)
router.get('/', SettingsController.getSettingsController);

// Update site settings (admin only)
router.patch('/', SettingsController.updateSettingsController);

export const SettingsRoutes = router;
