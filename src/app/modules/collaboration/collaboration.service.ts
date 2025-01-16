/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/appError';
import NormalUser from '../normalUser/normalUser.model';
import Collaboration from './collaboration.model';
import {
  ENUM_COLLABORATION_STATUS,
  ENUM_PAYMENT_PURPOSE,
} from '../../utilities/enum';
import Stripe from 'stripe';
import config from '../../config';
import { INormalUser } from '../normalUser/normalUser.interface';
const stripe = new Stripe(config.stripe.stripe_secret_key as string);
// send collaboraton --------------
const sendCollaborationRequest = async (profileId: string, payload: any) => {
  const receiver = await NormalUser.findById(payload.receiver);
  if (!receiver) {
    throw new AppError(httpStatus.NOT_FOUND, 'Receiver not found');
  }
  // TODO: need to update that when connected account work is completed
  // if (!receiver.stripeAccountId || !receiver.isStripeConnected) {
  //   throw new AppError(
  //     httpStatus.UNAVAILABLE_FOR_LEGAL_REASONS,
  //     "This persion don't provide his/her payment info , please try again leter",
  //   );
  // }

  const startDateTime = new Date(payload.startDate);
  const [startHours, startMinutes] = payload.startTime.split(':');
  startDateTime.setHours(Number(startHours), Number(startMinutes));
  const endDateTime = new Date(payload.endDate);
  const [endHours, endMinutes] = payload.endTime.split(':');
  endDateTime.setHours(Number(endHours), Number(endMinutes));
  const result = await Collaboration.create({
    ...payload,
    sender: profileId,
    startDateTime,
    endDateTime,
  });
  return result;
};

// get my collaboration
const getMyCollaborations = async (profileId: string) => {
  const result = await Collaboration.find({
    $or: [{ sender: profileId }, { receiver: profileId }],
  })
    .populate({
      path: 'sender',
      select: 'name profile_image',
      populate: { path: 'mainSkill', select: 'name' },
    })
    .populate({
      path: 'receiver',
      select: 'name profile_image',
      populate: { path: 'mainSkill', select: 'name' },
    });

  return result;
};

// get all collaboration
const getAllCollaborations = async (query: Record<string, unknown>) => {
  const collaborationQuery = new QueryBuilder(
    Collaboration.find()
      .populate({
        path: 'sender',
        select: 'name profile_image',
        populate: { path: 'mainSkill', select: 'name' },
      })
      .populate({
        path: 'receiver',
        select: 'name profile_image',
        populate: { path: 'mainSkill', select: 'name' },
      }),
    query,
  )
    .search(['title'])
    .fields()
    .filter()
    .paginate()
    .sort();

  const result = await collaborationQuery.modelQuery;
  const meta = await collaborationQuery.countTotal();

  return {
    result,
    meta,
  };
};

// update collaboration
const updateCollaboration = async (
  profileId: string,
  collaborationId: string,
  payload: any,
) => {
  const collaboration = await Collaboration.findOne({
    sender: profileId,
    _id: collaborationId,
  });

  //
  const startDateTime = new Date(payload.startDate);
  const [startHours, startMinutes] = payload.startTime.split(':');
  startDateTime.setHours(Number(startHours), Number(startMinutes));
  const endDateTime = new Date(payload.endDate);
  const [endHours, endMinutes] = payload.endTime.split(':');
  endDateTime.setHours(Number(endHours), Number(endMinutes));

  payload.startDateTime = startDateTime;
  payload.endDateTime = endDateTime;

  if (!collaboration) {
    throw new AppError(httpStatus.NOT_FOUND, 'Collaboration not found');
  }

  if (
    collaboration.status == ENUM_COLLABORATION_STATUS.UPCOMING ||
    collaboration.status == ENUM_COLLABORATION_STATUS.COMPLETED
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `This collaboration already ${collaboration.status}, you can't edit this now`,
    );
  }

  const result = await Collaboration.findOneAndUpdate(
    { sender: profileId, _id: collaborationId },
    payload,
    { new: true, runValidators: true },
  );
  return result;
};

// delete collaboration
const deleteCollaboration = async (
  profileId: string,
  collaborationId: string,
) => {
  const collaboration = await Collaboration.findOne({
    sender: profileId,
    _id: collaborationId,
  });
  if (!collaboration) {
    throw new AppError(httpStatus.NOT_FOUND, 'Collaboration not found');
  }
  if (
    collaboration.status == ENUM_COLLABORATION_STATUS.UPCOMING ||
    collaboration.status == ENUM_COLLABORATION_STATUS.COMPLETED
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `You can't delete ${collaboration.status} collaboration`,
    );
  }

  const result = await Collaboration.findOneAndDelete({
    _id: collaborationId,
    sender: profileId,
  });
  return result;
};

// const acceptCollaboration = async (
//   profileId: string,
//   collaborationId: string,
// ) => {
//   const collaboration = await Collaboration.findOne({
//     _id: collaborationId,
//     receiver: profileId,
//   });
//   if (!collaboration) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Collaboration not found');
//   }
//   const amountInCents = collaboration.price * 100;
//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: amountInCents,
//     currency: 'usd',
//     payment_method_types: ['card'],
//     metadata: {
//       collaborationId,
//       purpose: ENUM_PAYMENT_PURPOSE.COLLABRATE_PAYMENT,
//     },
//   });
//   return { client_secret: paymentIntent.client_secret };
// };

const acceptCollaboration = async (
  profileId: string,
  collaborationId: string,
) => {
  const collaboration = await Collaboration.findOne({
    _id: collaborationId,
    receiver: profileId,
  }).populate({ path: 'sender', select: 'name' });
  if (!collaboration) {
    throw new AppError(httpStatus.NOT_FOUND, 'Collaboration not found');
  }

  const amountInCents = collaboration.price * 100;
  const sender = collaboration.sender as INormalUser;
  // Create a checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Collaboration with ${sender.name}`,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      collaborationId,
      paymentPurpose: ENUM_PAYMENT_PURPOSE.COLLABRATE_PAYMENT,
    },
    success_url: `${config.stripe.payment_success_url}?collaborationId=${collaborationId}`,
    cancel_url: `${config.stripe.payment_success_url}`,
  });

  return { url: session.url };
};

// mark as complete
const markAsComplete = async (profileId: string, collaborationId: string) => {
  const collaboration = await Collaboration.findOne({
    _id: collaborationId,
    receiver: profileId,
  });
  if (!collaboration) {
    throw new AppError(httpStatus.NOT_FOUND, 'Collaboration not found');
  }

  const moneyReceiver = await NormalUser.findById(collaboration.sender);
  if (
    !moneyReceiver ||
    !moneyReceiver?.isStripeConnected ||
    !moneyReceiver?.stripeAccountId
  ) {
    throw new AppError(
      httpStatus.PARTIAL_CONTENT,
      'Payment receiver not found , contact with collaborator',
    );
  }

  const amountInCent = collaboration.price * 100;
  try {
    // Transfer funds
    const transfer: any = await stripe.transfers.create({
      amount: amountInCent,
      currency: 'usd',
      destination: moneyReceiver.stripeAccountId as string,
    });
    console.log('transfer', transfer);

    // Payout to bank
    const payout = await stripe.payouts.create(
      {
        amount: amountInCent,
        currency: 'usd',
      },
      {
        stripeAccount: moneyReceiver.stripeAccountId as string,
      },
    );
    console.log('payout', payout);

    // Update collaboration data
    await Collaboration.findByIdAndUpdate(
      collaborationId,
      { status: ENUM_COLLABORATION_STATUS.COMPLETED },
      { new: true, runValidators: true },
    );
  } catch (error) {
    console.error('Error during transfer or payout:', error);
    throw error;
  }
};

const CollaborationService = {
  sendCollaborationRequest,
  getMyCollaborations,
  getAllCollaborations,
  updateCollaboration,
  deleteCollaboration,
  acceptCollaboration,
  markAsComplete,
};

export default CollaborationService;
