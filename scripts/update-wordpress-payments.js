/**
 * Update Payment Info for WordPress Students
 * - Sets enrollment.payment with total course price & paid amount
 * - Creates installment record for paid amount
 * - Remaining shows as due
 * 
 * Run: node scripts/update-wordpress-payments.js
 */
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/bdcalling-academy';
const COURSE_ID = '694950230e4c0c0b63c79e4e'; // Professional WordPress Development (Offline)
const COURSE_PRICE = 20000; // Total course price

// Students with their paid amounts
const paymentData = [
    { email: 'tarafderistiakahmedfuad@gmail.com', name: 'Tarafder Istiak Ahmed Fuad', paid: 7000 },
    { email: 'istiakahmedshuvo@gmail.com', name: 'Istiak Ahmed Shuvo', paid: 4000 },
    { email: 'mdhridoy@gmail.com', name: 'MD Hridoy', paid: 1000 },
    { email: 'mdziaurrahman@gmail.com', name: 'Md. Ziaur Rahman', paid: 4000 },
    { email: 'ataurrahman@gmail.com', name: 'Ataur Rahman', paid: 3000 },
    { email: 'mduzzalhossain@gmail.com', name: 'Md Uzzal Hossain', paid: 2000 },
    { email: 'adittadevsharma@gmail.com', name: 'Aditta Dev Sharma', paid: 5000 },
    // Students with no payment yet (0)
    { email: 'mdrasel@gmail.com', name: 'Md. Rasel', paid: 0 },
    { email: 'mdalaminhossain@gmail.com', name: 'MD Al Amin Hossain', paid: 0 },
    { email: 'rasedulislamshohag@gmail.com', name: 'Rasedul Islam Shohag', paid: 0 },
    { email: 'mohinuddin@gmail.com', name: 'Mohin Uddin', paid: 0 },
    { email: 'sajedulislam@gmail.com', name: 'Sajedul Islam', paid: 0 },
    { email: 'porimolchandraroy@gmail.com', name: 'Porimol Chandra Roy', paid: 0 },
    { email: 'nurnobi@gmail.com', name: 'Nur Nobi', paid: 0 },
    { email: 'mstsetuakter@gmail.com', name: 'Mst. Setu Akter', paid: 0 },
    { email: 'hafizuddin@gmail.com', name: 'Hafiz Uddin', paid: 0 },
    { email: 'mdtanvirhasan@gmail.com', name: 'Md Tanvir Hasan', paid: 0 },
];

async function main() {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const User = mongoose.model('User', new mongoose.Schema({
        id: String, email: String, firstName: String, lastName: String,
        phoneNumber: String, password: String, role: String, status: String,
        isDeleted: Boolean,
    }, { timestamps: true, strict: false }));

    const Enrollment = mongoose.model('Enrollment', new mongoose.Schema({
        studentId: mongoose.Schema.Types.ObjectId,
        courseId: mongoose.Schema.Types.ObjectId,
        batchId: mongoose.Schema.Types.ObjectId,
        status: String, enrolledAt: Date,
        payment: { amount: Number, method: String, transactionId: String, status: String, paidAt: Date },
        completionPercent: Number, studentStatus: String, isDeleted: Boolean,
    }, { timestamps: true, strict: false }));

    const Installment = mongoose.model('Installment', new mongoose.Schema({
        enrollmentId: mongoose.Schema.Types.ObjectId,
        studentId: mongoose.Schema.Types.ObjectId,
        courseId: mongoose.Schema.Types.ObjectId,
        installmentNumber: Number,
        amount: Number,
        dueDate: Date,
        paidDate: Date,
        status: String,
        transactionId: String,
        method: String,
        notes: String,
        isDeleted: Boolean,
    }, { timestamps: true }));

    const results = [];

    for (const s of paymentData) {
        try {
            // Find user
            const user = await User.findOne({ email: s.email, isDeleted: { $ne: true } });
            if (!user) {
                console.log(`  ❌ User not found: ${s.email}`);
                results.push({ name: s.name, paid: s.paid, due: COURSE_PRICE, status: '❌ User not found' });
                continue;
            }

            // Find enrollment
            const enrollment = await Enrollment.findOne({
                studentId: user._id,
                courseId: new mongoose.Types.ObjectId(COURSE_ID),
                isDeleted: { $ne: true },
            });

            if (!enrollment) {
                console.log(`  ❌ Enrollment not found: ${s.email}`);
                results.push({ name: s.name, paid: s.paid, due: COURSE_PRICE, status: '❌ No enrollment' });
                continue;
            }

            const due = COURSE_PRICE - s.paid;
            const payStatus = s.paid >= COURSE_PRICE ? 'paid' : s.paid > 0 ? 'paid' : 'pending';

            // Update enrollment payment
            await Enrollment.updateOne(
                { _id: enrollment._id },
                {
                    $set: {
                        'payment.amount': s.paid,
                        'payment.method': 'manual',
                        'payment.status': payStatus,
                        'payment.paidAt': s.paid > 0 ? new Date() : null,
                    }
                }
            );

            // Create installment for paid amount (if paid > 0)
            if (s.paid > 0) {
                // Check if installment already exists
                const existingInst = await Installment.findOne({
                    enrollmentId: enrollment._id,
                    installmentNumber: 1,
                    isDeleted: { $ne: true },
                });

                if (!existingInst) {
                    await Installment.create({
                        enrollmentId: enrollment._id,
                        studentId: user._id,
                        courseId: new mongoose.Types.ObjectId(COURSE_ID),
                        installmentNumber: 1,
                        amount: s.paid,
                        dueDate: new Date(),
                        paidDate: new Date(),
                        status: 'paid',
                        method: 'manual',
                        notes: `1st installment - ${s.paid}৳ paid`,
                        isDeleted: false,
                    });
                    console.log(`  ✅ ${s.name}: Paid ${s.paid}৳ | Due ${due}৳ | Installment #1 created`);
                } else {
                    // Update existing
                    existingInst.amount = s.paid;
                    existingInst.status = 'paid';
                    existingInst.paidDate = new Date();
                    await existingInst.save();
                    console.log(`  ✅ ${s.name}: Paid ${s.paid}৳ | Due ${due}৳ | Installment #1 updated`);
                }
            }

            // Create a "due" installment for the remaining amount
            if (due > 0) {
                const existingDue = await Installment.findOne({
                    enrollmentId: enrollment._id,
                    status: { $in: ['due', 'upcoming'] },
                    isDeleted: { $ne: true },
                });

                if (!existingDue) {
                    const instNum = s.paid > 0 ? 2 : 1;
                    await Installment.create({
                        enrollmentId: enrollment._id,
                        studentId: user._id,
                        courseId: new mongoose.Types.ObjectId(COURSE_ID),
                        installmentNumber: instNum,
                        amount: due,
                        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                        status: 'due',
                        method: 'manual',
                        notes: `Remaining balance - ${due}৳ due`,
                        isDeleted: false,
                    });
                    if (s.paid === 0) {
                        console.log(`  ⏳ ${s.name}: No payment yet | Full ${COURSE_PRICE}৳ due`);
                    }
                }
            }

            results.push({ name: s.name, paid: s.paid, due, status: '✅' });
        } catch (err) {
            console.error(`  ❌ Error for ${s.name}:`, err.message);
            results.push({ name: s.name, paid: s.paid, due: COURSE_PRICE - s.paid, status: '❌ Error' });
        }
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  PAYMENT SUMMARY - WordPress (PROWOR-01)');
    console.log('  Course Price: 20,000৳');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('| # | Name | Paid | Due | Status |');
    console.log('|---|------|------|-----|--------|');
    results.forEach((r, i) => {
        console.log(`| ${i+1} | ${r.name} | ${r.paid}৳ | ${r.due}৳ | ${r.status} |`);
    });

    const totalPaid = results.reduce((sum, r) => sum + r.paid, 0);
    const totalDue = results.reduce((sum, r) => sum + r.due, 0);
    console.log(`\n💰 Total Collected: ${totalPaid}৳ | Total Due: ${totalDue}৳`);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
}

main().catch(console.error);
