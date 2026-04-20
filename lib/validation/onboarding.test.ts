import { describe, it, expect } from 'vitest';
import { welcomeStepASchema, welcomeStepBSchema } from './onboarding';

describe('welcomeStepASchema', () => {
  it('needs 3 skills', () => {
    const r = welcomeStepASchema.safeParse({
      profile_picture_url: null,
      bio: 'hello world this is long enough',
      skills: ['a','b'],
    });
    expect(r.success).toBe(false);
  });
  it('accepts valid', () => {
    const r = welcomeStepASchema.safeParse({
      profile_picture_url: 'https://x.com/a.jpg',
      bio: 'hello world this is long enough',
      skills: ['a','b','c']
    });
    expect(r.success).toBe(true);
  });
});

describe('welcomeStepBSchema', () => {
  it('requires at least one help_offered', () => {
    const r = welcomeStepBSchema.safeParse({
      help_offered: [], help_needed: [],
      show_whatsapp: true, show_email: false, show_in_directory: true,
    });
    expect(r.success).toBe(false);
  });
});
