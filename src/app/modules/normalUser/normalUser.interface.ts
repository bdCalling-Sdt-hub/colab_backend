/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';

export interface INormalUser {
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
}
