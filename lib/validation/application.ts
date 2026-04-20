import { z } from 'zod';
import { INDUSTRIES } from '@/lib/constants/industries';

export const step1Schema = z.object({
  email: z.string().email({ message: 'Enter a valid email' }),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Name too short').max(100),
});

const step2Base = z.object({
  company: z.string().min(1, 'Company or employer required').max(120),
  business_role: z.string().min(1, 'Role required').max(120),
  industry: z.enum(INDUSTRIES as unknown as [string, ...string[]], {
    message: 'Pick an industry',
  }),
  industry_other: z.string().max(120).optional(),
  headline: z.string().min(5, 'At least 5 characters').max(200, 'Keep it under 200'),
});

export const step2Schema = step2Base.refine(
  (d) => d.industry !== 'Other' || (d.industry_other && d.industry_other.trim().length >= 2),
  { path: ['industry_other'], message: 'Please tell us which industry' }
);

export const step3Schema = z.object({
  hopes_to_get: z.string().min(50, 'A sentence or two — at least 50 characters').max(1000),
  hopes_to_bring: z.string().min(50, 'A sentence or two — at least 50 characters').max(1000),
  contributor_interest: z.boolean(),
});

export const step4Schema = z.object({
  linkedin_url: z.string().url('Must be a URL').refine(
    (u) => u.includes('linkedin.com'),
    { message: 'Must be a LinkedIn URL' }
  ),
  whatsapp_number: z.string().regex(
    /^\+\d{10,15}$/,
    'Include country code, digits only (e.g. +34612345678, at least 10 digits)'
  ),
  heard_from: z.string().min(2, 'Tell us how').max(500),
  additional_info: z.string().max(2000).optional(),
});

export const step5Schema = z.object({
  consent_guidelines: z.literal(true, { message: 'Required' }),
  consent_privacy: z.literal(true, { message: 'Required' }),
  consent_contact: z.literal(true, { message: 'Required' }),
  consent_selective: z.literal(true, { message: 'Required' }),
  consent_directory: z.literal(true, { message: 'Required' }),
});

export const fullApplicationSchema = step1Schema
  .merge(step2Base)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema)
  .refine(
    (d) => d.industry !== 'Other' || (d.industry_other && d.industry_other.trim().length >= 2),
    { path: ['industry_other'], message: 'Please tell us which industry' }
  );

export type FullApplication = z.infer<typeof fullApplicationSchema>;
