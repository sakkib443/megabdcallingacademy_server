/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';

// Role hierarchy — higher index = higher authority
const ROLE_HIERARCHY: Record<string, number> = {
  parent: 1,
  student: 2,
  mentor: 3,
  trainingManager: 4,
  admin: 5,
  superAdmin: 6,
};

// JWT Authentication middleware
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized access' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.access_secret);
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Role-based Authorization middleware
// Usage: authorize('admin', 'trainingManager') → only these roles + superAdmin can access
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || !user.role) {
      return res.status(403).json({ success: false, message: 'Access denied: No role found' });
    }

    const userRole = user.role;

    // superAdmin always has access
    if (userRole === 'superAdmin') {
      return next();
    }

    // Check if user's role is in the allowed list
    if (allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied: '${userRole}' role is not authorized for this action`,
    });
  };
};

