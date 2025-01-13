import { Types } from 'mongoose';

export interface IReport {
  reportFrom: Types.ObjectId;
  reportTo: Types.ObjectId;
  incidentType: string;
}
