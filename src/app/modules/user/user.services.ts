/* eslint-disable no-unused-vars */

import { User } from './user.model';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
import { INormalUser } from '../normalUser/normalUser.interface';
import mongoose from 'mongoose';
import { TUser, TUserRole } from './user.interface';
import { USER_ROLE } from './user.constant';
import NormalUser from '../normalUser/normalUser.model';
import registrationSuccessEmailBody from '../../mailTemplate/registerSucessEmail';
import cron from 'node-cron';
import sendEmail from '../../utilities/sendEmail';
import { JwtPayload } from 'jsonwebtoken';
import unlinkFile from '../../helper/unlinkFile';
import SuperAdmin from '../superAdmin/superAdmin.model';
import Category from '../category/category.model';
import { createToken } from './user.utils';
import config from '../../config';
import Video from '../video/video.model';

const generateVerifyCode = (): number => {
  return Math.floor(100000 + Math.random() * 900000);
};

const registerUser = async (
  password: string,
  confirmPassword: string,
  userData: INormalUser,
) => {
  if (password !== confirmPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Password and confirm password doesn't match",
    );
  }

  const emailExist = await User.findOne({ email: userData.email });
  if (emailExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This email already exist');
  }
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const verifyCode = generateVerifyCode();
    const userDataPayload: Partial<TUser> = {
      email: userData?.email,
      password: password,
      role: USER_ROLE.user,
      verifyCode,
      codeExpireIn: new Date(Date.now() + 2 * 60000),
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = await User.create([userDataPayload], { session });

    const normalUserPayload = {
      ...userData,
      user: user[0]._id,
    };
    const result = await NormalUser.create([normalUserPayload], { session });

    sendEmail({
      email: userData.email,
      subject: 'Activate Your Account',
      html: registrationSuccessEmailBody(result[0].name, user[0].verifyCode),
    });

    await session.commitTransaction();
    session.endSession();

    return result[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const verifyCode = async (email: string, verifyCode: number) => {
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (user.codeExpireIn < new Date(Date.now())) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Verify code is expired');
  }
  if (verifyCode !== user.verifyCode) {
    throw new AppError(httpStatus.BAD_REQUEST, "Code doesn't match");
  }
  await User.findOneAndUpdate(
    { email: email },
    { isVerified: true },
    { new: true, runValidators: true },
  );

  const jwtPayload = {
    id: user?._id,
    email: user?.email,
    role: user?.role as TUserRole,
  };
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );
  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );
  return {
    accessToken,
    refreshToken,
  };
};

const resendVerifyCode = async (email: string) => {
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  const verifyCode = generateVerifyCode();
  const updateUser = await User.findOneAndUpdate(
    { email: email },
    { verifyCode: verifyCode, codeExpireIn: new Date(Date.now() + 5 * 60000) },
    { new: true, runValidators: true },
  );
  if (!updateUser) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Something went wrong . Please again resend the code after a few second',
    );
  }
  sendEmail({
    email: user.email,
    subject: 'Activate Your Account',
    html: registrationSuccessEmailBody('Dear', updateUser.verifyCode),
  });
  return null;
};

const getMyProfile = async (userData: JwtPayload) => {
  let result = null;
  if (userData.role === USER_ROLE.user) {
    const user = await NormalUser.findOne({ email: userData.email })
      .populate({
        path: 'mainSkill',
        select: 'name',
      })
      .populate({ path: 'additionalSkills', select: 'name' });
    const category = await Category.find();
    const videos = await Video.find({ user: userData.profileId }).select(
      'thumbnail video _id',
    );
    result = { ...user?.toObject(), category, videos };
  } else if (userData.role === USER_ROLE.superAdmin) {
    result = await SuperAdmin.findOne({ email: userData.email });
  }
  return result;
};

const deleteUserAccount = async (user: JwtPayload, password: string) => {
  const userData = await User.findById(user.id);

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (!(await User.isPasswordMatched(password, userData?.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not match');
  }

  const normalUser = await NormalUser.findById(user?.profileId);
  if (!normalUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (normalUser.videos?.length > 0) {
    for (const videoPath of normalUser.videos) {
      unlinkFile(videoPath);
    }
  }

  if (normalUser.profile_image) {
    if (normalUser.profile_image) {
      unlinkFile(normalUser.profile_image);
    }
  }

  await NormalUser.findByIdAndDelete(user.profileId);
  await User.findByIdAndDelete(user.id);

  return null;
};

// all cron jobs for users

cron.schedule('*/2 * * * *', async () => {
  try {
    const now = new Date();

    // Find unverified users whose expiration time has passed
    const expiredUsers = await User.find({
      isVerified: false,
      codeExpireIn: { $lte: now },
    });

    if (expiredUsers.length > 0) {
      const expiredUserIds = expiredUsers.map((user) => user._id);

      // Delete corresponding NormalUser documents
      const normalUserDeleteResult = await NormalUser.deleteMany({
        user: { $in: expiredUserIds },
      });

      // Delete the expired User documents
      const userDeleteResult = await User.deleteMany({
        _id: { $in: expiredUserIds },
      });

      console.log(
        `Deleted ${userDeleteResult.deletedCount} expired inactive users`,
      );
      console.log(
        `Deleted ${normalUserDeleteResult.deletedCount} associated NormalUser documents`,
      );
    }
  } catch (error) {
    console.log('Error deleting expired users and associated data:', error);
  }
});

const changeUserStatus = async (id: string, status: string) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  const result = await User.findByIdAndUpdate(
    id,
    { status: status },
    { new: true, runValidators: true },
  );
  return result;
};

const userServices = {
  registerUser,
  verifyCode,
  resendVerifyCode,
  getMyProfile,
  changeUserStatus,
  deleteUserAccount,
};

export default userServices;
