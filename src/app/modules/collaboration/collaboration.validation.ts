import { z } from 'zod';

const collaborationSchema = z.object({
  body: z.object({
    receiver: z.string({ required_error: 'Receiver is required' }),
    location: z.string().min(1, { message: 'Location is required' }),
    // startDate: z.preprocess(
    //   (val) => new Date(val as string),
    //   z.date().min(new Date(), {
    //     message: 'Start date must be in the future',
    //   }),
    // ),
    // startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    //   message: 'Invalid start time format (HH:mm)',
    // }),
    // endDate: z.preprocess(
    //   (val) => new Date(val as string),
    //   z.date().min(new Date(), {
    //     message: 'End date must be in the future',
    //   }),
    // ),
    // endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    //   message: 'Invalid end time format (HH:mm)',
    // }),
    price: z
      .number()
      .nonnegative({ message: 'Price must be a non-negative number' }),
    contactNumber: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid contact number' }),
    additionalNote: z.string().optional(),
  }),
});
const updateCollaborationSchema = z.object({
  body: z.object({
    location: z.string().min(1, { message: 'Location is required' }).optional(),
    startDate: z
      .preprocess(
        (val) => new Date(val as string),
        z.date().min(new Date(), {
          message: 'Start date must be in the future',
        }),
      )
      .optional(),
    startTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Invalid start time format (HH:mm)',
      })
      .optional(),
    endDate: z
      .preprocess(
        (val) => new Date(val as string),
        z.date().min(new Date(), {
          message: 'End date must be in the future',
        }),
      )
      .optional(),
    endTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Invalid end time format (HH:mm)',
      })
      .optional(),
    price: z
      .number()
      .nonnegative({ message: 'Price must be a non-negative number' })
      .optional(),
    contactNumber: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid contact number' })
      .optional(),
    additionalNote: z.string().optional(),
  }),
});

const acceptRejectValues = {
  accept: 'upcoming',
  rejected: 'rejected',
};
const acceepRejectCollaborationValidations = z.object({
  body: z.object({
    status: z.enum(Object.values(acceptRejectValues) as [string, ...string[]]),
  }),
});

const CollaborationValidations = {
  collaborationSchema,
  updateCollaborationSchema,
  acceepRejectCollaborationValidations,
};

export default CollaborationValidations;
