import { Types } from 'mongoose';

export interface ICollaboration {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  location: string;
  startDateTime: Date;
  endDateTime: Date;
  price: number;
  contactNumber: string;
  additionalNote?: string;
}
