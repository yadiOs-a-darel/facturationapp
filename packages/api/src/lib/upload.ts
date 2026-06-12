import multer from 'multer';
import path from 'path';
import { ensureUploadDirs, logosDir } from './uploads';

ensureUploadDirs();

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]);

export const logoUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      ensureUploadDirs();
      cb(null, logosDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.png';
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `logo-${unique}${ext}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error('Format non supporté. Utilisez JPG, PNG, GIF, WebP ou SVG.'));
  },
});
