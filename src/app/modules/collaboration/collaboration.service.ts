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
import isAccountReady from '../../helper/isAccountReady';
import { adminFeeParcent } from '../../constant';
import Notification from '../notification/notification.model';
import { getIO } from '../../socket/socketManager';
import getUserNotificationCount from '../../helper/getUserNotificationCount';
const stripe = new Stripe(config.stripe.stripe_secret_key as string);
// send collaboraton --------------
const sendCollaborationRequest = async (profileId: string, payload: any) => {
  const io = getIO();
  const receiver = await NormalUser.findById(payload.receiver);
  const sender = await NormalUser.findById(profileId);
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

  await Notification.create({
    title: 'New collaboration request received',
    message: `New collaboratin request received from ${sender?.name}`,
    receiver: payload.receiver,
  });
  const updatedNotificationCount = await getUserNotificationCount(
    payload.receiver,
  );
  io.to(payload.receiver).emit('notifications', updatedNotificationCount);

  return result;
};

// get my collaboration
const getMyCollaborations = async (
  profileId: string,
  query: Record<string, unknown>,
) => {
  const collaborationQuery = new QueryBuilder(
    Collaboration.find({
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
    meta,
    result,
  };
};

const getSingleCollaboration = async (id: string) => {
  const result = await Collaboration.findById(id)
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

const acceptRejectCollaboration = async (
  profileId: string,
  collaborationId: string,
  status: string,
) => {
  const io = getIO();
  const collaboration = await Collaboration.findOne({
    _id: collaborationId,
    receiver: profileId,
    status: ENUM_COLLABORATION_STATUS.PENDING,
  })
    .populate({ path: 'sender', select: 'name' })
    .populate({ path: 'receiver', select: 'name' });
  if (!collaboration) {
    throw new AppError(httpStatus.NOT_FOUND, 'Collaboration not found');
  }

  if (status == ENUM_COLLABORATION_STATUS.REJECTED) {
    const result = await Collaboration.findByIdAndUpdate(
      collaborationId,
      { status },
      { new: true, runValidators: true },
    );
    await Notification.create({
      title: 'Collaboration request rejected',
      message: `Your collaboration request rejected by ${collaboration.receiver.name}`,
      receiver: collaboration.sender._id,
    });
    const updatedNotificationCount = await getUserNotificationCount(
      collaboration.sender._id,
    );
    io.to(collaboration.sender._id).emit(
      'notifications',
      updatedNotificationCount,
    );
    return result;
  } else {
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
      success_url: `${config.stripe.collaboration_success_url}?collaborationId=${collaborationId}`,
      cancel_url: `${config.stripe.collaboration_cancel_url}`,
    });

    return { url: session.url };
  }
};

// mark as complete
const markAsComplete = async (profileId: string, collaborationId: string) => {
  const io = getIO();
  const collaboration = await Collaboration.findOne({
    _id: collaborationId,
    receiver: profileId,
    status: ENUM_COLLABORATION_STATUS.UPCOMING,
  });
  if (!collaboration) {
    throw new AppError(httpStatus.NOT_FOUND, 'Collaboration not found');
  }

  const moneyReceiver = await NormalUser.findById(collaboration.sender);
  if (!moneyReceiver) {
    throw new AppError(
      httpStatus.PARTIAL_CONTENT,
      'Payment receiver not found , contact with collaborator',
    );
  }
  if (!moneyReceiver?.stripeAccountId) {
    throw new AppError(
      httpStatus.PARTIAL_CONTENT,
      'Payment receiver acount details not completed, contact with collaborator',
    );
  }
  const isReady = await isAccountReady(moneyReceiver.stripeAccountId);
  if (!moneyReceiver?.isStripeConnected || !isReady) {
    throw new AppError(
      httpStatus.PARTIAL_CONTENT,
      'Payment receiver acount details not completed, contact with collaborator!',
    );
  }
  const totalAmount = collaboration.price;
  const adminFee = (collaboration.price * adminFeeParcent) / 100;
  const payableAmount = totalAmount - adminFee;
  const amountInCent = payableAmount * 100;

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

    await Notification.create({
      title: 'Collaboration completed',
      message: `Congratullations your collaboration is completed , you got $${collaboration.price}`,
      receiver: collaboration.sender,
    });
    const updatedNotificationCount = await getUserNotificationCount(
      collaboration.sender.toString(),
    );
    io.to(collaboration.sender.toString()).emit(
      'notifications',
      updatedNotificationCount,
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
  acceptRejectCollaboration,
  getSingleCollaboration,
  markAsComplete,
};

export default CollaborationService;
