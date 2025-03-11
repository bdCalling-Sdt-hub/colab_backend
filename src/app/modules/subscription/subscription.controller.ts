import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import SubscriptionService from './subscription.service';

const purchaseSubscription = catchAsync(async (req, res) => {
  const result = await SubscriptionService.purchaseSubscription(
    req.user.profileId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subscription purchase successfully',
    data: result,
  });
});

const SubscriptionController = {
  purchaseSubscription,
};

export default SubscriptionController;
