/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { INormalUser } from './normalUser.interface';
import NormalUser from './normalUser.model';
import { JwtPayload } from 'jsonwebtoken';
import unlinkFile from '../../helper/unlinkFile';

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

const NormalUserServices = {
  updateUserProfile,
  addVideos,
};

export default NormalUserServices;
