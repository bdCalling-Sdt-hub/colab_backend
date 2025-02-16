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
      unlinkFile(user.profile_image);
    }
  }

  let videos = user.videos;
  if (payload?.videosToRemove) {
    videos = videos.filter((video) => !payload.videosToRemove.includes(video));
  }

  if (payload.videosToAdd) {
    videos = [...videos, payload.videosToAdd];
  }

  payload.videos = videos;

  // Handle removal of videos
  if (payload.videosToRemove && Array.isArray(payload.videosToRemove)) {
    for (const videoPath of payload.videosToRemove) {
      unlinkFile(videoPath);

      // Remove the video from the user's profile
      // user.videos = user.videos.filter((video) => video !== videoPath);
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
const getAllUser = async (query: Record<string, unknown>) => {
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

  const userQuery = new QueryBuilder(
    NormalUser.find(filterQuery)
      .populate({ path: 'mainSkill', select: 'name' })
      .populate({ path: 'additionalSkills', select: 'name' }),
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
  return result;
};

// crone jobs----------------------
cron.schedule('59 23 * * *', async () => {
  const result = await NormalUser.updateMany(
    { isPremium: false },
    { todayTotalScroll: 0 },
  );

  console.log('result for reset total scroll', result);
});

const NormalUserServices = {
  updateUserProfile,
  addVideos,
  increseTotalScroll,
  getAllUser,
  getSingleUser,
};

export default NormalUserServices;
