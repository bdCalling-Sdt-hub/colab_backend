import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import normalUserValidations from './normalUser.validation';
import NormalUserController from './normalUser.controller';
import { uploadFile } from '../../helper/fileUploader';

const router = express.Router();

router.patch(
  '/update-profile',
  auth(USER_ROLE.user),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(normalUserValidations.normalUserUpdateValidationSchema),
  NormalUserController.updateUserProfile,
);

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
  NormalUserController.addVideos,
);

router.patch(
  '/increase-total-scroll',
  auth(USER_ROLE.user),
  NormalUserController.increseTotalScroll,
);

router.get(
  '/all-users',
  auth(USER_ROLE.user, USER_ROLE.superAdmin),
  NormalUserController.getAllUser,
);
router.get(
  '/get-single-user/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.user),
  NormalUserController.getSingleUser,
);
export const normalUserRoutes = router;
