import { ICollaboration } from './collaboration.interface';
import Collaboration from './collaboration.model';

const sendCollaborationRequest = async (
  profileId: string,
  payload: ICollaboration,
) => {
  const result = await Collaboration.create({ ...payload, sender: profileId });
  return result;
};

const CollaborationService = {
  sendCollaborationRequest,
};

export default CollaborationService;
