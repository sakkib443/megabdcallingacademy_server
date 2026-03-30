/**
 * Mentor ↔ User Migration Script
 * 
 * এই script:
 * 1. User collection থেকে সব role='mentor' delete করবে
 * 2. Mentor collection থেকে সব mentor নিয়ে প্রতিটির জন্য User account create করবে
 * 3. Mentor document-এ userId link করবে
 * 
 * Usage: npx ts-node src/scripts/migrateMentors.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../app/modules/user/user.model';
import { Mentor } from '../app/modules/mentor/mentor.model';

dotenv.config({ path: path.join(process.cwd(), '.env') });

async function migrateMentors() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error('DATABASE_URL is not defined');

    console.log('🔌 Connecting to database...');
    await mongoose.connect(dbUrl);
    console.log('✅ Database connected\n');

    // ─── Step 1: Delete all mentor users ────────────────
    console.log('🗑️  Step 1: Deleting all existing mentor users...');
    const deleteResult = await User.deleteMany({ role: 'mentor' });
    console.log(`   ✅ Deleted ${deleteResult.deletedCount} mentor user(s)\n`);

    // ─── Step 2: Get all mentors ────────────────────────
    console.log('📋 Step 2: Reading all mentors...');
    const mentors = await Mentor.find();
    console.log(`   Found ${mentors.length} mentor(s)\n`);

    if (mentors.length === 0) {
      console.log('⚠️  No mentors found. Nothing to migrate.');
      await mongoose.disconnect();
      process.exit(0);
    }

    // ─── Step 3: Create User for each Mentor ────────────
    console.log('🔄 Step 3: Creating User accounts for each mentor...\n');
    let created = 0;
    let skipped = 0;

    for (const mentor of mentors) {
      const mentorName = mentor.name || 'Mentor';
      const mentorEmail = mentor.email;
      const mentorPhone = mentor.phone || '';

      // Skip if no email
      if (!mentorEmail) {
        console.log(`   ⚠️  Skipped "${mentorName}" — no email`);
        skipped++;
        continue;
      }

      // Check if email already exists in User
      const existingUser = await User.findOne({ email: mentorEmail });
      if (existingUser) {
        console.log(`   ⚠️  Skipped "${mentorName}" — email ${mentorEmail} already exists as ${existingUser.role}`);
        // Still link if not linked
        if (!mentor.userId) {
          await Mentor.findByIdAndUpdate(mentor._id, { userId: existingUser._id });
          console.log(`       → Linked existing user to mentor`);
        }
        skipped++;
        continue;
      }

      // Generate user ID
      const userCount = await User.countDocuments();
      const userId = `bac-mentor-${String(userCount + 1).padStart(3, '0')}`;

      // Split name
      const nameParts = mentorName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      // Create User
      const defaultPassword = 'Mentor@123456';
      const newUser = await User.create({
        id: userId,
        email: mentorEmail,
        firstName,
        lastName,
        phoneNumber: mentorPhone,
        password: defaultPassword,
        role: 'mentor',
        status: 'active',
        isDeleted: false,
        isPasswordChanged: false,
        image: mentor.image || '',
      });

      // Update Mentor with userId
      await Mentor.findByIdAndUpdate(mentor._id, { userId: newUser._id });

      console.log(`   ✅ ${mentorName}`);
      console.log(`      📧 ${mentorEmail} | 🆔 ${userId} | 🔑 ${defaultPassword}`);
      created++;
    }

    // ─── Summary ────────────────────────────────────────
    console.log('\n' + '━'.repeat(55));
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Created: ${created} user account(s)`);
    console.log(`   ⚠️  Skipped: ${skipped}`);
    console.log(`   🔑 Default Password: Mentor@123456`);
    console.log('━'.repeat(55));
    console.log('\n⚠️  গুরুত্বপূর্ণ: সব mentor-কে বলুন first login-এ password change করতে!');

    await mongoose.disconnect();
    console.log('\n👋 Done! Database disconnected.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

migrateMentors();
