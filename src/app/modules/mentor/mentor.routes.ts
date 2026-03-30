import express from 'express';
import { MentorController } from './mentor.controller';
import validateRequest from '../../middlewares/validateRequest';
import { mentorValidationSchema } from './mentor.validation';
import { authMiddleware } from '../../middlewares/auth';

const router = express.Router();

// Mentor self-profile (token-based)
router.get('/me', authMiddleware, MentorController.getMyMentorProfile);
router.patch('/me/update', authMiddleware, MentorController.updateMyMentorProfile);

router.post('/create-mentor', validateRequest(mentorValidationSchema), MentorController.createMentorController);
router.get('/', MentorController.getAllMentorsController);
router.get('/:id', MentorController.getSingleMentorController);
router.patch('/:id', MentorController.updateMentorController);
router.delete('/:id', MentorController.deleteMentorController);

export const MentorRoutes = router;
