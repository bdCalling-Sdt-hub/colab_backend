import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import CollaborationService from './collaboration.service';

const sendCollaborationRequest = catchAsync(async (req, res) => {
  const result = await CollaborationService.sendCollaborationRequest(
    req.user.profileId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Collaboration request sent successfully',
    data: result,
  });
});

const CollaborationController = {
  sendCollaborationRequest,
};

export default CollaborationController;
