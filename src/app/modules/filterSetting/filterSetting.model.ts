import mongoose, { Schema } from 'mongoose';
import { IFilterSetting } from './filterSetting.interface';

const FilterSettingSchema: Schema = new Schema<IFilterSetting>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'NormalUser',
    },
    locationTypes: {
      type: [String],
      required: true,
    },
    artistTypes: {
      type: [Schema.Types.ObjectId],
      ref: 'Artist',
      required: true,
    },
  },
  { timestamps: true },
);

const FilterSetting = mongoose.model<IFilterSetting>(
  'FilterSetting',
  FilterSettingSchema,
);
export default FilterSetting;
