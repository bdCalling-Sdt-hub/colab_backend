import { IReport } from './report.interface';
import Report from './report.model';

const createReport = async (profileId: string, payload: IReport) => {
  const result = await Report.create({ ...payload, reportFrom: profileId });
  return result;
};

const ReportService = {
  createReport,
};

export default ReportService;
