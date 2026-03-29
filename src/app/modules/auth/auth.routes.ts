// src/app/modules/auth/auth.routes.ts
import express from 'express';
import { loginController, refreshTokenController } from './auth.controller';
import validateRequest from '../../middlewares/validateRequest';
import { loginValidationSchema } from './auth.validation';

const router = express.Router();

router.post('/login', validateRequest(loginValidationSchema), loginController);
router.post('/refresh-token', refreshTokenController);

export const AuthRoutes = router;
