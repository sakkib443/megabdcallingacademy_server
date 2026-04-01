// ==========================================
// Chat Conversation Model — Persistent History
// ==========================================

import { Schema, model, Document } from 'mongoose';

export interface IChatMessage {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export interface IChatConversation extends Document {
  userId: string;
  messages: IChatMessage[];
  lastActive: Date;
  isActive: boolean;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    role: { type: String, enum: ['user', 'bot'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const chatConversationSchema = new Schema<IChatConversation>(
  {
    userId: { type: String, required: true, index: true },
    messages: { type: [chatMessageSchema], default: [] },
    lastActive: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Auto-cleanup: limit messages per conversation to last 100
chatConversationSchema.pre('save', function (next) {
  if (this.messages.length > 100) {
    this.messages = this.messages.slice(-100);
  }
  next();
});

export const ChatConversation = model<IChatConversation>('ChatConversation', chatConversationSchema);
