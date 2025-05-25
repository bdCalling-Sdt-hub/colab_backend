/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import NormalUserServices from './normalUser.services';
import { getCloudFrontUrl } from '../../aws/multer-s3-uploader';

const updateUserProfile = catchAsync(async (req, res) => {
  const file: any = req.files?.profile_image;
  if (req.files?.profile_image) {
    req.body.profile_image = getCloudFrontUrl(file[0].key);
  }
  const { videosToRemove } = req.body;
  if (req.files?.video) {
    req.body.videosToAdd = req.files.video.map((file: any) => {
      return getCloudFrontUrl(file.key);
    });
  }
  req.body.videosToRemove = videosToRemove;
  const result = await NormalUserServices.updateUserProfile(req.user, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});
//

const addVideos = catchAsync(async (req, res) => {
  if (req.files?.video) {
    req.body.videos = req.files.video.map((file: any) => {
      return getCloudFrontUrl(file.key);
    });
  }

  const result = await NormalUserServices.addVideos(
    req.user.profileId,
    req.body.videos,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Videos added successfully',
    data: result,
  });
});
const increseTotalScroll = catchAsync(async (req, res) => {
  const result = await NormalUserServices.increseTotalScroll(
    req.user.profileId,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Today total view increased successfully',
    data: result,
  });
});
const getAllUser = catchAsync(async (req, res) => {
  const result = await NormalUserServices.getAllUser(
    req?.user?.profileId,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  });
});
const getSingleUser = catchAsync(async (req, res) => {
  const result = await NormalUserServices.getSingleUser(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  });
});

const getAllUserForAdmin = catchAsync(async (req, res) => {
  const result = await NormalUserServices.getAllUserForAdmin(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  });
});

const NormalUserController = {
  updateUserProfile,
  addVideos,
  increseTotalScroll,
  getAllUser,
  getSingleUser,
  getAllUserForAdmin,
};

export default NormalUserController;
