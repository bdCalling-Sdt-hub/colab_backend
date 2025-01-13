import express from 'express';
import { USER_ROLE } from '../user/user.constant';
import auth from '../../middlewares/auth';
import productBookmarkController from './product.bookmark.controller';

const router = express.Router();
router.post(
  '/add-delete-saved-profile/:id',
  auth(USER_ROLE.user),
  productBookmarkController.productBookmarkAddDelete,
);
router.get(
  '/my-bookmark-products',
  auth(USER_ROLE.user),
  productBookmarkController.getMyBookmark,
);

export const productBookmarkRoutes = router;
