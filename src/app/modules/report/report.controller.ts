import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import ReportService from './report.service';

const createReport = catchAsync(async (req, res) => {
  const result = await ReportService.createReport(req.user.profileId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Report summited successfully',
    data: result,
  });
});

const ReportController = {
  createReport,
};

export default ReportController;
