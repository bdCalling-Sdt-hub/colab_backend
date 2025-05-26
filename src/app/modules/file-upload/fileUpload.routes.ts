import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLE } from '../user/user.constant';
// import { uploadFile } from '../../helper/fileUploader';
import auth from '../../middlewares/auth';
import FileUploadController from './fileUpload.controller';
import { uploadFile } from '../../aws/multer-s3-uploader';

const router = express.Router();

router.post(
  '/upload-files',
  // auth(USER_ROLE.superAdmin, USER_ROLE.user),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  FileUploadController.uploadImages,
);
export const uploadRoutes = router;
