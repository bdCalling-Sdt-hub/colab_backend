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

  if (
    normalUser?.subscriptionExpiryDate &&
    new Date(normalUser?.subscriptionExpiryDate).getTime() > Date.now()
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You already have subscription');
  }

  if (normalUser?.subscriptionPurchaseDate) {
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
      customer_email: normalUser?.email,
      success_url: `${config.stripe.subscription_renew_success_url}?collaborationId=${userId}`,
      cancel_url: `${config.stripe.subscription_renew_cancel_url}`,
    });
    return { url: session.url };
  } else {
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
      customer_email: normalUser?.email,
      success_url: `${config.stripe.subscription_payment_success_url}?collaborationId=${userId}`,
      cancel_url: `${config.stripe.subscription_payment_cancel_url}`,
    });

    return { url: session.url };
  }
};

const SubscriptionService = {
  purchaseSubscription,
};

export default SubscriptionService;
