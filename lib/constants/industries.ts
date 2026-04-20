export const INDUSTRIES = [
  'Tech',
  'Finance',
  'Hospitality',
  'Creative',
  'Legal',
  'Real Estate',
  'Health',
  'Consulting',
  'Education',
  'Retail',
  'Manufacturing',
  'Media',
  'Non-profit',
  'Other',
] as const;

export type Industry = (typeof INDUSTRIES)[number];

export function isIndustry(value: string): value is Industry {
  return (INDUSTRIES as readonly string[]).includes(value);
}
