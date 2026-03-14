import { Schema, model } from 'mongoose';
import { ISeminar, ISeminarRegistration, ISeminarAttendee } from './seminar.interface';

// ==========================================
// Seminar Schema
// ==========================================
const seminarSchema = new Schema<ISeminar>(
  {
    title: { type: String, required: true },
    titleBn: { type: String },
    description: { type: String, required: true },
    descriptionBn: { type: String },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    type: {
      type: String,
      enum: ['online', 'offline', 'hybrid'],
      required: true,
      default: 'online',
    },

    // Online
    zoomMeetingId: { type: String },
    zoomJoinLink: { type: String },
    zoomPasscode: { type: String },

    // Offline
    venue: { type: String },
    venueAddress: { type: String },

    // Speaker
    speaker: { type: String, required: true },
    speakerDesignation: { type: String },
    speakerImage: { type: String },

    // Media
    bannerImage: { type: String },
    recordingUrl: { type: String },

    // Settings
    maxSeats: { type: Number, required: true, default: 100 },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    isFeatured: { type: Boolean, default: false },
    isLiveToday: { type: Boolean, default: false },

    // Related courses
    relatedCourses: [{ type: String }],

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for queries
seminarSchema.index({ date: 1, status: 1 });
seminarSchema.index({ isDeleted: 1 });

// ==========================================
// Seminar Registration Schema
// ==========================================
const seminarRegistrationSchema = new Schema<ISeminarRegistration>(
  {
    seminarId: {
      type: Schema.Types.ObjectId,
      ref: 'Seminar',
      required: true,
    },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    courseInterest: { type: String },
    source: {
      type: String,
      enum: ['facebook', 'website', 'referral', 'sms', 'other'],
      default: 'website',
    },

    // Sales follow-up
    callStatus: {
      type: String,
      enum: ['not_called', 'called', 'interested', 'not_interested', 'enrolled'],
      default: 'not_called',
    },
    callNotes: { type: String },
    calledBy: { type: String },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Prevent duplicate registration (same phone + same seminar)
seminarRegistrationSchema.index({ seminarId: 1, phone: 1 }, { unique: true });
seminarRegistrationSchema.index({ seminarId: 1, email: 1 }, { unique: true });

// ==========================================
// Seminar Attendee Schema (Live Join)
// ==========================================
const seminarAttendeeSchema = new Schema<ISeminarAttendee>(
  {
    seminarId: {
      type: Schema.Types.ObjectId,
      ref: 'Seminar',
      required: true,
    },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    location: { type: String },
    joinedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

seminarAttendeeSchema.index({ seminarId: 1, phone: 1 }, { unique: true });

// ==========================================
// Export Models
// ==========================================
export const Seminar = model<ISeminar>('Seminar', seminarSchema);
export const SeminarRegistration = model<ISeminarRegistration>(
  'SeminarRegistration',
  seminarRegistrationSchema
);
export const SeminarAttendee = model<ISeminarAttendee>(
  'SeminarAttendee',
  seminarAttendeeSchema
);
