import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { ENUM_PAYMENT_PURPOSE } from '../../utilities/enum';
import NormalUser from '../normalUser/normalUser.model';
import Stripe from 'stripe';
import config from '../../config';
import { subscriptionPrice } from '../../constant';
const stripe = new Stripe(config.stripe.stripe_secret_key as string);

// purchase subscription--------------------
const purchaseSubscription = async (profileId: string) => {
  const normalUser = await NormalUser.findById(profileId);
  if (!normalUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  const amountInCent = subscriptionPrice * 100;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCent,
    currency: 'usd',
    payment_method_types: ['card'],
    metadata: {
      paymentPurpose: ENUM_PAYMENT_PURPOSE.PURCHASE_SUBSCRIPTION,
      customerName: normalUser.name,
      email: normalUser.email,
      userId: profileId,
    },
  });

  return {
    client_secret: paymentIntent.client_secret,
  };
};

// renew subscription----------------

const renewSubscription = async (profileId: string) => {
  const normalUser = await NormalUser.findById(profileId);
  if (!normalUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  const amountInCent = subscriptionPrice * 100;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCent,
    currency: 'usd',
    payment_method_types: ['card'],
    metadata: {
      paymentPurpose: ENUM_PAYMENT_PURPOSE.RENEW_SUBSCRIPTION,
      customerName: normalUser.name,
      email: normalUser.email,
      userId: profileId,
    },
  });

  return {
    client_secret: paymentIntent.client_secret,
  };
};

const SubscriptionService = {
  purchaseSubscription,
  renewSubscription,
};

export default SubscriptionService;
