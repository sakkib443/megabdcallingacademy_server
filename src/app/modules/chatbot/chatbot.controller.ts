// ==========================================
// BdCalling Academy Chatbot Controller
// ==========================================

import { Request, Response } from 'express';
import { ChatbotService } from './chatbot.service';

// POST /api/chatbot/message
const processMessage = async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    // history is optional array of {role: 'user'|'bot', content: string}
    const conversationHistory = Array.isArray(history) ? history : [];

    const response = await ChatbotService.processMessage(message.trim(), conversationHistory);

    res.status(200).json({
      success: true,
      data: {
        message: response.message,
        quickReplies: response.quickReplies || [],
        links: response.links || [],
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Chatbot processing failed',
    });
  }
};

// GET /api/chatbot/welcome?lang=en|bn
const getWelcome = async (req: Request, res: Response) => {
  try {
    const lang = (req.query.lang as string) === 'bn' ? 'bn' : 'en';
    const response = ChatbotService.getWelcomeMessage(lang);

    res.status(200).json({
      success: true,
      data: {
        message: response.message,
        quickReplies: response.quickReplies || [],
        links: response.links || [],
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get welcome message',
    });
  }
};

export const ChatbotController = {
  processMessage,
  getWelcome,
};
