import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import MessageController from './message.controller';

const router = express.Router();

router.get(
  '/get-messages/:userId',
  auth(USER_ROLE.user),
  MessageController.getMessages,
);

export const messageRoutes = router;
