import { Types } from 'mongoose';

// ==========================================
// Seminar Interface
// ==========================================
export interface ISeminar {
  title: string;
  titleBn?: string; // Bengali title
  description: string;
  descriptionBn?: string;
  date: Date;
  startTime: string; // "19:00"
  endTime: string;   // "21:00"
  type: 'online' | 'offline' | 'hybrid';

  // Online
  zoomMeetingId?: string;
  zoomJoinLink?: string;
  zoomPasscode?: string;

  // Offline
  venue?: string;
  venueAddress?: string;

  // Speaker
  speaker: string;
  speakerDesignation?: string;
  speakerImage?: string;

  // Media
  bannerImage?: string;
  recordingUrl?: string;

  // Settings
  maxSeats: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isFeatured: boolean;
  isLiveToday: boolean;

  // Related course
  relatedCourses?: string[];

  // Timestamps
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// ==========================================
// Seminar Registration Interface
// ==========================================
export interface ISeminarRegistration {
  seminarId: Types.ObjectId;
  name: string;
  phone: string;
  email: string;
  courseInterest?: string;
  source: 'facebook' | 'website' | 'referral' | 'sms' | 'other';

  // Sales follow-up
  callStatus: 'not_called' | 'called' | 'interested' | 'not_interested' | 'enrolled';
  callNotes?: string;
  calledBy?: string;

  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// ==========================================
// Seminar Attendee Interface (Live Join)
// ==========================================
export interface ISeminarAttendee {
  seminarId: Types.ObjectId;
  name: string;
  phone: string;
  email: string;
  location?: string;
  joinedAt: Date;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
