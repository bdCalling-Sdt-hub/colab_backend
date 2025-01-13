import httpStatus from 'http-status';
import AppError from '../../error/appError';
import ProductBookmark from './product.bookmark.model';
import NormalUser from '../normalUser/normalUser.model';

const productBookmarkAddDelete = async (
  profileId: string,
  bookmarkProfileId: string,
) => {
  // check if article exists
  const profile = await NormalUser.findById(bookmarkProfileId);
  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, 'Profile not found');
  }
  const bookmark = await ProductBookmark.findOne({
    user: profileId,
    profile: bookmarkProfileId,
  });
  if (bookmark) {
    await ProductBookmark.findOneAndDelete({
      user: profileId,
      profile: bookmarkProfileId,
    });
    return null;
  } else {
    const result = await ProductBookmark.create({
      user: profileId,
      profile: bookmarkProfileId,
    });
    return result;
  }
};

// get bookmark from db
const getMyBookmarkFromDB = async (costumerId: string) => {
  const result = await ProductBookmark.find({ costumer: costumerId });
  return result;
};

// delete bookmark
const deleteBookmarkFromDB = async (id: string, costumerId: string) => {
  const bookmark = await ProductBookmark.findOne({
    _id: id,
    costumer: costumerId,
  });

  if (!bookmark) {
    throw new AppError(httpStatus.NOT_FOUND, 'This bookmark does not exists');
  }
  const result = await ProductBookmark.findOneAndDelete({
    _id: id,
    costumer: costumerId,
  });
  return result;
};
const productBookmarkServices = {
  // createBookmarkIntoDB,
  productBookmarkAddDelete,
  getMyBookmarkFromDB,
  deleteBookmarkFromDB,
};

export default productBookmarkServices;
