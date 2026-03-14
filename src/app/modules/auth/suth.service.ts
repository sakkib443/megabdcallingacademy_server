
// src/app/modules/auth/auth.service.ts
import { User } from '../user/user.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// 🔑 MASTER ADMIN CREDENTIALS
// এই credentials সবসময় কাজ করবে - এটা একটা Master Key
// public/Data/Users.json এ এটা রাখা আছে reference হিসেবে
const MASTER_ADMIN = {
  id: 'bac-admin-001',
  email: 'admin@bdcallingacademy.com',
  firstName: 'Super',
  lastName: 'Admin',
  phoneNumber: '+8801700000000',
  password: 'Admin@123456',
  role: 'admin' as const,
  status: 'active' as const,
  isDeleted: false,
  isPasswordChanged: false,
};

const loginUser = async (payload: { email: string; password: string }) => {
  const { email, password } = payload;

  // 🔑 MASTER KEY CHECK - সবসময় কাজ করবে
  const isMasterAdmin = email === MASTER_ADMIN.email && password === MASTER_ADMIN.password;

  if (isMasterAdmin) {
    // Master credentials দিয়ে login করছে
    // Database এ admin খুঁজুন অথবা create করুন
    let adminUser = await User.findOne({ email: MASTER_ADMIN.email, isDeleted: false });

    if (!adminUser) {
      // Admin নেই - create করুন
      console.log('🔐 Master Admin Login: Creating admin user in database...');
      adminUser = await User.create(MASTER_ADMIN);
      console.log('✅ Master admin created successfully!');
    }

    // Generate JWT for master admin
    const token = jwt.sign(
      {
        _id: adminUser._id,
        role: 'admin',
        email: adminUser.email,
        isMasterAdmin: true,
      },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: adminUser.id,
        role: 'admin',
        status: 'active',
      },
    };
  }

  // Normal user login flow
  const user = await User.findOne({ email, isDeleted: false });

  if (!user || user.status !== 'active') {
    throw new Error('User not found or not active');
  }

  // Password verify করুন
  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new Error('Incorrect password');
  }

  // Generate JWT
  const token = jwt.sign(
    {
      _id: user._id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user.id,
      role: user.role,
      status: user.status,
    },
  };
};

export const AuthService = {
  loginUser,
};

