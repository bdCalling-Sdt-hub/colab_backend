import Stripe from 'stripe';
import config from '../../config';
import { JwtPayload } from 'jsonwebtoken';
import NormalUser from '../normalUser/normalUser.model';
import { USER_ROLE } from '../user/user.constant';
import AppError from '../../error/appError';
import httpStatus from 'http-status';

const stripe = new Stripe(config.stripe.stripe_secret_key as string);
const createConnectedAccountAndOnboardingLink = async (
  userData: JwtPayload,
  profileId: string,
) => {
  const normalUser = await NormalUser.findById(userData?.id);
  if (!normalUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (normalUser?.isStripeConnected) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You already added bank information',
    );
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
    { stripAccountId: account.id },
    { new: true, runValidators: true },
  );

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

const updateOnboardingLink = async (stripAccountId: string) => {
  const accountLink = await stripe.accountLinks.create({
    account: stripAccountId,
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
