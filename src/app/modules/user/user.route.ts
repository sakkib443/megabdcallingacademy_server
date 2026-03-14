import express from 'express';
import { UserController } from './user.controller';
import validateRequest from '../../middlewares/validateRequest';
import { userValidationSchema } from './user.validation';
import { authMiddleware } from '../../middlewares/auth';
import { fixDuplicateUserIds } from './user.migration';



const router = express.Router();

router.post('/signup', validateRequest(userValidationSchema), UserController.createUserController);
router.get('/', UserController.getAllUsersController);

// Migration endpoint to fix duplicate user IDs (run once) - MUST be before /:id routes
router.post('/fix-duplicate-ids', async (req, res) => {
    try {
        const result = await fixDuplicateUserIds();
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Routes with :id parameter - these must come AFTER specific routes
router.get('/:id', UserController.getSingleUserController);
router.patch('/:id', UserController.updateUserController);
router.delete('/:id', authMiddleware, UserController.deleteUserController);

export const UserRoutes = router;
