/**
 * Mentor Fix Script
 * 1. No email → fullname@gmail.com generate
 * 2. Already exist as student → change role to mentor
 * 3. Not linked → create user + link
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../app/modules/user/user.model';
import { Mentor } from '../app/modules/mentor/mentor.model';

dotenv.config({ path: path.join(process.cwd(), '.env') });

async function fixMentors() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error('DATABASE_URL is not defined');

    console.log('🔌 Connecting...');
    await mongoose.connect(dbUrl);
    console.log('✅ Connected\n');

    const mentors = await Mentor.find();
    console.log(`📋 Found ${mentors.length} mentor(s)\n`);

    let fixed = 0;

    for (const mentor of mentors) {
      const mentorName = mentor.name || 'Mentor';
      let mentorEmail = mentor.email;

      // ─── Fix 1: No email → generate fullname@gmail.com
      if (!mentorEmail) {
        mentorEmail = mentorName.toLowerCase().replace(/\s+/g, '') + '@gmail.com';
        await Mentor.findByIdAndUpdate(mentor._id, { email: mentorEmail });
        console.log(`📧 Generated email for "${mentorName}": ${mentorEmail}`);
      }

      // ─── Fix 2: Already exists as different role → change to mentor
      const existingUser = await User.findOne({ email: mentorEmail });
      if (existingUser) {
        if (existingUser.role !== 'mentor') {
          await User.findByIdAndUpdate(existingUser._id, { role: 'mentor' });
          console.log(`🔄 Changed "${mentorName}" (${mentorEmail}) role from "${existingUser.role}" → "mentor"`);
        }
        // Link if not linked
        if (!mentor.userId || String(mentor.userId) !== String(existingUser._id)) {
          await Mentor.findByIdAndUpdate(mentor._id, { userId: existingUser._id });
          console.log(`🔗 Linked "${mentorName}" → User ${existingUser._id}`);
        } else {
          console.log(`✅ "${mentorName}" already linked`);
        }
        fixed++;
        continue;
      }

      // ─── Fix 3: No user exists → create new
      const userCount = await User.countDocuments();
      const userId = `bac-mentor-${String(userCount + 1).padStart(3, '0')}`;
      const nameParts = mentorName.trim().split(' ');

      const newUser = await User.create({
        id: userId,
        email: mentorEmail,
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' ') || '',
        phoneNumber: mentor.phone || '',
        password: 'Mentor@123456',
        role: 'mentor',
        status: 'active',
        isDeleted: false,
        isPasswordChanged: false,
        image: mentor.image || '',
      });

      await Mentor.findByIdAndUpdate(mentor._id, { userId: newUser._id });
      console.log(`✅ Created user for "${mentorName}" | ${mentorEmail} | 🆔 ${userId}`);
      fixed++;
    }

    console.log('\n' + '━'.repeat(50));
    console.log(`📊 Fixed: ${fixed}/${mentors.length} mentors`);
    console.log('━'.repeat(50));

    // Verify
    console.log('\n📋 Final status:');
    const allMentors = await Mentor.find().populate('userId', 'email role');
    for (const m of allMentors) {
      const u = m.userId as any;
      console.log(`  ${m.name} | ${m.email} | User: ${u ? `${u.email} (${u.role})` : '❌ NOT LINKED'}`);
    }

    await mongoose.disconnect();
    console.log('\n👋 Done!');
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixMentors();
