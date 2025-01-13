import { Types } from 'mongoose';
import { ENUM_COLLABORATION_STATUS } from '../../utilities/enum';

export interface ICollaboration {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  location: string;
  startDateTime: Date;
  endDateTime: Date;
  price: number;
  contactNumber: string;
  additionalNote?: string;
  status: (typeof ENUM_COLLABORATION_STATUS)[keyof typeof ENUM_COLLABORATION_STATUS];
}
