/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request } from 'express';
import multer from 'multer';
import fs from 'fs';
export const uploadFile = () => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      let uploadPath = '';

      if (file.fieldname === 'profile_image') {
        uploadPath = 'uploads/images/profile';
      } else if (file.fieldname === 'category_image') {
        uploadPath = 'uploads/images/category';
      } else if (file.fieldname === 'video') {
        uploadPath = 'uploads/videos';
      } else if (file.fieldname === 'chat_images') {
        uploadPath = 'uploads/images/chat_image';
      } else if (file.fieldname === 'chat_videos') {
        uploadPath = 'uploads/videos/chat_videos';
      } else if (file.fieldname === 'team_logo') {
        uploadPath = 'uploads/images/team_logo';
      } else if (file.fieldname === 'team_bg_image') {
        uploadPath = 'uploads/images/team_bg_image';
      } else if (file.fieldname === 'player_image') {
        uploadPath = 'uploads/images/player_image';
      } else if (file.fieldname === 'player_bg_image') {
        uploadPath = 'uploads/images/player_bg_image';
      } else if (file.fieldname === 'reward_image') {
        uploadPath = 'uploads/images/reward_image';
      } else if (file.fieldname === 'thumbnail') {
        uploadPath = 'uploads/images/thumbnail';
      } else {
        uploadPath = 'uploads';
      }

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      if (
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/webp' ||
        file.mimetype === 'video/mp4' ||
        file.mimetype === 'video/mov' ||
        file.mimetype === 'video/quicktime' ||
        file.mimetype === 'video/mpeg' ||
        file.mimetype === 'video/ogg' ||
        file.mimetype === 'video/webm' ||
        file.mimetype === 'video/x-msvideo' ||
        file.mimetype === 'video/x-flv' ||
        file.mimetype === 'video/3gpp' ||
        file.mimetype === 'video/3gpp2' ||
        file.mimetype === 'video/x-matroska'
      ) {
        cb(null, uploadPath);
      } else {
        //@ts-ignore
        cb(new Error('Invalid file type'));
      }
    },
    filename: function (req, file, cb) {
      const name = Date.now() + '-' + file.originalname;
      cb(null, name);
    },
  });

  const fileFilter = (req: Request, file: any, cb: any) => {
    const allowedFieldnames = [
      'image',
      'profile_image',
      'league_image',
      'category_image',
      'team_logo',
      'team_bg_image',
      'player_image',
      'player_bg_image',
      'reward_image',
      'video',
      'thumbnail',
      'chat_images',
      'chat_videos',
    ];

    if (file.fieldname === undefined) {
      // Allow requests without any files
      cb(null, true);
    } else if (allowedFieldnames.includes(file.fieldname)) {
      if (
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/webp' ||
        file.mimetype === 'video/mp4' ||
        file.mimetype === 'video/mov' ||
        file.mimetype === 'video/quicktime' ||
        file.mimetype === 'video/mpeg' ||
        file.mimetype === 'video/ogg' ||
        file.mimetype === 'video/webm' ||
        file.mimetype === 'video/x-msvideo' ||
        file.mimetype === 'video/x-flv' ||
        file.mimetype === 'video/3gpp' ||
        file.mimetype === 'video/3gpp2' ||
        file.mimetype === 'video/x-matroska'
      ) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type'));
      }
    } else {
      cb(new Error('Invalid fieldname'));
    }
  };

  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
  }).fields([
    { name: 'image', maxCount: 1 },
    { name: 'profile_image', maxCount: 1 },
    { name: 'category_image', maxCount: 1 },
    { name: 'sub_category_image', maxCount: 1 },
    { name: 'league_image', maxCount: 5 },
    { name: 'team_logo', maxCount: 1 },
    { name: 'team_bg_image', maxCount: 1 },
    { name: 'player_image', maxCount: 1 },
    { name: 'player_bg_image', maxCount: 1 },
    { name: 'reward_image', maxCount: 1 },
    { name: 'thumbnail', maxCount: 3 },
    { name: 'video', maxCount: 5 },
    { name: 'chat_videos', maxCount: 2 },
    { name: 'chat_images', maxCount: 7 },
  ]);

  return upload;
};
