import express from 'express';
import { MentorController } from './mentor.controller';
import validateRequest from '../../middlewares/validateRequest';
import { mentorValidationSchema } from './mentor.validation';

const router = express.Router();

router.post('/create-mentor',validateRequest(mentorValidationSchema), MentorController.createMentorController,);
router.get('/', MentorController.getAllMentorsController);
router.get('/:id', MentorController.getSingleMentorController);
router.patch('/:id', MentorController.updateMentorController);
router.delete('/:id', MentorController.deleteMentorController);

export const MentorRoutes = router;
