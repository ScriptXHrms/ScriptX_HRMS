import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { badRequest } from '../utils/http.js';

export const UPLOAD_ROOT = path.resolve('uploads');

const ALLOWED = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.csv', '.txt', '.zip']);

/** Accepts a single multipart file field and stores it under uploads/<folder>. */
export function uploader(folder) {
  const destination = path.join(UPLOAD_ROOT, folder);
  fs.mkdirSync(destination, { recursive: true });
  return multer({
    storage: multer.diskStorage({
      destination,
      filename: (req, file, done) => done(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, done) => {
      if (ALLOWED.has(path.extname(file.originalname).toLowerCase())) done(null, true);
      else done(badRequest('That file type is not allowed.'));
    },
  });
}

export const fileRecord = (file, folder) => ({
  name: file.originalname,
  url: `/uploads/${folder}/${file.filename}`,
  size: file.size,
});
