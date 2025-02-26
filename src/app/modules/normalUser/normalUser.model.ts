/* eslint-disable @typescript-eslint/no-explicit-any */
import { model, Schema } from 'mongoose';
import { INormalUser } from './normalUser.interface';

const NormalUserSchema = new Schema<INormalUser>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    profile_image: {
      type: String,
      default: '',
    },
    mainSkill: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      // required: true,
    },
    additionalSkills: {
      type: [Schema.Types.ObjectId],
      ref: 'Category',
      validate: {
        validator: function (array: any) {
          return array.length <= 3;
        },
        message: 'You can specify up to 3 additional skills only.',
      },
    },
    subscriptionPurchaseDate: {
      type: Date,
    },
    subscriptionRenewDate: {
      type: Date,
    },
    subscriptionExpiryDate: {
      type: Date,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    videos: {
      type: [String],
    },
    todayTotalScroll: {
      type: Number,
      default: 0,
    },
    stripeAccountId: {
      type: String,
    },
    isStripeConnected: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);
const NormalUser = model<INormalUser>('NormalUser', NormalUserSchema);

export default NormalUser;
