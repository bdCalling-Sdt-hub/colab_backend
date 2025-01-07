/* eslint-disable @typescript-eslint/no-explicit-any */
import { model, Schema } from 'mongoose';
import { INormalUser } from './normalUser.interface';

const NormalUserSchema = new Schema<INormalUser>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
    },
    profile_image: {
      type: String,
      default: '',
    },
    mainSkill:{
      type:String,
      // required:true
    },
    additionalSkills:{
      type:[String],
      validate: {
        validator: function (array:any) {
          return array.length <= 3;
        },
        message: 'You can specify up to 3 additional skills only.'
      }
    }
  },
  {
    timestamps: true,
  },
);
const NormalUser = model<INormalUser>('NormalUser', NormalUserSchema);

export default NormalUser;
