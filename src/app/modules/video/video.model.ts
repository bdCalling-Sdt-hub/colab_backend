import mongoose, { Schema } from 'mongoose';
import { IVideo } from './video.interface';

const VideoSchema = new Schema<IVideo>(
  {
    user: { type: Schema.Types.ObjectId, required: true, ref: 'Normal User' },
    thumbnail: { type: String, required: true },
    video: { type: String, required: true },
  },
  { timestamps: true },
);

const Video = mongoose.model<IVideo>('Video', VideoSchema);

export default Video;
