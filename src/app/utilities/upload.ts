import multer, { StorageEngine, FileFilterCallback } from 'multer';
import fs from 'fs';
import { Request, Express } from 'express';
import AppError from '../error/appError';
import httpStatus from 'http-status';

// Define storage configuration
const storage: StorageEngine = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    const fileType = file.mimetype.split('/')[0]; // Determine the type (image, video, audio)
    const folderMap: { [key: string]: string } = {
      image: 'uploads/message-media/image',
      video: 'uploads/message-media/video',
      audio: 'uploads/message-media/audio',
    };

    const folder = folderMap[fileType];
    if (!folder) {
      // Call cb with both arguments: error and folder path
      return cb(new Error('Invalid file type'), ''); // Provide empty string for destination if invalid
    }

    // Ensure the folder exists
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder); // No error, pass the folder path
  },
  filename: (req: Request, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName); // No error, pass the filename
  },
});

// File filter to validate file types
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const validMimeTypes = [
    'image/jpeg',
    'image/png',
    'video/mp4',
    'audio/mpeg',
    'audio/mp3',
  ];
  if (validMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Valid file type
  } else {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid file type');
  }
};

// Multer middleware
const upload = multer({ storage, fileFilter });

export default upload;
