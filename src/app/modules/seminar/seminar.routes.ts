import express from 'express';
import { SeminarController } from './seminar.controller';
import validateRequest from '../../middlewares/validateRequest';
import {
  createSeminarValidation,
  updateSeminarValidation,
  seminarRegistrationValidation,
  updateCallStatusValidation,
  seminarAttendeeValidation,
} from './seminar.validation';

const router = express.Router();

// ==========================================
// SEMINAR CRUD (Admin)
// ==========================================
router.post(
  '/create',
  validateRequest(createSeminarValidation),
  SeminarController.createSeminar
);
router.get('/', SeminarController.getAllSeminars);
router.get('/today', SeminarController.getTodaySeminar);
router.get('/:id', SeminarController.getSingleSeminar);
router.patch('/:id', SeminarController.updateSeminar);
router.patch('/:id/toggle-live', SeminarController.toggleLiveToday);
router.delete('/:id', SeminarController.deleteSeminar);

// ==========================================
// REGISTRATION (Public)
// ==========================================
router.post(
  '/:id/register',
  validateRequest(seminarRegistrationValidation),
  SeminarController.registerForSeminar
);

// ==========================================
// REGISTRATION Management (Admin)
// ==========================================
router.get('/:id/registrations', SeminarController.getRegistrations);
router.get('/:id/registrations/stats', SeminarController.getRegistrationStats);
router.patch(
  '/registrations/:regId/call-status',
  validateRequest(updateCallStatusValidation),
  SeminarController.updateCallStatus
);

// ==========================================
// LIVE JOIN (Public - Part 2)
// ==========================================
router.post(
  '/:id/join',
  validateRequest(seminarAttendeeValidation),
  SeminarController.joinSeminar
);
router.get('/:id/attendees', SeminarController.getAttendees);

export const SeminarRoutes = router;
