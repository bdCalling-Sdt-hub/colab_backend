import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/appError';
import NormalUser from '../normalUser/normalUser.model';
import { IReport } from './report.interface';
import Report from './report.model';

const createReport = async (profileId: string, payload: IReport) => {
  const reportTo = await NormalUser.findById(payload.reportTo);
  if (!reportTo) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reported user not found');
  }
  const result = await Report.create({ ...payload, reportFrom: profileId });
  return result;
};

const getAllReports = async (query: Record<string, unknown>) => {
  const reportQuery = new QueryBuilder(
    Report.find()
      .populate({
        path: 'reportFrom',
        select: 'profile_image name',
        populate: { path: 'mainSkill', select: 'name' },
      })
      .populate({
        path: 'reportTo',
        select: 'profile_image name',
        populate: { path: 'mainSkill', select: 'name' },
      }),
    query,
  )
    .search(['incidentType'])
    .fields()
    .filter()
    .paginate()
    .sort();

  const result = await reportQuery.modelQuery;
  const meta = await reportQuery.countTotal();

  return {
    meta,
    result,
  };
};

const ReportService = {
  createReport,
  getAllReports,
};

export default ReportService;
