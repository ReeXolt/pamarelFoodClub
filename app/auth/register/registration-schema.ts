import { z } from 'zod';

export const registrationSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),

  email: z.string()
    .email('Please enter a valid email address'),

  phone: z.string()
    .min(10, 'Please enter a valid phone number'),

  password: z.string()
    .min(6, 'Password must be at least 6 characters'),

  confirmPassword: z.string(),

  referralCode: z.string()
    .optional()
    .or(z.literal('')),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
);

export type RegistrationFormValues = z.infer<typeof registrationSchema>;
