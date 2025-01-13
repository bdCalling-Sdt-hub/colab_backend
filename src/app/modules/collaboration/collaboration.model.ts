import mongoose, { Schema } from 'mongoose';
import { ICollaboration } from './collaboration.interface';
import { ENUM_COLLABORATION_STATUS } from '../../utilities/enum';

// Define the Mongoose schema
const collaboratonSchema = new Schema<ICollaboration>(
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
    startDateTime: {
      type: Date,
      required: true,
    },
    endDateTime: {
      type: Date,
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
    status: {
      type: String,
      enum: Object.values(ENUM_COLLABORATION_STATUS),
      default: ENUM_COLLABORATION_STATUS.PENDING,
    },
  },
  {
    timestamps: true,
  },
);

const Collaboration = mongoose.model<ICollaboration>(
  'Collaboration',
  collaboratonSchema,
);

export default Collaboration;
