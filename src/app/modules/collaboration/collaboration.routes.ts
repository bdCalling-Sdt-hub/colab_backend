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
  '/all-collaborations',
  auth(USER_ROLE.superAdmin),
  CollaborationController.getAllCollaborations,
);

router.patch(
  '/update-collaboration/:id',
  auth(USER_ROLE.user),
  validateRequest(CollaborationValidations.updateCollaborationSchema),
  CollaborationController.updateCollaboration,
);

router.delete(
  '/delete-collaboration/:id',
  auth(USER_ROLE.user),
  CollaborationController.deleteCollaboration,
);

router.post(
  '/accept-reject-collaboration/:id',
  auth(USER_ROLE.user),
  validateRequest(
    CollaborationValidations.acceepRejectCollaborationValidations,
  ),
  CollaborationController.acceptRejectCollaboration,
);
router.get(
  '/single-collaboration/:id',
  auth(USER_ROLE.user, USER_ROLE.superAdmin),
  CollaborationController.getSingleCollaboration,
);

// mark as completed
router.post(
  '/mark-as-complete/:id',
  auth(USER_ROLE.user),
  CollaborationController.markAsComplete,
);

export const collaborationRoutes = router;
