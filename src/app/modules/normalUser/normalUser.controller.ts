import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import NormalUserServices from './normalUser.services';

const updateUserProfile = catchAsync(async (req, res) => {
  const { files } = req;
  if (files && typeof files === 'object' && 'profile_image' in files) {
    req.body.profile_image = files['profile_image'][0].path;
  }
  const result = await NormalUserServices.updateUserProfile(
    req.user.profileId,
    req.body,
  );
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
    req.body.viodes,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Videos added successfully',
    data: result,
  });
});

const NormalUserController = {
  updateUserProfile,
  addVideos,
};

export default NormalUserController;
