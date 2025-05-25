/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import { getCloudFrontUrl } from '../../aws/multer-s3-uploader';

const uploadImages = catchAsync(async (req, res) => {
  let images;
  let videos;

  if (req.files?.chat_images) {
    images = req.files.chat_images.map((file: any) => {
      return getCloudFrontUrl(file.key);
    });
  }

  if (req.files?.chat_videos) {
    videos = req.files.chat_videos.map((file: any) => {
      return getCloudFrontUrl(file.key);
    });
  }
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'File uploaded successfully',
    data: {
      images,
      videos,
    },
  });
});

const FileUploadController = {
  uploadImages,
};

export default FileUploadController;
