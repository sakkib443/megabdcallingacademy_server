/**
 * Bulk Enroll Students into WordPress Course + PROWOR-01 Batch
 * Run: node scripts/enroll-wordpress-students.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/bdcalling-academy';
const COURSE_ID = '694950230e4c0c0b63c79e4e'; // Professional WordPress Development (Offline)
const BATCH_ID = '69cb7a03b59ac7dff3f596d3';   // PROWOR-01

const students = [
    { sid: 'S357934', name: 'Md. Rasel', phone: '1950574120' },
    { sid: 'S359815', name: 'MD Al Amin Hossain', phone: '1976497337' },
    { sid: 'S361702', name: 'Tarafder Istiak Ahmed Fuad', phone: '1799956162' },
    { sid: 'S365464', name: 'Istiak Ahmed Shuvo', phone: '1997543810' },
    { sid: 'S365841', name: 'Rasedul Islam Shohag', phone: '1903175478' },
    { sid: 'S402841', name: 'Ataur Rahman', phone: '1979416995' },
    { sid: 'S383229', name: 'MD Hridoy', phone: '1605635976' },
    { sid: 'S390140', name: 'Md. Ziaur Rahman', phone: '1877465434' },
    { sid: 'S400721', name: 'Mohin Uddin', phone: '01619129380' },
    { sid: 'S400830', name: 'Sajedul Islam', phone: '1756878965' },
    { sid: 'S401293', name: 'Porimol Chandra Roy', phone: '1796823612' },
    { sid: 'S403061', name: 'Md Uzzal Hossain', phone: '1647208226' },
    { sid: 'S408334', name: 'Aditta Dev Sharma', phone: '01305188814' },
    { sid: 'S408335', name: 'Nur Nobi', phone: '1772955156' },
    { sid: 'S389702', name: 'Mst. Setu Akter', phone: '1761332232' },
    { sid: 'S366047', name: 'Hafiz Uddin', phone: '1944913166' },
    { sid: 'S379425', name: 'Md Tanvir Hasan', phone: '1772339498' },
];

function makeEmail(name) {
    return name
        .replace(/\(online\)/gi, '')
        .replace(/\./g, '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '') + '@gmail.com';
}

async function main() {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({
        id: String, email: String, firstName: String, lastName: String,
        phoneNumber: String, password: String, isPasswordChanged: Boolean,
        role: String, status: String, isDeleted: Boolean, image: String,
        googleId: String, authProvider: String,
    }, { timestamps: true }));

    const Enrollment = mongoose.model('Enrollment', new mongoose.Schema({
        studentId: mongoose.Schema.Types.ObjectId,
        courseId: mongoose.Schema.Types.ObjectId,
        batchId: mongoose.Schema.Types.ObjectId,
        status: String, enrolledAt: Date, expiresAt: Date,
        payment: { amount: Number, method: String, transactionId: String, status: String, paidAt: Date, gatewayData: mongoose.Schema.Types.Mixed },
        completionPercent: Number, studentStatus: String, completedAt: Date, isDeleted: Boolean,
    }, { timestamps: true }));

    const results = [];

    for (const s of students) {
        const email = makeEmail(s.name);
        const password = email; // password = email
        const nameParts = s.name.replace(/\(online\)/gi, '').trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        try {
            // Check if user already exists
            let user = await User.findOne({ email, isDeleted: { $ne: true } });

            if (!user) {
                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);

                user = await User.create({
                    id: s.sid,
                    email,
                    firstName,
                    lastName,
                    phoneNumber: s.phone,
                    password: hashedPassword,
                    isPasswordChanged: false,
                    role: 'user',
                    status: 'active',
                    isDeleted: false,
                    image: '',
                    googleId: '',
                    authProvider: 'local',
                });
                console.log(`  ✅ User created: ${s.name} → ${email}`);
            } else {
                console.log(`  ⚠️  User exists: ${email} (using existing)`);
            }

            // Check if enrollment exists
            const existingEnrollment = await Enrollment.findOne({
                studentId: user._id,
                courseId: new mongoose.Types.ObjectId(COURSE_ID),
                isDeleted: { $ne: true },
            });

            if (!existingEnrollment) {
                await Enrollment.create({
                    studentId: user._id,
                    courseId: new mongoose.Types.ObjectId(COURSE_ID),
                    batchId: new mongoose.Types.ObjectId(BATCH_ID),
                    status: 'active',
                    enrolledAt: new Date(),
                    payment: {
                        amount: 0,
                        method: 'manual',
                        status: 'pending',
                    },
                    completionPercent: 0,
                    studentStatus: 'active',
                    isDeleted: false,
                });
                console.log(`  📚 Enrolled in WordPress + PROWOR-01 batch`);
            } else {
                // Update batch if not set
                if (!existingEnrollment.batchId) {
                    existingEnrollment.batchId = new mongoose.Types.ObjectId(BATCH_ID);
                    await existingEnrollment.save();
                    console.log(`  📚 Batch updated to PROWOR-01`);
                } else {
                    console.log(`  ⚠️  Already enrolled`);
                }
            }

            results.push({
                name: s.name,
                studentId: s.sid,
                email,
                password,
                phone: s.phone,
                status: '✅ Done',
            });
        } catch (err) {
            console.error(`  ❌ Error for ${s.name}:`, err.message);
            results.push({
                name: s.name,
                studentId: s.sid,
                email,
                password,
                phone: s.phone,
                status: `❌ ${err.message}`,
            });
        }
    }

    console.log('\n\n═══════════════════════════════════════════════════════');
    console.log('  STUDENT CREDENTIALS - WordPress (PROWOR-01)');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('| # | Student ID | Name | Email (Username) | Password | Phone | Status |');
    console.log('|---|-----------|------|------------------|----------|-------|--------|');
    results.forEach((r, i) => {
        console.log(`| ${i+1} | ${r.studentId} | ${r.name} | ${r.email} | ${r.password} | ${r.phone} | ${r.status} |`);
    });

    console.log(`\n✅ Total: ${results.filter(r => r.status.includes('✅')).length}/${results.length} enrolled successfully`);
    console.log('Course: Professional WordPress Development (Offline)');
    console.log('Batch: PROWOR-01\n');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
}

main().catch(console.error);
