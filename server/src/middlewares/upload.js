// src/middlewares/upload.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { MAX_FILE_SIZE_MB, ALLOWED_CV_TYPES, ALLOWED_IMAGE_TYPES } from '../utils/constants.js';

// Pastikan folder uploads ada (gunakan /tmp/uploads jika berjalan di lingkungan serverless Vercel)
const uploadDir = process.env.VERCEL ? '/tmp/uploads' : path.resolve(env.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const sub = file.fieldname === 'cv' ? 'cv' : 'photo';
    const dir = path.join(uploadDir, sub);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}_${Date.now()}${ext}`);
  },
});

function fileFilter(allowedTypes) {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(`Tipe file tidak diizinkan: ${file.mimetype}`, 400));
    }
  };
}

export const uploadCV = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: fileFilter(ALLOWED_CV_TYPES),
}).single('cv');

export const uploadPhoto = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB untuk foto
  fileFilter: fileFilter(ALLOWED_IMAGE_TYPES),
}).single('photo');
