import Stripe from 'stripe';
import config from '../../config';
import { JwtPayload } from 'jsonwebtoken';
import NormalUser from '../normalUser/normalUser.model';
import AppError from '../../error/appError';
import httpStatus from 'http-status';

const stripe = new Stripe(config.stripe.stripe_secret_key as string);
const createConnectedAccountAndOnboardingLink = async (
  userData: JwtPayload,
  profileId: string,
) => {
  const normalUser = await NormalUser.findById(profileId);
  if (!normalUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (normalUser?.isStripeConnected) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You already added bank information',
    );
  }

  if (normalUser.stripeAccountId) {
    const onboardingLink = await stripe.accountLinks.create({
      account: normalUser.stripeAccountId,
      refresh_url: `${config.stripe.onboarding_refresh_url}?accountId=${normalUser.stripeAccountId}`,
      return_url: 'http://localhost:3000/account-created',
      type: 'account_onboarding',
    });
    return onboardingLink.url;
  }

  //  Create a connected account
  const account = await stripe.accounts.create({
    type: 'express',
    email: normalUser.email,
    country: 'US',
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });

  const updatedUser = await NormalUser.findByIdAndUpdate(
    profileId,
    { stripeAccountId: account.id },
    { new: true, runValidators: true },
  );

  console.log('updated user', updatedUser);

  if (!updatedUser) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Server temporarily unavailable',
    );
  }

  //  Create the onboarding link
  const onboardingLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${config.stripe.onboarding_refresh_url}?accountId=${account?.id}`,
    return_url: 'http://localhost:3000/account-created',
    type: 'account_onboarding',
  });
  return onboardingLink.url;
};

const updateOnboardingLink = async (profileId: string) => {
  const normalUser = await NormalUser.findById(profileId);
  const stripAccountId = normalUser?.stripeAccountId;
  const accountLink = await stripe.accountLinks.create({
    account: stripAccountId as string,
    refresh_url: `${config.stripe.onboarding_refresh_url}?accountId=${stripAccountId}`,
    return_url: config.stripe.onboarding_return_url,
    type: 'account_onboarding',
  });

  return { link: accountLink.url };
};

const StripeService = {
  createConnectedAccountAndOnboardingLink,
  updateOnboardingLink,
};

export default StripeService;
