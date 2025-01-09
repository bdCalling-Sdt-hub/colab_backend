import mongoose, { Schema, Document } from 'mongoose';
import { ICollaboration } from './collaboration.interface';

// Define the Mongoose schema
const CollaborationSchema = new Schema<ICollaboration>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'NormalUser',
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'NormalUser',
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    additionalNote: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

const Collaboration = mongoose.model<ICollaboration & Document>(
  'Collaboration',
  CollaborationSchema,
);

export default Collaboration;
