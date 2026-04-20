import { z } from 'zod';

export const welcomeStepASchema = z.object({
  profile_picture_url: z.string().url().nullable(),
  bio: z.string().min(20, 'At least 20 characters').max(500, 'Keep under 500'),
  skills: z.array(z.string().min(1)).min(3, 'Add at least 3 skills').max(10, 'Max 10'),
});

export const welcomeStepBSchema = z.object({
  help_offered: z.array(z.string().min(1)).min(1, 'Add at least one').max(10),
  help_needed: z.array(z.string().min(1)).max(10),
  show_whatsapp: z.boolean(),
  show_email: z.boolean(),
  show_in_directory: z.boolean(),
});

export const welcomeSchema = welcomeStepASchema.merge(welcomeStepBSchema);
export type WelcomeData = z.infer<typeof welcomeSchema>;
