import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import config from './index';

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

// ─── Image Storage (Course thumbnails, Banners, etc.) ───────
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => ({
    folder: 'bdcalling-academy/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1280, height: 720, crop: 'limit', quality: 'auto' }],
    public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
  }),
});

// ─── Video Storage (Lesson videos, Recordings) ──────────────
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => ({
    folder: 'bdcalling-academy/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
  }),
});

// ─── File Storage (PDFs, PPTs, DOCs, ZIPs) ──────────────────
const fileStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => ({
    folder: 'bdcalling-academy/materials',
    resource_type: 'raw',
    allowed_formats: ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'zip', 'xlsx'],
    public_id: `${Date.now()}-${file.originalname}`,
  }),
});

// ─── Multer Upload Middlewares ───────────────────────────────
export const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
});

export const uploadFile = multer({
  storage: fileStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

export { cloudinary };
