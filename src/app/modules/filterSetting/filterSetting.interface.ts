import { Types } from 'mongoose';

export interface IFilterSetting extends Document {
  user: Types.ObjectId;
  locationTypes: string[];
  artistTypes: Types.ObjectId[];
}
