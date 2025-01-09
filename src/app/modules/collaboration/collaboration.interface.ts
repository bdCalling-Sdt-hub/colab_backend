import { Types } from 'mongoose';

export interface ICollaboration {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  location: string;
  startDate: Date;
  startTime: string;
  endDate: Date;
  endTime: string;
  price: number;
  contactNumber: string;
  additionalNote?: string;
}
