import { Router } from 'express';
import { userRoutes } from '../modules/user/user.routes';
import { authRoutes } from '../modules/auth/auth.routes';
import { ManageRoutes } from '../modules/manage-web/manage.routes';
import { normalUserRoutes } from '../modules/normalUser/normalUser.routes';
import { notificationRoutes } from '../modules/notification/notification.routes';
import { categoryRoutes } from '../modules/category/category.routes';
import { subscriptionRoutes } from '../modules/subscription/subscription.routes';
import { collaborationRoutes } from '../modules/collaboration/collaboration.routes';
import { reportRoutes } from '../modules/report/report.routes';
import { bookmarkRoutes } from '../modules/bookmark/bookmark.routes';

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
    path: '/subcription',
    router: subscriptionRoutes,
  },
  {
    path: '/collaboration',
    router: collaborationRoutes,
  },
  {
    path: '/report',
    router: reportRoutes,
  },
  {
    path: '/bookmark',
    router: bookmarkRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.router));

export default router;
