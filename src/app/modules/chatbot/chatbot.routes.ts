// ==========================================
// BdCalling Academy Chatbot Routes
// ==========================================

import express from 'express';
import { ChatbotController } from './chatbot.controller';

const router = express.Router();

// Public routes (no auth needed)
router.post('/message', ChatbotController.processMessage);
router.get('/welcome', ChatbotController.getWelcome);

export const ChatbotRoutes = router;
