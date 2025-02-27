/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';

export interface INormalUser {
  _id: any;
  toObject: any;
  // _id: string;
  user: Types.ObjectId;
  name: string;
  bio: string;
  email: string;
  address?: string;
  profile_image: string;
  mainSkill: Types.ObjectId;
  additionalSkills: [Types.ObjectId];
  videos: string[];
  subscriptionPurchaseDate?: Date;
  subscriptionRenewDate?: Date;
  subscriptionExpiryDate?: Date;
  isPremium: false;
  todayTotalScroll: number;
  stripeAccountId: string;
  isStripeConnected: boolean;
  city: string;
  state: string;
  country: string;
  locationTypes: string[];
  artistTypes: Types.ObjectId[];
}
