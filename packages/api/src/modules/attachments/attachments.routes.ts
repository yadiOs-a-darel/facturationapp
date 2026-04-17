import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../../middleware/auth';
import {
  listInvoiceAttachments,
  uploadInvoiceAttachment,
  deleteAttachment,
} from './attachments.controller';

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

const upload = multer({ storage });

export const attachmentsRouter = Router();

attachmentsRouter.use(authMiddleware);

attachmentsRouter.get('/invoices/:id/attachments', listInvoiceAttachments);
attachmentsRouter.post(
  '/invoices/:id/attachments',
  upload.single('file'),
  uploadInvoiceAttachment,
);
attachmentsRouter.delete('/attachments/:id', deleteAttachment);

