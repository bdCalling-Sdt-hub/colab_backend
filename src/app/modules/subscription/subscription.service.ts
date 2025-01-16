import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { ENUM_PAYMENT_PURPOSE } from '../../utilities/enum';
import NormalUser from '../normalUser/normalUser.model';
import Stripe from 'stripe';
import config from '../../config';
import { subscriptionPrice } from '../../constant';
const stripe = new Stripe(config.stripe.stripe_secret_key as string);

// purchase subscription--------------------------
const purchaseSubscription = async (profileId: string) => {
  const normalUser = await NormalUser.findById(profileId);
  if (!normalUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  const amountInCent = subscriptionPrice * 100;
  const userId = normalUser._id.toString();
  // const paymentIntent = await stripe.paymentIntents.create({
  //   amount: amountInCent,
  //   currency: 'usd',
  //   payment_method_types: ['card'],
  //   metadata: {
  //     paymentPurpose: ENUM_PAYMENT_PURPOSE.PURCHASE_SUBSCRIPTION,
  //     email: normalUser.email,
  //     userId,
  //   },
  // });

  // return {
  //   client_secret: paymentIntent.client_secret,
  // };
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Purchase Subscription`,
          },
          unit_amount: amountInCent,
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      paymentPurpose: ENUM_PAYMENT_PURPOSE.PURCHASE_SUBSCRIPTION,
    },
    success_url: `${config.stripe.payment_success_url}?collaborationId=${userId}`,
    cancel_url: `${config.stripe.payment_success_url}`,
  });

  return { url: session.url };
};

// renew subscription----------------------

const renewSubscription = async (profileId: string) => {
  const normalUser = await NormalUser.findById(profileId);
  if (!normalUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  const userId = normalUser._id.toString();
  const amountInCent = subscriptionPrice * 100;
  // const paymentIntent = await stripe.paymentIntents.create({
  //   amount: amountInCent,
  //   currency: 'usd',
  //   payment_method_types: ['card'],
  //   metadata: {
  //     paymentPurpose: ENUM_PAYMENT_PURPOSE.RENEW_SUBSCRIPTION,
  //     customerName: normalUser.name,
  //     email: normalUser.email,
  //     userId,
  //   },
  // });

  // return {
  //   client_secret: paymentIntent.client_secret,
  // };
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Renew Subscription`,
          },
          unit_amount: amountInCent,
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      paymentPurpose: ENUM_PAYMENT_PURPOSE.RENEW_SUBSCRIPTION,
    },
    success_url: `${config.stripe.payment_success_url}?collaborationId=${userId}`,
    cancel_url: `${config.stripe.payment_success_url}`,
  });

  return { url: session.url };
};

const SubscriptionService = {
  purchaseSubscription,
  renewSubscription,
};

export default SubscriptionService;
