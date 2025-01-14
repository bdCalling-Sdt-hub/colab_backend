/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import httpStatus from 'http-status';
import AppError from '../error/appError';
import NormalUser from '../modules/normalUser/normalUser.model';
import {
  ENUM_COLLABORATION_STATUS,
  ENUM_PAYMENT_PURPOSE,
} from '../utilities/enum';
import Collaboration from '../modules/collaboration/collaboration.model';

const handlePaymentSuccess = async (metaData: any) => {
  if (metaData.paymentPurpose == ENUM_PAYMENT_PURPOSE.PURCHASE_SUBSCRIPTION) {
    await handleSubcriptionPurchaseSuccess(metaData.userId);
  } else if (
    metaData.paymentPurpose == ENUM_PAYMENT_PURPOSE.RENEW_SUBSCRIPTION
  ) {
    await handleSubscriptionRenewSuccess(metaData.userid);
  } else if (
    metaData.paymentPurpose == ENUM_PAYMENT_PURPOSE.COLLABRATE_PAYMENT
  ) {
    await handleCollabratePaymentSuccess(metaData?.collaborationId);
  }
};

const handleSubcriptionPurchaseSuccess = async (userId: string) => {
  const normalUser = await NormalUser.findById(userId);
  if (!normalUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  await NormalUser.findByIdAndUpdate(
    userId,
    {
      subscriptionPurchaseDate: new Date(),
      subscriptionExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isPremium: true,
    },
    { new: true, runValidators: true },
  );
};

const handleSubscriptionRenewSuccess = async (userId: string) => {
  const normalUser = await NormalUser.findById(userId);
  if (!normalUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  await NormalUser.findByIdAndUpdate(
    userId,
    {
      subscriptionExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      subscriptionRenewDate: new Date(),
    },
    { new: true, runValidators: true },
  );
};

const handleCollabratePaymentSuccess = async (collaborationId: string) => {
  const collaboration = await Collaboration.findById(collaborationId);
  if (!collaboration) {
    throw new AppError(httpStatus.NOT_FOUND, 'Collaboration not found');
  }
  await Collaboration.findByIdAndUpdate(
    collaborationId,
    { status: ENUM_COLLABORATION_STATUS.UPCOMING },
    { new: true, runValidators: true },
  );
};

export default handlePaymentSuccess;
