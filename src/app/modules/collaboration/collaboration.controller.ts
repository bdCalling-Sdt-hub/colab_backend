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
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Collaboration retrieved successfully',
    data: result,
  });
});
const getSingleCollaboration = catchAsync(async (req, res) => {
  const result = await CollaborationService.getSingleCollaboration(
    req.params.id,
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
const updateCollaboration = catchAsync(async (req, res) => {
  const result = await CollaborationService.updateCollaboration(
    req.user.profileId,
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Collaboration updated successfully',
    data: result,
  });
});
const deleteCollaboration = catchAsync(async (req, res) => {
  const result = await CollaborationService.deleteCollaboration(
    req.user.profileId,
    req.params.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Collaboration deleted successfully',
    data: result,
  });
});
const acceptCollaboration = catchAsync(async (req, res) => {
  const result = await CollaborationService.acceptCollaboration(
    req.user.profileId,
    req.params.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Collaboration accepted successfully',
    data: result,
  });
});
const markAsComplete = catchAsync(async (req, res) => {
  const result = await CollaborationService.markAsComplete(
    req.user.profileId,
    req.params.id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Collaboration completed successfully',
    data: result,
  });
});

const CollaborationController = {
  sendCollaborationRequest,
  getMyCollaborations,
  getAllCollaborations,
  updateCollaboration,
  deleteCollaboration,
  acceptCollaboration,
  markAsComplete,
  getSingleCollaboration,
};

export default CollaborationController;
