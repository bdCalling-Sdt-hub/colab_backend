import { Router } from 'express';
import { userRoutes } from '../modules/user/user.routes';
import { authRoutes } from '../modules/auth/auth.routes';
import { ManageRoutes } from '../modules/manage-web/manage.routes';
import { normalUserRoutes } from '../modules/normalUser/normalUser.routes';
import { notificationRoutes } from '../modules/notification/notification.routes';
import { categoryRoutes } from '../modules/category/category.routes';
import { subscriptionRoutes } from '../modules/subscription/subscription.routes';

const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    router: authRoutes,
  },
  {
    path: '/user',
    router: userRoutes,
  },
  {
    path: '/normal-user',
    router: normalUserRoutes,
  },
  {
    path: '/manage',
    router: ManageRoutes,
  },
  {
    path: '/notification',
    router: notificationRoutes,
  },
  {
    path: '/category',
    router: categoryRoutes,
  },
  {
    path: '/subscription',
    router: subscriptionRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.router));

export default router;
