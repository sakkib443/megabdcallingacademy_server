// ==========================================
// Chatbot Routes
// ==========================================

import express from 'express';
import { ChatbotController } from './chatbot.controller';

const router = express.Router();

// Public routes
router.post('/message', ChatbotController.processMessage);
router.get('/welcome', ChatbotController.getWelcome);

// History routes (works with or without auth)
router.get('/history', ChatbotController.getHistory);
router.delete('/history', ChatbotController.clearHistory);

export const ChatbotRoutes = router;
