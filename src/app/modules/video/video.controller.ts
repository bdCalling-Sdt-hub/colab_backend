import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import VideoService from './video.service';

const addVideo = catchAsync(async (req, res) => {
  const { files } = req;
  let videos, thumbnails;

  console.log('files', files);

  if (files && typeof files === 'object' && 'video' in files) {
    videos = files['video'].map((file) => file.path);
  }
  if (files && typeof files === 'object' && 'thumbnail' in files) {
    thumbnails = files['thumbnail'].map((file) => file.path);
  }
  console.log('vide', videos, thumbnails);
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
  const { files } = req;
  if (files && typeof files === 'object' && 'video' in files) {
    req.body.video = files['video'][0].path;
  }
  if (files && typeof files === 'object' && 'thumbnail' in files) {
    req.body.thumbnail = files['thumbnail'][0].path;
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
