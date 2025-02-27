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
import { stripeRoutes } from '../modules/stripe/stripe.routes';
import { transactionRoutes } from '../modules/transaction/transaction.routes';
import { metaRoutes } from '../modules/meta/meta.routes';
import { superAdminRoutes } from '../modules/superAdmin/superAdmin.routes';
import { conversationRoutes } from '../modules/conversation/conversation.routes';
import { videoRoutes } from '../modules/video/video.routes';
import { messageRoutes } from '../modules/message/message.routes';
import { uploadRoutes } from '../modules/file-upload/fileUpload.routes';

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
  {
    path: '/stripe',
    router: stripeRoutes,
  },
  {
    path: '/transaction',
    router: transactionRoutes,
  },
  {
    path: '/meta',
    router: metaRoutes,
  },
  {
    path: '/super-admin',
    router: superAdminRoutes,
  },
  {
    path: '/conversation',
    router: conversationRoutes,
  },
  {
    path: '/video',
    router: videoRoutes,
  },
  {
    path: '/message',
    router: messageRoutes,
  },
  {
    path: '/',
    router: uploadRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.router));

export default router;
