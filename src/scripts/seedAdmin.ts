/**
 * Admin Seeder Script
 * 
 * এই script টি প্রথমবার production এ deploy করার পর চালাতে হবে।
 * এটা একটা default admin user তৈরি করবে যদি কোনো admin না থাকে।
 * 
 * Usage: npx ts-node src/scripts/seedAdmin.ts
 * বা: npm run seed:admin
 * 
 * ⚠️ গুরুত্বপূর্ণ: Production এ deploy করার পর অবশ্যই password পরিবর্তন করুন!
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../app/modules/user/user.model';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Default admin credentials - ⚠️ CHANGE THESE IN PRODUCTION!
const DEFAULT_ADMIN = {
    id: 'bac-admin-001',
    email: 'admin@bdcallingacademy.com',
    firstName: 'Super',
    lastName: 'Admin',
    phoneNumber: '+8801700000000',
    password: 'Admin@123456', // ⚠️ প্রথম login এর পর এটা পরিবর্তন করুন!
    role: 'admin' as const,
    status: 'active' as const,
    isDeleted: false,
    isPasswordChanged: false,
};

async function seedAdmin() {
    try {
        // Connect to database
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            throw new Error('DATABASE_URL is not defined in environment variables');
        }

        console.log('🔌 Connecting to database...');
        await mongoose.connect(dbUrl);
        console.log('✅ Database connected successfully');

        // Check if any admin exists
        const existingAdmin = await User.findOne({ role: 'admin', isDeleted: false });

        if (existingAdmin) {
            console.log('⚠️  An admin user already exists!');
            console.log('📧 Email:', existingAdmin.email);
            console.log('🆔 ID:', existingAdmin.id);
            console.log('\nNo new admin created. Use existing admin to login.');
        } else {
            // Create default admin
            console.log('📝 Creating default admin user...');

            const newAdmin = await User.create(DEFAULT_ADMIN);

            console.log('\n✅ Admin user created successfully!');
            console.log('━'.repeat(50));
            console.log('📧 Email:', DEFAULT_ADMIN.email);
            console.log('🔑 Password:', DEFAULT_ADMIN.password);
            console.log('🆔 ID:', newAdmin.id);
            console.log('━'.repeat(50));
            console.log('\n⚠️  গুরুত্বপূর্ণ সতর্কতা:');
            console.log('   1. প্রথম login এর পর অবশ্যই password পরিবর্তন করুন!');
            console.log('   2. এই credentials কাউকে share করবেন না!');
            console.log('   3. Production এ এই script আবার চালাবেন না।');
        }

        // Disconnect
        await mongoose.disconnect();
        console.log('\n👋 Database disconnected. Bye!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding admin:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

// Run the seeder
seedAdmin();
