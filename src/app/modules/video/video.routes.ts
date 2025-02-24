import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import VideoController from './video.controller';
import { uploadFile } from '../../helper/fileUploader';

const router = express.Router();

router.post(
  '/add-videos',
  auth(USER_ROLE.user),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  VideoController.addVideo,
);
router.post(
  '/update-video/:id',
  auth(USER_ROLE.user),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  VideoController.updateVideo,
);

export const videoRoutes = router;
