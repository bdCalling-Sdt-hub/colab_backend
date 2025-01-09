import QueryBuilder from '../../builder/QueryBuilder';
import { ICollaboration } from './collaboration.interface';
import Collaboration from './collaboration.model';

// send collaboraton --------------
const sendCollaborationRequest = async (
  profileId: string,
  payload: ICollaboration,
) => {
  const result = await Collaboration.create({ ...payload, sender: profileId });
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
