// src/app/modules/auth/auth.routes.ts
import express from 'express';
import { loginController } from './auth.controller';
import validateRequest from '../../middlewares/validateRequest';
import { loginValidationSchema } from './auth.validation';

const router = express.Router();

router.post('/login', validateRequest(loginValidationSchema), loginController);

export const AuthRoutes = router;
