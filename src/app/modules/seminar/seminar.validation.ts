import { z } from 'zod';

// ==========================================
// Seminar Validation
// ==========================================
export const createSeminarValidation = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }).min(3),
    titleBn: z.string().optional(),
    description: z.string({ required_error: 'Description is required' }).min(10),
    descriptionBn: z.string().optional(),
    date: z.string({ required_error: 'Date is required' }),
    startTime: z.string({ required_error: 'Start time is required' }),
    endTime: z.string({ required_error: 'End time is required' }),
    type: z.enum(['online', 'offline', 'hybrid']),
    zoomMeetingId: z.string().optional(),
    zoomJoinLink: z.string().optional(),
    zoomPasscode: z.string().optional(),
    venue: z.string().optional(),
    venueAddress: z.string().optional(),
    speaker: z.string({ required_error: 'Speaker name is required' }),
    speakerDesignation: z.string().optional(),
    speakerImage: z.string().optional(),
    bannerImage: z.string().optional(),
    maxSeats: z.number().min(1).default(100),
    isFeatured: z.boolean().default(false),
    relatedCourses: z.array(z.string()).optional(),
  }),
});

export const updateSeminarValidation = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    titleBn: z.string().optional(),
    description: z.string().min(10).optional(),
    descriptionBn: z.string().optional(),
    date: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    type: z.enum(['online', 'offline', 'hybrid']).optional(),
    zoomMeetingId: z.string().optional(),
    zoomJoinLink: z.string().optional(),
    zoomPasscode: z.string().optional(),
    venue: z.string().optional(),
    venueAddress: z.string().optional(),
    speaker: z.string().optional(),
    speakerDesignation: z.string().optional(),
    speakerImage: z.string().optional(),
    bannerImage: z.string().optional(),
    recordingUrl: z.string().optional(),
    maxSeats: z.number().min(1).optional(),
    status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).optional(),
    isFeatured: z.boolean().optional(),
    relatedCourses: z.array(z.string()).optional(),
  }),
});

// ==========================================
// Registration Validation
// ==========================================
export const seminarRegistrationValidation = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(2),
    phone: z.string({ required_error: 'Phone is required' }).min(11).max(14),
    email: z.string({ required_error: 'Email is required' }).email(),
    courseInterest: z.string().optional(),
    source: z.enum(['facebook', 'website', 'referral', 'sms', 'other']).default('website'),
  }),
});

// ==========================================
// Call Status Update Validation
// ==========================================
export const updateCallStatusValidation = z.object({
  body: z.object({
    callStatus: z.enum(['not_called', 'called', 'interested', 'not_interested', 'enrolled']),
    callNotes: z.string().optional(),
    calledBy: z.string().optional(),
  }),
});

// ==========================================
// Attendee (Live Join) Validation
// ==========================================
export const seminarAttendeeValidation = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(2),
    phone: z.string({ required_error: 'Phone is required' }).min(11).max(14),
    email: z.string({ required_error: 'Email is required' }).email(),
    location: z.string().optional(),
  }),
});
