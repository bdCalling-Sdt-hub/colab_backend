import { Types } from 'mongoose';

export interface IVideo {
  user: Types.ObjectId;
  thumbnail: string;
  video: string;
}
