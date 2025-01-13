import httpStatus from 'http-status';
import AppError from '../../error/appError';
import ProductBookmark from './bookmark.mode';
import NormalUser from '../normalUser/normalUser.model';

const profileBookmarkAddDelete = async (
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
const getMyBookmarkFromDB = async (profileId: string) => {
  const result = await ProductBookmark.find({ user: profileId }).populate({
    path: 'profile',
    select: 'name bio profile_image',
    populate: { path: 'mainSkill', select: 'name' },
  });
  return result;
};

const BookmarkService = {
  profileBookmarkAddDelete,
  getMyBookmarkFromDB,
};

export default BookmarkService;
