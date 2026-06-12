import fs from 'fs';
import path from 'path';

export const uploadsDir = path.join(__dirname, '..', 'uploads');
export const logosDir = path.join(uploadsDir, 'logos');

export function ensureUploadDirs() {
  for (const dir of [uploadsDir, logosDir]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}
