/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Upload generated course images to Cloudinary and update DB
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
dotenv.config();

import { Course } from './app/modules/courses/course.model';

const DB_URL = process.env.DATABASE_URL || '';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const images = [
  {
    courseId: 5001,
    localPath: 'C:/Users/User/.gemini/antigravity/brain/f2bb8287-f823-4ae0-a26d-7e89f02afe50/web_dev_course_1774776371614.png',
    publicId: 'bdcalling-academy/images/course-web-dev-js',
  },
  {
    courseId: 5002,
    localPath: 'C:/Users/User/.gemini/antigravity/brain/f2bb8287-f823-4ae0-a26d-7e89f02afe50/python_course_1774776389582.png',
    publicId: 'bdcalling-academy/images/course-python-masterclass',
  },
  {
    courseId: 5003,
    localPath: 'C:/Users/User/.gemini/antigravity/brain/f2bb8287-f823-4ae0-a26d-7e89f02afe50/dsa_course_1774776404976.png',
    publicId: 'bdcalling-academy/images/course-dsa-javascript',
  },
];

async function uploadImages() {
  console.log('🔄 Connecting to database...');
  await mongoose.connect(DB_URL);
  console.log('✅ Connected');

  for (const img of images) {
    console.log(`\n📤 Uploading image for course ${img.courseId}...`);
    try {
      const result = await cloudinary.uploader.upload(img.localPath, {
        folder: 'bdcalling-academy/images',
        public_id: `course-${img.courseId}`,
        overwrite: true,
        transformation: [{ width: 1280, height: 720, crop: 'limit', quality: 'auto' }],
      });

      console.log(`   ✅ Uploaded: ${result.secure_url}`);

      // Update course in DB
      const updated = await Course.findOneAndUpdate(
        { id: img.courseId },
        { image: result.secure_url },
        { new: true }
      );

      if (updated) {
        console.log(`   ✅ DB updated for: ${updated.title}`);
      } else {
        console.log(`   ⚠️ Course ${img.courseId} not found in DB`);
      }
    } catch (err: any) {
      console.error(`   ❌ Upload failed: ${err.message}`);
    }
  }

  console.log('\n🎉 All images uploaded and DB updated!');
  await mongoose.disconnect();
  process.exit(0);
}

uploadImages().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
