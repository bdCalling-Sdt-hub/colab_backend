import express from 'express';
import { USER_ROLE } from '../user/user.constant';
import auth from '../../middlewares/auth';
import StripeController from './stripe.controller';

const router = express.Router();

router.post(
  '/connect-stripe',
  auth(USER_ROLE.user),
  StripeController.createOnboardingLink,
);

router.post(
  '/update-connected-account',
  auth(USER_ROLE.user),
  StripeController.updateOnboardingLink,
);

export const stripeRoutes = router;
