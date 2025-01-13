import { Types } from 'mongoose';

export interface IBookmark {
  profile: Types.ObjectId;
  user: Types.ObjectId;
}
