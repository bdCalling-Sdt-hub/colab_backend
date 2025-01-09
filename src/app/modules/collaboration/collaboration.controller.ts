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
const getMyCollaborations = catchAsync(async (req, res) => {
  const result = await CollaborationService.getMyCollaborations(
    req.user.profileId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Collaboration retrieved successfully',
    data: result,
  });
});
const getAllCollaborations = catchAsync(async (req, res) => {
  const result = await CollaborationService.getAllCollaborations(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Collaboration retrieved successfully',
    data: result,
  });
});

const CollaborationController = {
  sendCollaborationRequest,
  getMyCollaborations,
  getAllCollaborations,
};

export default CollaborationController;
