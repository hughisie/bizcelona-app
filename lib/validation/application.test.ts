import { describe, it, expect } from 'vitest';
import {
  step1Schema, step2Schema, step3Schema, step4Schema, step5Schema
} from './application';

describe('step1Schema', () => {
  it('accepts valid input', () => {
    const r = step1Schema.safeParse({ email: 'a@b.com', password: 'abcdefgh', full_name: 'Ana' });
    expect(r.success).toBe(true);
  });
  it('rejects short password', () => {
    const r = step1Schema.safeParse({ email: 'a@b.com', password: 'short', full_name: 'Ana' });
    expect(r.success).toBe(false);
  });
});

describe('step2Schema', () => {
  it('accepts valid industry', () => {
    const r = step2Schema.safeParse({
      company: 'Nimbus', business_role: 'Founder', industry: 'Tech',
      headline: 'Building dev tools',
    });
    expect(r.success).toBe(true);
  });
  it('rejects unknown industry', () => {
    const r = step2Schema.safeParse({
      company: 'X', business_role: 'Y', industry: 'Aerospace',
      headline: 'Hello world',
    });
    expect(r.success).toBe(false);
  });
});

describe('step3Schema', () => {
  it('rejects input shorter than 50 chars', () => {
    const r = step3Schema.safeParse({
      hopes_to_get: 'short', hopes_to_bring: 'also short', contributor_interest: false,
    });
    expect(r.success).toBe(false);
  });
  it('rejects input of exactly 49 chars', () => {
    const fortyNine = 'a'.repeat(49);
    const r = step3Schema.safeParse({
      hopes_to_get: fortyNine, hopes_to_bring: fortyNine, contributor_interest: false,
    });
    expect(r.success).toBe(false);
  });
  it('accepts input of 50+ chars', () => {
    const fifty = 'a'.repeat(50);
    const r = step3Schema.safeParse({
      hopes_to_get: fifty, hopes_to_bring: fifty, contributor_interest: true,
    });
    expect(r.success).toBe(true);
  });
});

describe('step4Schema', () => {
  it('requires linkedin domain', () => {
    const r = step4Schema.safeParse({
      linkedin_url: 'https://x.com/ana',
      whatsapp_number: '+34600000000',
      heard_from: 'friend',
    });
    expect(r.success).toBe(false);
  });
  it('requires country code on whatsapp', () => {
    const r = step4Schema.safeParse({
      linkedin_url: 'https://linkedin.com/in/ana',
      whatsapp_number: '600000000',
      heard_from: 'friend',
    });
    expect(r.success).toBe(false);
  });
});

describe('step5Schema', () => {
  it('all true passes', () => {
    const r = step5Schema.safeParse({
      consent_guidelines: true, consent_privacy: true, consent_contact: true,
      consent_selective: true, consent_directory: true,
    });
    expect(r.success).toBe(true);
  });
  it('any false fails', () => {
    const r = step5Schema.safeParse({
      consent_guidelines: true, consent_privacy: true, consent_contact: true,
      consent_selective: true, consent_directory: false,
    });
    expect(r.success).toBe(false);
  });
});
