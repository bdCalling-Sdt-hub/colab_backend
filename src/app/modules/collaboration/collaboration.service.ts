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
  });
  return result;
};

const CollaborationService = {
  sendCollaborationRequest,
  getMyCollaborations,
};

export default CollaborationService;
