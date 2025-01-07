import { z } from 'zod';


export const normalUserValidationSchema = z.object({
  body:z.object({
    user: z.string().nonempty('User ID is required'),
    name: z.string().nonempty('Name is required'),
    email: z.string().email('Invalid email address').nonempty('Email is required'),
    address: z.string().optional(),
    profile_image: z.string().optional().default(''),
    mainSkill: z.string().nonempty('Main skill is required'),
    additionalSkills: z
      .array(z.string())
      .max(3, 'You can specify up to 3 additional skills only'),
  
  })
});

const normalUserValidations = {
  normalUserValidationSchema
}

export default normalUserValidations;

