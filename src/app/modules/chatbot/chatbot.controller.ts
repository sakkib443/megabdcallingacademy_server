// ==========================================
// BdCalling Academy Chatbot Controller
// Handles messages + persistent history
// ==========================================

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import config from '../../config';
import { ChatbotService } from './chatbot.service';
import { ChatConversation } from './chatbot.model';

// Helper: Extract userId from token (optional auth)
function getUserIdFromRequest(req: Request): string | null {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.access_secret) as any;
    return decoded?.userId || decoded?.id || null;
  } catch {
    return null;
  }
}

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

    const userId = getUserIdFromRequest(req);
    const userMessage = message.trim();

    // Get conversation history — from DB if logged in, otherwise from request body
    let conversationHistory: Array<{ role: string; content: string }> = [];

    if (userId) {
      // Load previous conversation from DB
      let conversation = await ChatConversation.findOne({ userId, isActive: true });
      if (conversation) {
        conversationHistory = conversation.messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
        }));
      }
    } else if (Array.isArray(history)) {
      conversationHistory = history;
    }

    // Process with AI
    const response = await ChatbotService.processMessage(userMessage, conversationHistory);

    // Save to DB if logged in
    if (userId) {
      let conversation = await ChatConversation.findOne({ userId, isActive: true });
      if (!conversation) {
        conversation = new ChatConversation({ userId, messages: [] });
      }

      // Save user message
      conversation.messages.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      });

      // Save bot response
      conversation.messages.push({
        role: 'bot',
        content: response.message,
        timestamp: new Date(),
      });

      conversation.lastActive = new Date();
      await conversation.save();
    }

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
    console.error('Chatbot Error:', error.message);
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

// GET /api/chatbot/history — Load chat history for logged-in user
const getHistory = async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(200).json({
        success: true,
        data: { messages: [] },
      });
    }

    const conversation = await ChatConversation.findOne({ userId, isActive: true });
    if (!conversation) {
      return res.status(200).json({
        success: true,
        data: { messages: [] },
      });
    }

    // Return last 50 messages
    const messages = conversation.messages.slice(-50).map(m => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
    }));

    res.status(200).json({
      success: true,
      data: { messages },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to load history',
    });
  }
};

// DELETE /api/chatbot/history — Clear chat history for logged-in user
const clearHistory = async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Login required' });
    }

    await ChatConversation.updateOne(
      { userId, isActive: true },
      { $set: { messages: [], lastActive: new Date() } }
    );

    res.status(200).json({
      success: true,
      message: 'Chat history cleared',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to clear history',
    });
  }
};

export const ChatbotController = {
  processMessage,
  getWelcome,
  getHistory,
  clearHistory,
};
