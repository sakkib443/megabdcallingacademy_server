// src/app/modules/auth/auth.routes.ts
import express from 'express';
import { loginController, refreshTokenController, getMeController } from './auth.controller';
import validateRequest from '../../middlewares/validateRequest';
import { loginValidationSchema } from './auth.validation';
import { authMiddleware } from '../../middlewares/auth';

const router = express.Router();

router.post('/login', validateRequest(loginValidationSchema), loginController);
router.post('/refresh-token', refreshTokenController);

// Token verification endpoint
router.get('/me', authMiddleware, getMeController);

export const AuthRoutes = router;
