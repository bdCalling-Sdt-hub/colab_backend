/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/appError';
import NormalUser from '../normalUser/normalUser.model';
import Collaboration from './collaboration.model';
import { ICollaboration } from './collaboration.interface';
import { ENUM_COLLABORATION_STATUS } from '../../utilities/enum';

// send collaboraton --------------
const sendCollaborationRequest = async (profileId: string, payload: any) => {
  const receiver = await NormalUser.findById(payload.receiver);
  if (!receiver) {
    throw new AppError(httpStatus.NOT_FOUND, 'Receiver not found');
  }
  if (!receiver.stripeAccountId || !receiver.isStripeConnected) {
    throw new AppError(
      httpStatus.UNAVAILABLE_FOR_LEGAL_REASONS,
      "This persion don't provide his/her payment info , please try again leter",
    );
  }

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
  payload: Partial<ICollaboration>,
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
      `You can't delete ${collaboration.status}`,
    );
  }

  const result = await Collaboration.findOneAndDelete({
    _id: collaborationId,
    sender: profileId,
  });
  return result;
};
const CollaborationService = {
  sendCollaborationRequest,
  getMyCollaborations,
  getAllCollaborations,
  updateCollaboration,
  deleteCollaboration,
};

export default CollaborationService;
