/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/appError';
import NormalUser from '../normalUser/normalUser.model';
import Collaboration from './collaboration.model';

// send collaboraton --------------
const sendCollaborationRequest = async (profileId: string, payload: any) => {
  const receiver = await NormalUser.findById(payload.receiver);
  if (!receiver) {
    throw new AppError(httpStatus.NOT_FOUND, 'Receiver not found');
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
    .populate({ path: 'sender' })
    .populate({ path: 'receiver' });
  return result;
};

// get all collaboration
const getAllCollaborations = async (query: Record<string, unknown>) => {
  const collaborationQuery = new QueryBuilder(
    Collaboration.find()
      .populate({ path: 'sender' })
      .populate({ path: 'receiver' }),
    query,
  )
    .search(['title'])
    .fields()
    .filter()
    .paginate()
    .sort();

  const result = collaborationQuery.modelQuery;
  const meta = collaborationQuery.countTotal();

  return {
    result,
    meta,
  };
};

const CollaborationService = {
  sendCollaborationRequest,
  getMyCollaborations,
  getAllCollaborations,
};

export default CollaborationService;
