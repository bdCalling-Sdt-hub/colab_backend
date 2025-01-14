import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import NormalUserServices from './normalUser.services';

const updateUserProfile = catchAsync(async (req, res) => {
  const { files } = req;
  if (files && typeof files === 'object' && 'profile_image' in files) {
    req.body.profile_image = files['profile_image'][0].path;
  }

  const { videosToRemove } = req.body;
  let videosToAdd;
  if (files && typeof files === 'object' && 'video' in files) {
    videosToAdd = files['video'][0].path;
  }
  req.body.videosToAdd = videosToAdd;
  req.body.videosToRemove = videosToRemove;
  const result = await NormalUserServices.updateUserProfile(req.user, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

const addVideos = catchAsync(async (req, res) => {
  const { files } = req;
  if (files && typeof files === 'object' && 'video' in files) {
    req.body.videos = files['video'].map((file) => `${file.path}`);
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
  const result = await NormalUserServices.getAllUser(req.query);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  });
});
const getSingleUser = catchAsync(async (req, res) => {
  const result = await NormalUserServices.getSingleUser(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
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
};

export default NormalUserController;
