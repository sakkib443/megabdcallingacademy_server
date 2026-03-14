import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

// Import the Seminar model
import { Seminar } from '../app/modules/seminar/seminar.model';

const seminarsData = [
  {
    title: 'Graphic Design Masterclass Seminar',
    titleBn: 'গ্রাফিক ডিজাইন মাস্টারক্লাস সেমিনার',
    description:
      'Learn the fundamentals of Graphic Design including Adobe Photoshop, Illustrator, and modern design principles. This seminar is designed for beginners who want to start a career in Graphic Design. Join us to learn from industry experts and get hands-on experience with real-world projects.',
    descriptionBn:
      'গ্রাফিক ডিজাইনের মৌলিক বিষয়গুলো শিখুন, যেমন Adobe Photoshop, Illustrator এবং আধুনিক ডিজাইন নীতিমালা। এই সেমিনারটি তাদের জন্য যারা গ্রাফিক ডিজাইনে ক্যারিয়ার শুরু করতে চান।',
    date: new Date('2026-03-25'),
    startTime: '19:00',
    endTime: '21:00',
    type: 'online',
    zoomMeetingId: '987-654-3210',
    zoomJoinLink: 'https://zoom.us/j/9876543210',
    zoomPasscode: 'GD2026',
    speaker: 'Md. Rafiul Islam',
    speakerDesignation: 'Senior Graphic Designer, Bdcalling Academy',
    maxSeats: 200,
    status: 'upcoming',
    isFeatured: true,
    relatedCourses: ['Graphic Design'],
  },
  {
    title: 'Video Editing Professional Seminar',
    titleBn: 'ভিডিও এডিটিং প্রফেশনাল সেমিনার',
    description:
      'Master the art of Video Editing using Adobe Premiere Pro, After Effects, and DaVinci Resolve. This seminar covers color grading, transitions, sound design, and storytelling techniques used in the film and content creation industry.',
    descriptionBn:
      'Adobe Premiere Pro, After Effects এবং DaVinci Resolve ব্যবহার করে ভিডিও এডিটিংয়ের শিল্প আয়ত্ত করুন। এই সেমিনারে কালার গ্রেডিং, ট্রানজিশন, সাউন্ড ডিজাইন এবং স্টোরিটেলিং টেকনিক শেখানো হবে।',
    date: new Date('2026-03-28'),
    startTime: '20:00',
    endTime: '22:00',
    type: 'online',
    zoomMeetingId: '123-456-7890',
    zoomJoinLink: 'https://zoom.us/j/1234567890',
    zoomPasscode: 'VE2026',
    speaker: 'Tanjim Ahmed',
    speakerDesignation: 'Lead Video Editor, Bdcalling Academy',
    maxSeats: 150,
    status: 'upcoming',
    isFeatured: true,
    relatedCourses: ['Video Editing'],
  },
  {
    title: 'Motion Graphics & Animation Seminar',
    titleBn: 'মোশন গ্রাফিক্স ও অ্যানিমেশন সেমিনার',
    description:
      'Explore the exciting world of Motion Graphics and Animation. Learn Adobe After Effects, Cinema 4D, and modern animation techniques. This seminar showcases how motion graphics is used in advertising, social media, and film industry to create stunning visual content.',
    descriptionBn:
      'মোশন গ্রাফিক্স এবং অ্যানিমেশনের উত্তেজনাপূর্ণ জগৎ অন্বেষণ করুন। Adobe After Effects, Cinema 4D এবং আধুনিক অ্যানিমেশন কৌশল শিখুন। এই সেমিনারে দেখানো হবে কীভাবে মোশন গ্রাফিক্স বিজ্ঞাপন, সোশ্যাল মিডিয়া এবং চলচ্চিত্র শিল্পে ব্যবহৃত হয়।',
    date: new Date('2026-04-02'),
    startTime: '19:30',
    endTime: '21:30',
    type: 'hybrid',
    zoomMeetingId: '456-789-0123',
    zoomJoinLink: 'https://zoom.us/j/4567890123',
    zoomPasscode: 'MG2026',
    venue: 'Bdcalling Academy, Mirpur-10',
    venueAddress: 'House-4, Road-3, Block-C, Mirpur-10, Dhaka-1216',
    speaker: 'Kamrul Hasan',
    speakerDesignation: 'Motion Graphics Artist, Bdcalling Academy',
    maxSeats: 100,
    status: 'upcoming',
    isFeatured: false,
    relatedCourses: ['Motion Graphics'],
  },
  {
    title: 'Web Development & WordPress Seminar',
    titleBn: 'ওয়েব ডেভেলপমেন্ট ও ওয়ার্ডপ্রেস সেমিনার',
    description:
      'Kickstart your career in Web Development and WordPress. Learn HTML, CSS, JavaScript, React.js, Node.js and WordPress theme development. This comprehensive seminar covers both front-end and back-end development with real project demonstrations and career guidance.',
    descriptionBn:
      'ওয়েব ডেভেলপমেন্ট এবং ওয়ার্ডপ্রেসে আপনার ক্যারিয়ার শুরু করুন। HTML, CSS, JavaScript, React.js, Node.js এবং ওয়ার্ডপ্রেস থিম ডেভেলপমেন্ট শিখুন। এই ব্যাপক সেমিনারে ফ্রন্ট-এন্ড এবং ব্যাক-এন্ড উভয় ডেভেলপমেন্ট শেখানো হবে।',
    date: new Date('2026-04-05'),
    startTime: '18:00',
    endTime: '20:30',
    type: 'offline',
    venue: 'Bdcalling Academy Main Campus',
    venueAddress: 'House-4, Road-3, Block-C, Mirpur-10, Dhaka-1216',
    speaker: 'Sazzad Hossain',
    speakerDesignation: 'Lead Web Developer, Bdcalling Academy',
    maxSeats: 250,
    status: 'upcoming',
    isFeatured: true,
    relatedCourses: ['Web Development', 'WordPress'],
  },
];

async function seedSeminars() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    console.log('🔗 Connecting to database...');
    await mongoose.connect(dbUrl);
    console.log('✅ Database connected successfully!');

    // Check if seminars already exist
    const existingCount = await Seminar.countDocuments({ isDeleted: false });
    console.log(`📊 Existing seminars in DB: ${existingCount}`);

    // Insert seminars
    console.log('\n📝 Inserting 4 seminars...\n');
    
    for (const seminarData of seminarsData) {
      const seminar = await Seminar.create(seminarData);
      console.log(`✅ Created: "${seminar.title}"`);
      console.log(`   📌 ID: ${seminar._id}`);
      console.log(`   📅 Date: ${seminar.date.toLocaleDateString()}`);
      console.log(`   🕐 Time: ${seminar.startTime} - ${seminar.endTime}`);
      console.log(`   📍 Type: ${seminar.type}`);
      console.log(`   💺 Max Seats: ${seminar.maxSeats}`);
      console.log('');
    }

    // Final count
    const totalCount = await Seminar.countDocuments({ isDeleted: false });
    console.log(`\n🎉 Done! Total seminars in DB: ${totalCount}`);
    
    await mongoose.disconnect();
    console.log('🔌 Database disconnected.');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedSeminars();
