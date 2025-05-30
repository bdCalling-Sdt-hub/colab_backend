/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import NormalUser from './normalUser.model';
import { JwtPayload } from 'jsonwebtoken';
import unlinkFile from '../../helper/unlinkFile';
import cron from 'node-cron';
import QueryBuilder from '../../builder/QueryBuilder';
import Bookmark from '../bookmark/bookmark.mode';
import Video from '../video/video.model';
import { ENUM_LOCATION_TYPE } from '../../utilities/enum';
import { deleteFileFromS3 } from '../../aws/deleteFromS3';
const updateUserProfile = async (userData: JwtPayload, payload: any) => {
  const id = userData.profileId;
  if (payload.email) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You can not change the email');
  }

  const user = await NormalUser.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'Profile not found');
  }

  if (payload.additionalSkills && !user?.isPremium) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'If you want to add aditional skill you need to subscribe for premium user',
    );
  }

  if (payload.profile_image) {
    if (user.profile_image) {
      deleteFileFromS3(user.profile_image);
    }
  }

  let videos = user.videos;
  if (payload?.videosToRemove) {
    videos = videos.filter((video) => !payload.videosToRemove.includes(video));
  }

  if (payload.videosToAdd) {
    console.log('videos', videos);
    videos = [...videos, ...payload.videosToAdd];
    console.log('after videos', videos);
  }

  payload.videos = videos;

  // Handle removal of videos
  if (payload.videosToRemove && Array.isArray(payload.videosToRemove)) {
    for (const videoPath of payload.videosToRemove) {
      deleteFileFromS3(videoPath);
    }
  }

  const { videosToAdd, videosToRemove, ...other } = payload;

  const result = await NormalUser.findByIdAndUpdate(id, other, {
    new: true,
    runValidators: true,
  });
  return result;
};

const addVideos = async (userId: string, videos: string[]) => {
  const normalUser = await NormalUser.findById(userId);
  if (!normalUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const result = await NormalUser.findByIdAndUpdate(
    userId,
    {
      $set: { videos: videos },
    },
    { new: true, runValidators: true },
  );
  return result;
};

const increseTotalScroll = async (profileId: string) => {
  const result = await NormalUser.findByIdAndUpdate(
    profileId,
    { $inc: { todayTotalScroll: 1 } },
    { new: true, runValidators: true },
  );
  return result;
};

// get all normal user
// const getAllUser = async (
//   profileId: string,
//   query: Record<string, unknown>,
// ) => {
//   let filterQuery: Record<string, unknown> = {};
//   if (query?.skill) {
//     filterQuery = {
//       $or: [
//         { mainSkill: query.skill },
//         { additionalSkills: { $in: [query.skill] } },
//       ],
//     };
//     delete query.skill;
//   }

//   const userQuery = new QueryBuilder(
//     NormalUser.find(filterQuery)
//       .populate({ path: 'mainSkill', select: 'name' })
//       .populate({ path: 'additionalSkills', select: 'name' })
//       .populate({ path: 'user', select: 'status' }),

//     query,
//   )
//     .search(['name'])
//     .fields()
//     .filter()
//     .paginate()
//     .sort();

//   const result = await userQuery.modelQuery;
//   const bookmarks = await Bookmark.find({ user: profileId });
//   const bookmarkedShopIds = new Set(
//     bookmarks.map((b) => b?.profile?.toString()),
//   );
//   const enrichedResult = result.map((userData) => ({
//     ...userData.toObject(),
//     isBookmark: bookmarkedShopIds.has(userData?._id.toString()),
//   }));
//   const meta = await userQuery.countTotal();
//   return {
//     meta,
//     result: enrichedResult,
//   };
// };

const getAllUser = async (
  profileId: string,
  query: Record<string, unknown>,
) => {
  let filterQuery: Record<string, unknown> = {};

  if (query?.skill) {
    filterQuery = {
      $or: [
        { mainSkill: query.skill },
        { additionalSkills: { $in: [query.skill] } },
      ],
    };
    delete query.skill;
  }

  // for search filter
  const user = await NormalUser.findById(profileId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (user?.locationTypes.length > 0) {
    if (
      user?.locationTypes.length > 0 &&
      user.locationTypes.includes(ENUM_LOCATION_TYPE.CITY)
    ) {
      filterQuery.city = { $regex: user.city, $options: 'i' };
    }
    if (
      user?.locationTypes.length > 0 &&
      user.locationTypes.includes(ENUM_LOCATION_TYPE.STATE)
    ) {
      filterQuery.state = { $regex: user.state, $options: 'i' };
    }
    if (
      user?.locationTypes.length > 0 &&
      user.locationTypes.includes(ENUM_LOCATION_TYPE.COUNTRY)
    ) {
      filterQuery.country = {
        $regex: user.country,
        $options: 'i',
      };
    }
  }
  if (user.artistTypes.length > 0) {
    filterQuery.$or = [
      { mainSkill: { $in: user.artistTypes } },
      { additionalSkills: { $in: user.artistTypes } },
    ];
  }

  // Query to fetch users with filtering, pagination, and sorting
  const userQuery = new QueryBuilder(
    NormalUser.find({
      ...filterQuery,
      mainSkill: { $exists: true, $ne: null },
      _id: { $ne: profileId },
    })
      .populate({ path: 'mainSkill', select: 'name' })
      .populate({ path: 'additionalSkills', select: 'name' })
      .populate({ path: 'user', select: 'status' }),
    query,
  )
    .search(['name'])
    .fields()
    .filter()
    .paginate()
    .sort();

  const result = await userQuery.modelQuery;

  // Fetch bookmarks for the current profileId
  const bookmarks = await Bookmark.find({ user: profileId });
  const bookmarkedShopIds = new Set(
    bookmarks.map((b) => b?.profile?.toString()),
  );

  // Fetch videos for all users in one query
  const userIds = result.map((user) => user._id);
  const allVideos = await Video.find({ user: { $in: userIds } }).select(
    'thumbnail video _id user',
  );

  // Map users and attach videos
  const enrichedResult = await Promise.all(
    result.map(async (userData) => {
      const userVideos = allVideos.filter(
        (video) => video.user.toString() === userData._id.toString(),
      );

      return {
        ...userData.toObject(),
        videos: userVideos,
        isBookmark: bookmarkedShopIds.has(userData?._id.toString()),
      };
    }),
  );

  const finalResult = enrichedResult.filter(
    (result) =>
      result.videos.length >= 3 && result.user.status == 'in-progress',
  );

  const meta = await userQuery.countTotal();

  return {
    meta,
    result: finalResult,
  };
};

const getAllUserForAdmin = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(
    NormalUser.find()
      .populate({ path: 'mainSkill', select: 'name' })
      .populate({ path: 'additionalSkills', select: 'name' })
      .populate({ path: 'user', select: 'status' }),
    query,
  )
    .search(['name'])
    .fields()
    .filter()
    .paginate()
    .sort();

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();
  return {
    meta,
    result,
  };
};

// get single user
const getSingleUser = async (id: string) => {
  const result = await NormalUser.findById(id)
    .populate({ path: 'mainSkill', select: 'name' })
    .populate({ path: 'additionalSkills', select: 'name' });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  const videos = await Video.find({ user: id });
  const updatedResult = {
    ...result.toObject(),
    videos,
  };
  return updatedResult;
};

// crone jobs----------------------
cron.schedule('59 23 * * *', async () => {
  const result = await NormalUser.updateMany(
    { isPremium: false },
    { todayTotalScroll: 0 },
  );

  console.log('result for reset total scroll', result);
});

cron.schedule('59 23 * * *', async () => {
  const result = await NormalUser.updateMany(
    { isPremium: true, subscriptionExpiryDate: { $lt: new Date() } },
    { isPremium: false },
  );
  console.log('result for reset subscription expire', result);
});

const NormalUserServices = {
  updateUserProfile,
  addVideos,
  increseTotalScroll,
  getAllUser,
  getSingleUser,
  getAllUserForAdmin,
};

export default NormalUserServices;
