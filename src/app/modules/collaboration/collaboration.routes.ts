import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import CollaborationValidations from './collaboration.validation';
import validateRequest from '../../middlewares/validateRequest';
import CollaborationController from './collaboration.controller';

const router = express.Router();

router.post(
  '/send-request',
  auth(USER_ROLE.user),
  validateRequest(CollaborationValidations.collaborationSchema),
  CollaborationController.sendCollaborationRequest,
);

router.get(
  '/my-collaborations',
  auth(USER_ROLE.user),
  CollaborationController.getMyCollaborations,
);

router.get(
  '/get-all',
  auth(USER_ROLE.superAdmin),
  CollaborationController.getAllCollaborations,
);
export const collaborationRoutes = router;
