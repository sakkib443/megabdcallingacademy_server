
// src/app/modules/auth/auth.service.ts
import { User } from '../user/user.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
      // Upgrade existing admin to superAdmin
      adminUser.role = 'superAdmin' as any;
      await adminUser.save();
      console.log('🔄 Upgraded existing admin to superAdmin');
    }

    const token = jwt.sign(
      {
        _id: adminUser._id,
        role: 'superAdmin',
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

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new Error('Incorrect password');
  }

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
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
    },
  };
};

export const AuthService = {
  loginUser,
};
