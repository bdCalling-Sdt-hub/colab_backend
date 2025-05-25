import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IVideo } from './video.interface';
import Video from './video.model';
import { deleteFileFromS3 } from '../../aws/deleteFromS3';

const AddVideo = async (profileId: string, payload: IVideo) => {
  console.log('payload', payload);
  if (payload.video.length < 3 || payload.thumbnail.length < 3) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'video and thumbnail length must be 3',
    );
  }
  const videosData = [
    {
      user: profileId,
      video: payload.video[0],
      thumbnail: payload.thumbnail[0],
    },
    {
      user: profileId,
      video: payload.video[1],
      thumbnail: payload.thumbnail[1],
    },
    {
      user: profileId,
      video: payload.video[2],
      thumbnail: payload.thumbnail[2],
    },
  ];
  const result = await Video.insertMany(videosData);
  return result;
};

const updateVideo = async (
  profileId: string,
  id: string,
  payload: Partial<IVideo>,
) => {
  const videoData = await Video.findOne({ user: profileId, _id: id });
  if (!videoData) {
    throw new AppError(httpStatus.NOT_FOUND, 'Video not found');
  }
  const result = await Video.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (payload.video && payload.thumbnail) {
    deleteFileFromS3(videoData.video);
    deleteFileFromS3(videoData.thumbnail);
  }
  return result;
};

const VideoService = {
  AddVideo,
  updateVideo,
};

export default VideoService;
