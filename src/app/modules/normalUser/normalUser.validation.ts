import { z } from 'zod';
import { ENUM_LOCATION_TYPE } from '../../utilities/enum';
import mongoose from 'mongoose';

const normalUserValidationSchema = z.object({
  body: z.object({
    user: z.string().nonempty('User ID is required'),
    name: z.string().nonempty('Name is required'),
    email: z
      .string()
      .email('Invalid email address')
      .nonempty('Email is required'),
    address: z.string().optional(),
    profile_image: z.string().optional().default(''),
    mainSkill: z.string().nonempty('Main skill is required'),
    additionalSkills: z
      .array(z.string())
      .max(3, 'You can specify up to 3 additional skills only'),
  }),
});
const registerUserValidationSchema = z.object({
  body: z.object({
    password: z.string({ required_error: 'Password is required' }),
    confirmPassword: z.string({
      required_error: 'Confirm password is required',
    }),
    userData: z.object({
      name: z.string().nonempty('Name is required'),
      email: z
        .string()
        .email('Invalid email address')
        .nonempty('Email is required'),
    }),
  }),
});

const normalUserUpdateValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),
    profile_image: z.string().optional().default(''),
    mainSkill: z.string().optional(),
    additionalSkills: z
      .array(z.string())
      .max(3, 'You can specify up to 3 additional skills only')
      .optional(),
  }),
  locationTypes: z
    .array(
      z.enum([
        ENUM_LOCATION_TYPE.CITY,
        ENUM_LOCATION_TYPE.STATE,
        ENUM_LOCATION_TYPE.COUNTRY,
      ]),
    )
    .optional(),

  artistTypes: z
    .array(
      z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: 'Invalid ObjectId',
      }),
    )
    .optional(),
});

const normalUserValidations = {
  registerUserValidationSchema,
  normalUserValidationSchema,
  normalUserUpdateValidationSchema,
};

export default normalUserValidations;
