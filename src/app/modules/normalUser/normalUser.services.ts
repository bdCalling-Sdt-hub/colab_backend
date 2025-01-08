import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { INormalUser } from './normalUser.interface';
import NormalUser from './normalUser.model';

const updateUserProfile = async (id: string, payload: Partial<INormalUser>) => {
  if (payload.email) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You can not change the email');
  }

  const user = await NormalUser.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'Profile not found');
  }
  const result = await NormalUser.findByIdAndUpdate(id, payload, {
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
