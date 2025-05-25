/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCloudFrontUrl } from '../../aws/multer-s3-uploader';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import VideoService from './video.service';

const addVideo = catchAsync(async (req, res) => {
  let videos, thumbnails;

  if (req.files?.video) {
    videos = req.files.video.map((file: any) => {
      return getCloudFrontUrl(file.key);
    });
  }
  if (req.files?.thumbnail) {
    thumbnails = req.files.thumbnail.map((file: any) => {
      return getCloudFrontUrl(file.key);
    });
  }
  req.body.video = videos;
  req.body.thumbnail = thumbnails;
  const result = await VideoService.AddVideo(req?.user.profileId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Video added successfully',
    data: result,
  });
});
const updateVideo = catchAsync(async (req, res) => {
  if (req.files?.video) {
    req.body.video = req.files.video.map((file: any) => {
      return getCloudFrontUrl(file.key);
    });
  }
  if (req.files?.thumbnail) {
    req.body.thumbnail = req.files.thumbnail.map((file: any) => {
      return getCloudFrontUrl(file.key);
    });
  }
  const result = await VideoService.updateVideo(
    req?.user.profileId,
    req.params.id,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Video updated successfully',
    data: result,
  });
});

const VideoController = {
  addVideo,
  updateVideo,
};

export default VideoController;
