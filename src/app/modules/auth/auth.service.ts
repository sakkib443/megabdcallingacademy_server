
// src/app/modules/auth/auth.service.ts
import { User } from '../user/user.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../../config';

// 🔑 MASTER SUPER ADMIN CREDENTIALS
const MASTER_ADMIN = {
  id: 'bac-admin-001',
  email: 'admin@bdcallingacademy.com',
  firstName: 'Super',
  lastName: 'Admin',
  phoneNumber: '+8801700000000',
  password: 'Admin@123456',
  role: 'superAdmin' as const,
  status: 'active' as const,
  isDeleted: false,
  isPasswordChanged: false,
};

// Helper: Generate tokens
const generateTokens = (payload: { _id: string; role: string; email: string; isMasterAdmin?: boolean }) => {
  const accessToken = jwt.sign(payload, config.jwt.access_secret, {
    expiresIn: config.jwt.access_expires_in as any,
  });

  const refreshToken = jwt.sign(
    { _id: payload._id, role: payload.role },
    config.jwt.refresh_secret,
    { expiresIn: config.jwt.refresh_expires_in as any }
  );

  return { accessToken, refreshToken };
};

const loginUser = async (payload: { email: string; password: string }) => {
  const { email, password } = payload;

  // 🔑 MASTER KEY CHECK — সবসময় কাজ করবে
  const isMasterAdmin = email === MASTER_ADMIN.email && password === MASTER_ADMIN.password;

  if (isMasterAdmin) {
    let adminUser = await User.findOne({ email: MASTER_ADMIN.email, isDeleted: false });

    if (!adminUser) {
      console.log('🔐 Master Admin Login: Creating super admin user in database...');
      adminUser = await User.create(MASTER_ADMIN);
      console.log('✅ Master super admin created successfully!');
    } else if (adminUser.role !== 'superAdmin') {
      adminUser.role = 'superAdmin' as any;
      await adminUser.save();
      console.log('🔄 Upgraded existing admin to superAdmin');
    }

    const { accessToken, refreshToken } = generateTokens({
      _id: String(adminUser._id),
      role: 'superAdmin',
      email: adminUser.email,
      isMasterAdmin: true,
    });

    return {
      token: accessToken, // backward compat for existing frontend
      accessToken,
      refreshToken,
      user: {
        id: adminUser.id,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        role: 'superAdmin',
        status: 'active',
      },
    };
  }

  // Normal user login flow
  const user = await User.findOne({ email, isDeleted: false });

  if (!user || user.status !== 'active') {
    throw new Error('User not found or not active');
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password || '');

  if (!isPasswordMatched) {
    throw new Error('Incorrect password');
  }

  const { accessToken, refreshToken } = generateTokens({
    _id: String(user._id),
    role: user.role,
    email: user.email,
  });

  return {
    token: accessToken, // backward compat for existing frontend
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
    },
  };
};

// Refresh token → new access token
const refreshAccessToken = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, config.jwt.refresh_secret) as any;

    const user = await User.findById(decoded._id);
    if (!user || user.isDeleted || user.status !== 'active') {
      throw new Error('User not found or inactive');
    }

    const accessToken = jwt.sign(
      { _id: String(user._id), role: user.role, email: user.email },
      config.jwt.access_secret,
      { expiresIn: config.jwt.access_expires_in as any }
    );

    return { accessToken };
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

// Change password
const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  const user = await User.findById(userId);
  if (!user || user.isDeleted) {
    throw new Error('User not found');
  }
  const isMatch = await bcrypt.compare(currentPassword, user.password || '');
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(userId, { password: hashedPassword });
};

export const AuthService = {
  loginUser,
  refreshAccessToken,
  changePassword,
};
