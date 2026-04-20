# Onboarding, Profiles & Member Directory — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a unified signup-to-application wizard, a post-approval onboarding flow, polished member profile pages, a searchable member directory with WhatsApp contact, and an expanded admin surface for Bizcelona.

**Architecture:** Next.js 16 App Router + React 19 + Supabase (auth, Postgres, Storage) + Tailwind v4 + Resend. One new Postgres migration. Two new route groups (wizard, directory). Stateful client wizard (localStorage resume) writing to Supabase via server actions. Middleware gates onboarding.

**Tech Stack:** Next.js 16.0.8, React 19.2.1, Supabase SSR 0.8, Tailwind 4, TypeScript 5.9, Resend 6.6. Adding: `zod` (validation), `vitest` + `@vitejs/plugin-react` (utility tests), `clsx` (class helper).

**Spec:** `docs/superpowers/specs/2026-04-19-onboarding-and-member-directory-design.md`

**Working dir (referred to as `$APP` below):** `bizcelona-app/`. Unless a path starts with `/` or `docs/`, it's relative to `$APP`.

**Copy / text conventions:** British English, casual, no emoji unless in this plan.

---

## Phase 0 — Setup

### Task 0.1: Initialise git

**Files:** root of project (above `bizcelona-app/`)

- [ ] **Step 1: Initialise repo**

Run (from the parent dir containing `bizcelona-app/`, `bizcelona-website/`, `docs/`):
```bash
git init
```

- [ ] **Step 2: Create `.gitignore`**

Create `.gitignore` at project root:
```
# deps
node_modules/

# next
bizcelona-app/.next/
bizcelona-app/out/
bizcelona-app/build/

# env
.env
.env.local
.env*.local

# OS
.DS_Store

# editor
.vscode/
.idea/

# superpowers
.superpowers/

# test / coverage
coverage/
```

- [ ] **Step 3: Commit baseline**

```bash
git add -A
git commit -m "chore: initial import of existing bizcelona-app and docs"
```

---

### Task 0.2: Add dependencies

**Files:** `package.json`

- [ ] **Step 1: Install runtime + dev deps**

From `bizcelona-app/`:
```bash
npm install zod clsx
npm install -D vitest @vitejs/plugin-react @vitest/ui @types/react
```

- [ ] **Step 2: Add scripts**

Modify `package.json` `"scripts"` block to add:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 3: Create `vitest.config.ts` at `$APP/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

- [ ] **Step 4: Verify it boots**

Create a throwaway smoke test `$APP/lib/__smoke__.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
describe('vitest', () => {
  it('runs', () => expect(1 + 1).toBe(2));
});
```

Run:
```bash
npm test
```

Expected: 1 passed. Delete the file:
```bash
rm lib/__smoke__.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add bizcelona-app/package.json bizcelona-app/package-lock.json bizcelona-app/vitest.config.ts
git commit -m "chore: add zod, clsx, vitest"
```

---

### Task 0.3: Add industry constants and help-tag suggestions

**Files:** Create `lib/constants/industries.ts`, `lib/constants/help-tags.ts`

- [ ] **Step 1: Write `lib/constants/industries.ts`**

```ts
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
```

- [ ] **Step 2: Write `lib/constants/help-tags.ts`**

```ts
// Seeded suggestions for the wizard tag inputs. Members can also enter free text.
export const HELP_TAG_SUGGESTIONS = [
  'B2B marketing',
  'B2C marketing',
  'SEO',
  'Content strategy',
  'Product strategy',
  'Fundraising',
  'Pitch deck review',
  'Hiring first engineers',
  'Sales',
  'Partnerships',
  'Legal (employment)',
  'Legal (contracts)',
  'Tax / accounting',
  'Barcelona visas / autónomo',
  'Office / coworking recs',
  'PR / press',
  'Design / branding',
  'Web development',
  'Mobile development',
  'Data / analytics',
  'Customer support setup',
  'Operations',
  'Investor intros',
  'Mentorship',
] as const;
```

- [ ] **Step 3: Commit**

```bash
git add bizcelona-app/lib/constants
git commit -m "feat(constants): industries and help-tag suggestions"
```

---

## Phase 1 — Database migration

### Task 1.1: Write migration SQL

**Files:** Create `supabase/migrations/00009_onboarding_and_directory.sql`

- [ ] **Step 1: Write the full migration**

```sql
-- =====================================================
-- 00009: Onboarding, profiles, help_tags, directory
-- =====================================================

-- -----------------------------------------------------
-- PROFILES: add slug, onboarding gate, industry, headline
-- -----------------------------------------------------
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS headline TEXT;

-- Unique constraint on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_slug ON profiles(slug);

-- -----------------------------------------------------
-- APPLICATIONS: expand to match the 13-question form
-- -----------------------------------------------------
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS consent_guidelines BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_privacy BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_contact BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_selective BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_directory BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hopes_to_get TEXT,
  ADD COLUMN IF NOT EXISTS hopes_to_bring TEXT,
  ADD COLUMN IF NOT EXISTS contributor_interest BOOLEAN,
  ADD COLUMN IF NOT EXISTS heard_from TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS additional_info TEXT,
  ADD COLUMN IF NOT EXISTS industry TEXT;

-- Keep consent_given as derived convenience
CREATE OR REPLACE FUNCTION sync_consent_given()
RETURNS TRIGGER AS $$
BEGIN
  NEW.consent_given := (
    NEW.consent_guidelines AND NEW.consent_privacy AND
    NEW.consent_contact AND NEW.consent_selective AND NEW.consent_directory
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_consent_given_trigger ON applications;
CREATE TRIGGER sync_consent_given_trigger
  BEFORE INSERT OR UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION sync_consent_given();

-- -----------------------------------------------------
-- HELP TAGS
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS help_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('offered','needed')),
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, direction, tag)
);

CREATE INDEX IF NOT EXISTS idx_help_tags_user_id ON help_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_help_tags_direction_tag ON help_tags(direction, tag);

ALTER TABLE help_tags ENABLE ROW LEVEL SECURITY;

-- Owner can manage their own tags
DROP POLICY IF EXISTS help_tags_owner_all ON help_tags;
CREATE POLICY help_tags_owner_all ON help_tags
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Any authenticated user can read tags for approved, directory-visible members
DROP POLICY IF EXISTS help_tags_read_approved ON help_tags;
CREATE POLICY help_tags_read_approved ON help_tags
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM members m
      JOIN profiles p ON p.id = m.user_id
      WHERE m.user_id = help_tags.user_id
        AND m.status = 'approved'
        AND p.show_in_directory = true
    )
  );

-- -----------------------------------------------------
-- SLUG GENERATOR
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION generate_profile_slug(p_full_name TEXT, p_id UUID)
RETURNS TEXT AS $$
DECLARE
  base TEXT;
  candidate TEXT;
  i INT := 0;
BEGIN
  -- Lowercase, strip non-ascii letters/numbers, hyphenate
  base := lower(regexp_replace(
    regexp_replace(coalesce(p_full_name, 'member'), '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  ));
  base := trim(both '-' from base);
  IF base = '' THEN
    base := 'member';
  END IF;

  candidate := base;
  WHILE EXISTS (SELECT 1 FROM profiles WHERE slug = candidate AND id <> p_id) LOOP
    i := i + 1;
    candidate := base || '-' || i;
  END LOOP;

  RETURN candidate;
END;
$$ LANGUAGE plpgsql;

-- Trigger to fill slug on insert/update when full_name changes
CREATE OR REPLACE FUNCTION profiles_set_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.slug IS NULL)
     OR (TG_OP = 'UPDATE' AND (NEW.full_name IS DISTINCT FROM OLD.full_name) AND NEW.slug IS NULL) THEN
    NEW.slug := generate_profile_slug(NEW.full_name, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_set_slug_trigger ON profiles;
CREATE TRIGGER profiles_set_slug_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION profiles_set_slug();

-- Backfill slug for existing profiles
UPDATE profiles SET slug = generate_profile_slug(full_name, id) WHERE slug IS NULL;

-- -----------------------------------------------------
-- PUBLIC SLUG LOOKUP
-- Allow anonymous read of (id, slug, profile_picture_url) only.
-- We do this via a view with a permissive policy, separate from the main profiles RLS.
-- -----------------------------------------------------
CREATE OR REPLACE VIEW public_profile_slugs
WITH (security_invoker = true) AS
SELECT p.id, p.slug, p.profile_picture_url
FROM profiles p
JOIN members m ON m.user_id = p.id
WHERE m.status = 'approved' AND p.show_in_directory = true;

GRANT SELECT ON public_profile_slugs TO anon, authenticated;

-- -----------------------------------------------------
-- APPROVE / REJECT TRANSACTION
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION approve_application(
  p_application_id UUID,
  p_reviewer_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT user_id INTO v_user_id FROM applications WHERE id = p_application_id;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Application % not found', p_application_id;
  END IF;

  UPDATE applications
    SET status = 'approved',
        reviewed_by = p_reviewer_id,
        review_notes = p_notes
    WHERE id = p_application_id;

  INSERT INTO members (user_id, status, approved_by, approved_at, show_in_directory)
    VALUES (v_user_id, 'approved', p_reviewer_id, now(), true)
    ON CONFLICT (user_id) DO UPDATE
      SET status = 'approved',
          approved_by = p_reviewer_id,
          approved_at = now();

  PERFORM log_activity(p_reviewer_id, 'application_approved', 'application', p_application_id,
    jsonb_build_object('user_id', v_user_id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION reject_application(
  p_application_id UUID,
  p_reviewer_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT user_id INTO v_user_id FROM applications WHERE id = p_application_id;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Application % not found', p_application_id;
  END IF;

  UPDATE applications
    SET status = 'rejected',
        reviewed_by = p_reviewer_id,
        review_notes = p_notes
    WHERE id = p_application_id;

  INSERT INTO members (user_id, status, approved_by, show_in_directory)
    VALUES (v_user_id, 'rejected', p_reviewer_id, false)
    ON CONFLICT (user_id) DO UPDATE
      SET status = 'rejected';

  PERFORM log_activity(p_reviewer_id, 'application_rejected', 'application', p_application_id,
    jsonb_build_object('user_id', v_user_id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------
-- STORAGE BUCKET (profile pictures)
-- Run once; safe to re-run.
-- -----------------------------------------------------
-- Storage is set up via supabase dashboard or the storage API — SQL below is for the
-- RLS policies. The bucket creation itself is in Task 1.3.
-- Policies scoped to authenticated users uploading to their own path.

-- Allow authenticated users to upload their own picture (path = user_id/*)
DROP POLICY IF EXISTS profile_pictures_upload_own ON storage.objects;
CREATE POLICY profile_pictures_upload_own ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'profile-pictures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS profile_pictures_update_own ON storage.objects;
CREATE POLICY profile_pictures_update_own ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'profile-pictures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS profile_pictures_delete_own ON storage.objects;
CREATE POLICY profile_pictures_delete_own ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'profile-pictures'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Anyone can read profile pictures (public bucket)
DROP POLICY IF EXISTS profile_pictures_read_all ON storage.objects;
CREATE POLICY profile_pictures_read_all ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'profile-pictures');
```

- [ ] **Step 2: Commit**

```bash
git add bizcelona-app/supabase/migrations/00009_onboarding_and_directory.sql
git commit -m "feat(db): migration 00009 for onboarding, help tags, approve/reject functions"
```

---

### Task 1.2: Apply migration to the Supabase project

**Files:** none (execution only)

- [ ] **Step 1: Open the Supabase SQL editor**

Go to https://supabase.com/dashboard/project/wwjkxlbwvuvssamtsbqt/sql/new, paste the full contents of `supabase/migrations/00009_onboarding_and_directory.sql`, click Run.

- [ ] **Step 2: Verify tables and columns**

In the SQL editor, run:
```sql
SELECT column_name FROM information_schema.columns WHERE table_name='profiles' AND column_name IN ('slug','onboarding_completed_at','industry','headline');
SELECT column_name FROM information_schema.columns WHERE table_name='applications' AND column_name IN ('consent_guidelines','hopes_to_get','linkedin_url');
SELECT 1 FROM information_schema.tables WHERE table_name='help_tags';
SELECT 1 FROM pg_proc WHERE proname='approve_application';
```
All queries should return non-empty rows.

- [ ] **Step 3: Regenerate types**

From `$APP`:
```bash
npx supabase gen types typescript --project-id wwjkxlbwvuvssamtsbqt > types/database.types.ts
```

- [ ] **Step 4: Commit types**

```bash
git add bizcelona-app/types/database.types.ts
git commit -m "chore: regenerate Supabase types after 00009"
```

---

### Task 1.3: Create profile-pictures storage bucket

**Files:** none (Supabase dashboard action)

- [ ] **Step 1: Create bucket**

In Supabase dashboard → Storage → New bucket:
- Name: `profile-pictures`
- Public: YES
- File size limit: 2 MB
- Allowed MIME types: `image/png,image/jpeg,image/webp`

- [ ] **Step 2: Verify bucket exists**

Run in SQL editor:
```sql
SELECT id, public FROM storage.buckets WHERE id = 'profile-pictures';
```
Should return one row with `public=true`.

- [ ] **Step 3: Verify policies**

```sql
SELECT policyname FROM pg_policies WHERE tablename='objects' AND policyname LIKE 'profile_pictures_%';
```
Expected 4 policies.

---

## Phase 2 — Signup wizard + pending dashboard

### Task 2.1: Validation schemas

**Files:** Create `lib/validation/application.ts`, `lib/validation/application.test.ts`

- [ ] **Step 1: Write schema**

Create `lib/validation/application.ts`:
```ts
import { z } from 'zod';
import { INDUSTRIES } from '@/lib/constants/industries';

export const step1Schema = z.object({
  email: z.string().email({ message: 'Enter a valid email' }),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Name too short').max(100),
});

export const step2Schema = z.object({
  company: z.string().min(1, 'Company or employer required').max(120),
  business_role: z.string().min(1, 'Role required').max(120),
  industry: z.enum(INDUSTRIES as unknown as [string, ...string[]], {
    message: 'Pick an industry',
  }),
  headline: z.string().min(5, 'At least 5 characters').max(200, 'Keep it under 200'),
});

export const step3Schema = z.object({
  hopes_to_get: z.string().min(10, 'Tell us a little more').max(1000),
  hopes_to_bring: z.string().min(10, 'Tell us a little more').max(1000),
  contributor_interest: z.boolean(),
});

export const step4Schema = z.object({
  linkedin_url: z.string().url('Must be a URL').refine(
    (u) => u.includes('linkedin.com'),
    { message: 'Must be a LinkedIn URL' }
  ),
  whatsapp_number: z.string().regex(
    /^\+\d{7,15}$/,
    'Include country code, digits only (e.g. +34612345678)'
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
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema);

export type FullApplication = z.infer<typeof fullApplicationSchema>;
```

- [ ] **Step 2: Write tests**

Create `lib/validation/application.test.ts`:
```ts
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

describe('step3Schema', () => {
  it('requires >= 10 chars on each prompt', () => {
    const r = step3Schema.safeParse({
      hopes_to_get: 'short', hopes_to_bring: 'also short', contributor_interest: false,
    });
    expect(r.success).toBe(false);
  });
});
```

- [ ] **Step 3: Run tests**

```bash
npm test
```
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add bizcelona-app/lib/validation
git commit -m "feat(validation): zod schemas for 5-step signup wizard + tests"
```

---

### Task 2.2: Wizard UI primitives

**Files:** Create `components/wizard/WizardProgress.tsx`, `components/wizard/WizardShell.tsx`, `components/wizard/useWizardState.ts`, `lib/cn.ts`

- [ ] **Step 1: Write class helper `lib/cn.ts`**

```ts
import clsx, { type ClassValue } from 'clsx';
export function cn(...args: ClassValue[]) { return clsx(...args); }
```

- [ ] **Step 2: Write `components/wizard/useWizardState.ts`**

```ts
'use client';
import { useCallback, useEffect, useState } from 'react';

export function useWizardState<T extends Record<string, unknown>>(
  storageKey: string,
  initial: T
) {
  const [state, setState] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<T>;
        setState((s) => ({ ...s, ...parsed }));
      }
    } catch {}
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch {}
  }, [storageKey, state, hydrated]);

  const update = useCallback((patch: Partial<T>) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  const clear = useCallback(() => {
    try { localStorage.removeItem(storageKey); } catch {}
    setState(initial);
  }, [initial, storageKey]);

  return { state, update, clear, hydrated };
}
```

- [ ] **Step 3: Write `components/wizard/WizardProgress.tsx`**

```tsx
import { cn } from '@/lib/cn';

export function WizardProgress({
  step, total, labels,
}: { step: number; total: number; labels: string[] }) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-gray-500 mb-2">
        <span>Step {step} of {total}</span>
        <span>{Math.round((step / total) * 100)}%</span>
      </div>
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-saffron transition-all duration-300"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>
      <div className="mt-3 grid grid-cols-5 gap-1 text-[10px] text-gray-500">
        {labels.map((l, i) => (
          <div
            key={l}
            className={cn(
              'truncate',
              i + 1 === step ? 'text-navy font-semibold' : '',
              i + 1 < step ? 'text-saffron' : ''
            )}
          >
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write `components/wizard/WizardShell.tsx`**

```tsx
'use client';
import { WizardProgress } from './WizardProgress';

export function WizardShell({
  step, total, labels, title, subtitle, children, footer,
}: {
  step: number; total: number; labels: string[];
  title: string; subtitle?: string;
  children: React.ReactNode; footer: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-off-white py-10 px-4">
      <WizardProgress step={step} total={total} labels={labels} />
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-navy">{title}</h1>
        {subtitle && <p className="text-gray-600 mt-1 text-sm">{subtitle}</p>}
        <div className="mt-6">{children}</div>
        <div className="mt-8 flex justify-between">{footer}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add bizcelona-app/components/wizard bizcelona-app/lib/cn.ts
git commit -m "feat(wizard): shell + progress + state hook primitives"
```

---

### Task 2.3: Server actions for the wizard

**Files:** Create `app/api/signup/step1/route.ts`, `app/api/application/submit/route.ts`

- [ ] **Step 1: Write `app/api/signup/step1/route.ts`**

```ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { step1Schema } from '@/lib/validation/application';

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = step1Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth-confirm`,
      data: { full_name: parsed.data.full_name },
    },
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  const userId = data.user?.id;
  if (userId) {
    // Trigger handle_new_user should have created profile row; set full_name.
    await supabase.from('profiles').update({ full_name: parsed.data.full_name }).eq('id', userId);
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Write `app/api/application/submit/route.ts`**

```ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fullApplicationSchema } from '@/lib/validation/application';

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = fullApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    );
  }
  const d = parsed.data;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Not signed in' }, { status: 401 });

  // Living record
  const profileUpdate = {
    full_name: d.full_name,
    company: d.company,
    business_role: d.business_role,
    industry: d.industry,
    headline: d.headline,
    whatsapp_number: d.whatsapp_number,
    linkedin_url: d.linkedin_url,
  };
  const { error: pErr } = await supabase.from('profiles').update(profileUpdate).eq('id', user.id);
  if (pErr) return NextResponse.json({ ok: false, error: pErr.message }, { status: 500 });

  // Immutable application snapshot
  const applicationRow = {
    user_id: user.id,
    full_name: d.full_name,
    email: d.email,
    phone_number: d.whatsapp_number,      // existing NOT NULL column — reuse WhatsApp
    whatsapp_number: d.whatsapp_number,
    business_role: d.business_role,
    company: d.company,
    industry: d.industry,
    message: d.hopes_to_get,               // existing NOT NULL column — reuse hopes_to_get
    hopes_to_get: d.hopes_to_get,
    hopes_to_bring: d.hopes_to_bring,
    contributor_interest: d.contributor_interest,
    heard_from: d.heard_from,
    linkedin_url: d.linkedin_url,
    additional_info: d.additional_info ?? null,
    consent_guidelines: d.consent_guidelines,
    consent_privacy: d.consent_privacy,
    consent_contact: d.consent_contact,
    consent_selective: d.consent_selective,
    consent_directory: d.consent_directory,
    status: 'submitted' as const,
  };

  const { error: aErr } = await supabase.from('applications').upsert(applicationRow, { onConflict: 'user_id' });
  if (aErr) return NextResponse.json({ ok: false, error: aErr.message }, { status: 500 });

  // Ensure members row in 'pending'
  await supabase.from('members').upsert({ user_id: user.id, status: 'pending' }, { onConflict: 'user_id' });

  // Notify admins (best-effort)
  fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/new-application`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ user_id: user.id }),
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Smoke check**

```bash
npm run build
```
Expected: build succeeds. Fix any import errors.

- [ ] **Step 4: Commit**

```bash
git add bizcelona-app/app/api/signup bizcelona-app/app/api/application
git commit -m "feat(api): signup step1 + application submit endpoints"
```

---

### Task 2.4: Wizard step components

**Files:** Create `components/wizard/steps/Step1Account.tsx`, `Step2AboutYou.tsx`, `Step3Intentions.tsx`, `Step4Socials.tsx`, `Step5Consent.tsx`

All steps accept `{ state, update }` and a `fieldError` helper. Each renders inputs; validation happens on Next in the parent.

- [ ] **Step 1: Write `components/wizard/steps/Step1Account.tsx`**

```tsx
'use client';
export function Step1Account({
  state, update,
}: {
  state: { email: string; password: string; full_name: string };
  update: (p: Partial<{ email: string; password: string; full_name: string }>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-navy">Full name</label>
        <input
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={state.full_name}
          onChange={(e) => update({ full_name: e.target.value })}
          placeholder="Ana García"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-navy">Email</label>
        <input
          type="email"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={state.email}
          onChange={(e) => update({ email: e.target.value })}
          placeholder="you@company.com"
          autoComplete="email"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-navy">Password</label>
        <input
          type="password"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={state.password}
          onChange={(e) => update({ password: e.target.value })}
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />
        <p className="text-xs text-gray-500 mt-1">We'll send you a verification link in the background — keep going.</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `components/wizard/steps/Step2AboutYou.tsx`**

```tsx
'use client';
import { INDUSTRIES } from '@/lib/constants/industries';

export function Step2AboutYou({
  state, update,
}: {
  state: { company: string; business_role: string; industry: string; headline: string };
  update: (p: Partial<{ company: string; business_role: string; industry: string; headline: string }>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-navy">Company / Employer</label>
          <input
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={state.company}
            onChange={(e) => update({ company: e.target.value })}
            placeholder="Nimbus"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy">Role / Job title</label>
          <input
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={state.business_role}
            onChange={(e) => update({ business_role: e.target.value })}
            placeholder="Founder"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-navy">Industry</label>
        <select
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
          value={state.industry}
          onChange={(e) => update({ industry: e.target.value })}
        >
          <option value="">Pick one…</option>
          {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-navy">What do you do? <span className="text-gray-500 font-normal">(one or two sentences)</span></label>
        <textarea
          rows={3}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={state.headline}
          onChange={(e) => update({ headline: e.target.value })}
          placeholder="Building a dev-tools startup in Poblenou. Ex-Typeform."
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write `components/wizard/steps/Step3Intentions.tsx`**

```tsx
'use client';
export function Step3Intentions({
  state, update,
}: {
  state: { hopes_to_get: string; hopes_to_bring: string; contributor_interest: boolean };
  update: (p: Partial<{ hopes_to_get: string; hopes_to_bring: string; contributor_interest: boolean }>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-navy">What are you hoping to get from Bizcelona?</label>
        <textarea
          rows={3}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={state.hopes_to_get}
          onChange={(e) => update({ hopes_to_get: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-navy">What do you hope to bring?</label>
        <p className="text-xs text-gray-500 mb-1">Bizcelona runs on a give-first model. Tell us how you'll show up for others.</p>
        <textarea
          rows={3}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={state.hopes_to_bring}
          onChange={(e) => update({ hopes_to_bring: e.target.value })}
        />
      </div>
      <div>
        <div className="text-sm font-medium text-navy">We look for "contributors" — members who actively help each other. Interested?</div>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            className={`px-4 py-2 text-sm rounded-md border ${state.contributor_interest ? 'bg-navy text-white border-navy' : 'bg-white border-gray-300 text-navy'}`}
            onClick={() => update({ contributor_interest: true })}
          >
            Yes
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm rounded-md border ${!state.contributor_interest ? 'bg-navy text-white border-navy' : 'bg-white border-gray-300 text-navy'}`}
            onClick={() => update({ contributor_interest: false })}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write `components/wizard/steps/Step4Socials.tsx`**

```tsx
'use client';
export function Step4Socials({
  state, update,
}: {
  state: { linkedin_url: string; whatsapp_number: string; heard_from: string; additional_info: string };
  update: (p: Partial<{ linkedin_url: string; whatsapp_number: string; heard_from: string; additional_info: string }>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-navy">LinkedIn URL</label>
        <input
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={state.linkedin_url}
          onChange={(e) => update({ linkedin_url: e.target.value })}
          placeholder="https://linkedin.com/in/…"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-navy">WhatsApp number</label>
        <input
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={state.whatsapp_number}
          onChange={(e) => update({ whatsapp_number: e.target.value })}
          placeholder="+34612345678"
        />
        <p className="text-xs text-gray-500 mt-1">Include country code, digits only.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-navy">How did you hear about Bizcelona?</label>
        <input
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={state.heard_from}
          onChange={(e) => update({ heard_from: e.target.value })}
          placeholder="Introduced by … / Found on LinkedIn / …"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-navy">Anything else? <span className="text-gray-500 font-normal">(optional)</span></label>
        <textarea
          rows={3}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={state.additional_info}
          onChange={(e) => update({ additional_info: e.target.value })}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Write `components/wizard/steps/Step5Consent.tsx`**

```tsx
'use client';
type Consent = {
  consent_guidelines: boolean; consent_privacy: boolean; consent_contact: boolean;
  consent_selective: boolean; consent_directory: boolean;
};

const ITEMS: { key: keyof Consent; label: string }[] = [
  { key: 'consent_guidelines', label: 'I agree to follow the community guidelines.' },
  { key: 'consent_privacy', label: 'I understand this is a closed, private space and I will respect other members\' privacy.' },
  { key: 'consent_contact', label: 'I agree to be contacted by Bizcelona about my application and membership.' },
  { key: 'consent_selective', label: 'I understand that Bizcelona is selective — not every application is accepted.' },
  { key: 'consent_directory', label: 'I agree to have my name, profession and photo shown in the members database.' },
];

export function Step5Consent({
  state, update,
}: {
  state: Consent;
  update: (p: Partial<Consent>) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">Please confirm the following. All five are required.</p>
      {ITEMS.map((i) => (
        <label key={i.key} className="flex gap-3 items-start p-3 border border-gray-200 rounded-md hover:bg-beige cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4"
            checked={state[i.key]}
            onChange={(e) => update({ [i.key]: e.target.checked } as Partial<Consent>)}
          />
          <span className="text-sm text-navy">{i.label}</span>
        </label>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add bizcelona-app/components/wizard/steps
git commit -m "feat(wizard): 5 step components"
```

---

### Task 2.5: Unified `/signup` wizard page

**Files:** Replace `app/(auth)/signup/page.tsx`

- [ ] **Step 1: Read the existing file to understand what it currently renders**

```bash
cat 'bizcelona-app/app/(auth)/signup/page.tsx' | head -40
```
(No action — context only. Safe to fully replace; old logic is a single-page signup form.)

- [ ] **Step 2: Write the new `app/(auth)/signup/page.tsx`**

```tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WizardShell } from '@/components/wizard/WizardShell';
import { useWizardState } from '@/components/wizard/useWizardState';
import { Step1Account } from '@/components/wizard/steps/Step1Account';
import { Step2AboutYou } from '@/components/wizard/steps/Step2AboutYou';
import { Step3Intentions } from '@/components/wizard/steps/Step3Intentions';
import { Step4Socials } from '@/components/wizard/steps/Step4Socials';
import { Step5Consent } from '@/components/wizard/steps/Step5Consent';
import {
  step1Schema, step2Schema, step3Schema, step4Schema, step5Schema,
} from '@/lib/validation/application';

const LABELS = ['Account', 'About you', 'Intentions', 'Socials & source', 'Consent & submit'];

type State = {
  email: string; password: string; full_name: string;
  company: string; business_role: string; industry: string; headline: string;
  hopes_to_get: string; hopes_to_bring: string; contributor_interest: boolean;
  linkedin_url: string; whatsapp_number: string; heard_from: string; additional_info: string;
  consent_guidelines: boolean; consent_privacy: boolean; consent_contact: boolean;
  consent_selective: boolean; consent_directory: boolean;
  step1Done: boolean;
};

const INITIAL: State = {
  email: '', password: '', full_name: '',
  company: '', business_role: '', industry: '', headline: '',
  hopes_to_get: '', hopes_to_bring: '', contributor_interest: false,
  linkedin_url: '', whatsapp_number: '', heard_from: '', additional_info: '',
  consent_guidelines: false, consent_privacy: false, consent_contact: false,
  consent_selective: false, consent_directory: false,
  step1Done: false,
};

export default function SignupWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { state, update } = useWizardState<State>('bizcelona-signup-wizard', INITIAL);

  async function next() {
    setErr(null);
    setBusy(true);
    try {
      if (step === 1) {
        const r = step1Schema.safeParse({ email: state.email, password: state.password, full_name: state.full_name });
        if (!r.success) { setErr(r.error.issues[0]?.message ?? 'Invalid input'); return; }
        if (!state.step1Done) {
          const res = await fetch('/api/signup/step1', {
            method: 'POST', headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email: state.email, password: state.password, full_name: state.full_name }),
          });
          const data = await res.json();
          if (!data.ok) { setErr(data.error ?? 'Could not create account'); return; }
          update({ step1Done: true });
        }
        setStep(2); return;
      }
      if (step === 2) {
        const r = step2Schema.safeParse({
          company: state.company, business_role: state.business_role,
          industry: state.industry, headline: state.headline,
        });
        if (!r.success) { setErr(r.error.issues[0]?.message ?? 'Invalid input'); return; }
        setStep(3); return;
      }
      if (step === 3) {
        const r = step3Schema.safeParse({
          hopes_to_get: state.hopes_to_get, hopes_to_bring: state.hopes_to_bring,
          contributor_interest: state.contributor_interest,
        });
        if (!r.success) { setErr(r.error.issues[0]?.message ?? 'Invalid input'); return; }
        setStep(4); return;
      }
      if (step === 4) {
        const r = step4Schema.safeParse({
          linkedin_url: state.linkedin_url, whatsapp_number: state.whatsapp_number,
          heard_from: state.heard_from, additional_info: state.additional_info || undefined,
        });
        if (!r.success) { setErr(r.error.issues[0]?.message ?? 'Invalid input'); return; }
        setStep(5); return;
      }
      if (step === 5) {
        const r = step5Schema.safeParse({
          consent_guidelines: state.consent_guidelines, consent_privacy: state.consent_privacy,
          consent_contact: state.consent_contact, consent_selective: state.consent_selective,
          consent_directory: state.consent_directory,
        });
        if (!r.success) { setErr('Please tick every consent item'); return; }
        const res = await fetch('/api/application/submit', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify(state),
        });
        const data = await res.json();
        if (!data.ok) { setErr(data.error ?? 'Could not submit'); return; }
        router.push('/dashboard');
      }
    } finally { setBusy(false); }
  }

  return (
    <WizardShell
      step={step} total={5} labels={LABELS}
      title={step === 1 ? 'Create your account' : step === 5 ? 'Consent & submit' : LABELS[step-1]}
      subtitle={step === 1 ? 'Welcome to Bizcelona. Takes about 5 minutes.' : undefined}
      footer={
        <>
          <button
            type="button"
            className="px-4 py-2 text-sm text-navy border border-gray-300 rounded-md disabled:opacity-40"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1 || busy}
          >
            Back
          </button>
          <div className="flex items-center gap-3">
            {err && <span className="text-sm text-red-600">{err}</span>}
            <button
              type="button"
              className="px-5 py-2 text-sm bg-saffron text-navy font-semibold rounded-md disabled:opacity-40"
              onClick={next}
              disabled={busy}
            >
              {busy ? 'Working…' : step === 5 ? 'Submit application' : 'Next'}
            </button>
          </div>
        </>
      }
    >
      {step === 1 && <Step1Account state={state} update={update} />}
      {step === 2 && <Step2AboutYou state={state} update={update} />}
      {step === 3 && <Step3Intentions state={state} update={update} />}
      {step === 4 && <Step4Socials state={state} update={update} />}
      {step === 5 && <Step5Consent state={state} update={update} />}
    </WizardShell>
  );
}
```

- [ ] **Step 3: Build check**

```bash
npm run build
```
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add bizcelona-app/app/\(auth\)/signup/page.tsx
git commit -m "feat(signup): unified 5-step wizard replacing previous one-page form"
```

---

### Task 2.6: Update middleware for onboarding gate

**Files:** Modify `lib/supabase/middleware.ts`

- [ ] **Step 1: Rewrite the function**

Replace the file contents with:
```ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED = ['/dashboard', '/members', '/profile', '/admin', '/welcome'];
const AUTH_ROUTES = ['/login'];   // NOTE: /signup intentionally NOT here — wizard must be reachable while authed
const WELCOME_EXEMPT = ['/welcome', '/api/', '/auth-confirm', '/logout'];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED.some((p) => path.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.some((p) => path.startsWith(p));

  // Not logged in + protected → /login
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', path);
    return NextResponse.redirect(url);
  }

  // Logged in on /login → /dashboard
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Logged in + approved + onboarding not done → push to /welcome (except exempt paths)
  if (user) {
    const exempt = WELCOME_EXEMPT.some((p) => path.startsWith(p));
    if (!exempt) {
      const { data: rows } = await supabase
        .from('profiles')
        .select('onboarding_completed_at, id')
        .eq('id', user.id)
        .maybeSingle();

      if (rows && rows.onboarding_completed_at === null) {
        const { data: mem } = await supabase
          .from('members')
          .select('status')
          .eq('user_id', user.id)
          .maybeSingle();
        if (mem?.status === 'approved' && path !== '/welcome') {
          const url = request.nextUrl.clone();
          url.pathname = '/welcome';
          return NextResponse.redirect(url);
        }
      }
    }
  }

  return supabaseResponse;
}
```

- [ ] **Step 2: Build check**

```bash
npm run build
```
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add bizcelona-app/lib/supabase/middleware.ts
git commit -m "feat(middleware): onboarding gate + keep wizard reachable while authed"
```

---

### Task 2.7: Pending-state dashboard

**Files:** Rewrite `app/(protected)/dashboard/page.tsx`

- [ ] **Step 1: Write the new dashboard**

```tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: profile }, { data: application }, { data: member }] = await Promise.all([
    supabase.from('profiles').select('full_name, onboarding_completed_at').eq('id', user.id).maybeSingle(),
    supabase.from('applications').select('status, created_at').eq('user_id', user.id).maybeSingle(),
    supabase.from('members').select('status').eq('user_id', user.id).maybeSingle(),
  ]);

  const emailVerified = user.email_confirmed_at != null;

  // No application yet → send them to the wizard
  if (!application) redirect('/signup');

  const status = member?.status ?? application.status;
  const firstName = (profile?.full_name ?? '').split(' ')[0] || 'there';

  // Approved + onboarding done → full dashboard (this branch will grow in Phase 4)
  if (status === 'approved' && profile?.onboarding_completed_at) {
    return (
      <div className="min-h-screen bg-beige">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-navy">Welcome back, {firstName}</h1>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/members" className="block p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-saffron transition">
              <div className="text-xs uppercase tracking-wider text-gray-500">Explore</div>
              <div className="mt-1 text-lg font-semibold text-navy">Member directory</div>
              <div className="text-sm text-gray-600 mt-1">Find people to ask for help.</div>
            </Link>
            <Link href="/profile" className="block p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-saffron transition">
              <div className="text-xs uppercase tracking-wider text-gray-500">You</div>
              <div className="mt-1 text-lg font-semibold text-navy">Edit your profile</div>
              <div className="text-sm text-gray-600 mt-1">Keep your info fresh.</div>
            </Link>
            <form action="/api/auth/signout" method="post" className="block p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="text-xs uppercase tracking-wider text-gray-500">Session</div>
              <button className="mt-1 text-lg font-semibold text-navy underline">Sign out</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Pending / submitted
  return (
    <div className="min-h-screen bg-beige">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {!emailVerified && (
          <div className="mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200 flex items-center justify-between">
            <div className="text-sm text-yellow-900">
              Your email isn't verified yet. We sent a link to <b>{user.email}</b>.
            </div>
            <form action="/api/auth/resend-verification" method="post">
              <button className="text-sm font-semibold text-yellow-900 underline">Resend</button>
            </form>
          </div>
        )}

        <h1 className="text-3xl font-bold text-navy">Thanks, {firstName} — you're in the queue.</h1>
        <p className="mt-2 text-gray-600">We typically review applications within 3–5 working days. We'll email you as soon as we've decided.</p>

        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-xs uppercase tracking-wider text-gray-500">A peek at the community</div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            {[1,2,3].map((i) => (
              <div key={i} className="p-4 rounded-lg border border-gray-100 bg-gray-50 select-none">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-saffron to-navy mx-auto blur-sm"></div>
                <div className="mt-3 h-3 rounded bg-gray-200 animate-pulse"></div>
                <div className="mt-2 h-2 rounded bg-gray-200 animate-pulse w-2/3 mx-auto"></div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">You'll be able to see full profiles once you're approved.</p>
        </div>

        <form action="/api/auth/signout" method="post" className="mt-8 text-center">
          <button className="text-sm text-gray-500 underline">Sign out</button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add resend-verification route `app/api/auth/resend-verification/route.ts`**

```ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.redirect(new URL('/dashboard', process.env.NEXT_PUBLIC_APP_URL!));
  }
  await supabase.auth.resend({
    type: 'signup',
    email: user.email,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth-confirm` },
  });
  return NextResponse.redirect(new URL('/dashboard?resent=1', process.env.NEXT_PUBLIC_APP_URL!));
}
```

- [ ] **Step 3: Build check**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add bizcelona-app/app/\(protected\)/dashboard/page.tsx bizcelona-app/app/api/auth/resend-verification
git commit -m "feat(dashboard): pending-state UI + resend verification + approved-stub view"
```

---

### Task 2.8: Phase 2 manual smoke

- [ ] **Step 1: Run dev server**

```bash
cd bizcelona-app && npm run dev
```

- [ ] **Step 2: Walk through**

Open http://localhost:3000/signup, complete all 5 steps with a fresh email, submit. Verify:
- Account is created (check Supabase Auth tab).
- `applications` row appears with all new columns populated.
- `members` row `pending`.
- Redirected to `/dashboard` showing the "in the queue" state.
- Email-verify banner shows.
- Clicking Resend navigates back with `?resent=1`.

- [ ] **Step 3: Stop server**, no commit unless fixes needed.

---

## Phase 3 — Post-approval welcome onboarding

### Task 3.1: Welcome onboarding validation

**Files:** Create `lib/validation/onboarding.ts`, `lib/validation/onboarding.test.ts`

- [ ] **Step 1: Write schemas**

```ts
// lib/validation/onboarding.ts
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
```

- [ ] **Step 2: Tests**

```ts
// lib/validation/onboarding.test.ts
import { describe, it, expect } from 'vitest';
import { welcomeStepASchema, welcomeStepBSchema } from './onboarding';

describe('welcomeStepASchema', () => {
  it('needs 3 skills', () => {
    const r = welcomeStepASchema.safeParse({ profile_picture_url: null, bio: 'hello world this is long enough', skills: ['a','b'] });
    expect(r.success).toBe(false);
  });
  it('accepts valid', () => {
    const r = welcomeStepASchema.safeParse({
      profile_picture_url: 'https://x.com/a.jpg', bio: 'hello world this is long enough', skills: ['a','b','c']
    });
    expect(r.success).toBe(true);
  });
});

describe('welcomeStepBSchema', () => {
  it('requires at least one help_offered', () => {
    const r = welcomeStepBSchema.safeParse({
      help_offered: [], help_needed: [], show_whatsapp: true, show_email: false, show_in_directory: true,
    });
    expect(r.success).toBe(false);
  });
});
```

- [ ] **Step 3: Run & commit**

```bash
npm test
git add bizcelona-app/lib/validation/onboarding.ts bizcelona-app/lib/validation/onboarding.test.ts
git commit -m "feat(validation): welcome onboarding schemas + tests"
```

---

### Task 3.2: Tag input component

**Files:** Create `components/ui/TagInput.tsx`

- [ ] **Step 1: Write it**

```tsx
'use client';
import { useState } from 'react';

export function TagInput({
  value, onChange, placeholder, suggestions = [], max = 10,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  suggestions?: readonly string[];
  max?: number;
}) {
  const [input, setInput] = useState('');

  function add(tag: string) {
    const t = tag.trim();
    if (!t) return;
    if (value.includes(t)) return;
    if (value.length >= max) return;
    onChange([...value, t]);
    setInput('');
  }
  function remove(tag: string) { onChange(value.filter((v) => v !== tag)); }

  const filtered = input
    ? suggestions.filter(s => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)).slice(0, 6)
    : [];

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-2">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 px-2 py-1 bg-saffron/20 text-navy rounded-full text-xs">
            {t}
            <button type="button" onClick={() => remove(t)} className="text-navy/60 hover:text-navy">×</button>
          </span>
        ))}
      </div>
      <input
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(input); }
        }}
        placeholder={placeholder ?? 'Type and press Enter'}
        disabled={value.length >= max}
      />
      {filtered.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="px-2 py-0.5 text-xs border border-gray-300 rounded-full hover:bg-beige"
            >
              {s}
            </button>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-500 mt-1">{value.length}/{max}</p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add bizcelona-app/components/ui/TagInput.tsx
git commit -m "feat(ui): TagInput with suggestions"
```

---

### Task 3.3: Avatar upload endpoint

**Files:** Create `app/api/profile/avatar/route.ts`

- [ ] **Step 1: Write it**

```ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Not signed in' }, { status: 401 });

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: 'No file' }, { status: 400 });
  if (file.size > 2 * 1024 * 1024) return NextResponse.json({ ok: false, error: 'Max 2MB' }, { status: 400 });

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${user.id}/avatar.${ext}`;

  const { error: upErr } = await supabase.storage.from('profile-pictures').upload(path, file, {
    upsert: true, contentType: file.type,
  });
  if (upErr) return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });

  const { data: pub } = supabase.storage.from('profile-pictures').getPublicUrl(path);
  const cacheBusted = `${pub.publicUrl}?v=${Date.now()}`;

  await supabase.from('profiles').update({ profile_picture_url: cacheBusted }).eq('id', user.id);
  return NextResponse.json({ ok: true, url: cacheBusted });
}
```

- [ ] **Step 2: Commit**

```bash
git add bizcelona-app/app/api/profile/avatar
git commit -m "feat(api): avatar upload via Supabase Storage"
```

---

### Task 3.4: Onboarding submit endpoint

**Files:** Create `app/api/onboarding/complete/route.ts`

- [ ] **Step 1: Write it**

```ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { welcomeSchema } from '@/lib/validation/onboarding';

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = welcomeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid' }, { status: 400 });
  }
  const d = parsed.data;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Not signed in' }, { status: 401 });

  // Bio + privacy toggles + mark onboarding done. profile_picture_url was set by the avatar endpoint.
  const { error: pErr } = await supabase.from('profiles').update({
    bio: d.bio,
    show_whatsapp: d.show_whatsapp,
    show_email: d.show_email,
    show_in_directory: d.show_in_directory,
    onboarding_completed_at: new Date().toISOString(),
  }).eq('id', user.id);
  if (pErr) return NextResponse.json({ ok: false, error: pErr.message }, { status: 500 });

  // Replace skills
  await supabase.from('member_skills').delete().eq('user_id', user.id);
  if (d.skills.length) {
    await supabase.from('member_skills').insert(d.skills.map((s) => ({ user_id: user.id, skill_name: s })));
  }

  // Replace help tags
  await supabase.from('help_tags').delete().eq('user_id', user.id);
  const rows = [
    ...d.help_offered.map((t) => ({ user_id: user.id, direction: 'offered' as const, tag: t })),
    ...d.help_needed.map((t) => ({ user_id: user.id, direction: 'needed' as const, tag: t })),
  ];
  if (rows.length) await supabase.from('help_tags').insert(rows);

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add bizcelona-app/app/api/onboarding
git commit -m "feat(api): complete onboarding (profile polish + help tags)"
```

---

### Task 3.5: `/welcome` two-step onboarding page

**Files:** Create `app/(protected)/welcome/page.tsx`

- [ ] **Step 1: Write it**

```tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WizardShell } from '@/components/wizard/WizardShell';
import { TagInput } from '@/components/ui/TagInput';
import { HELP_TAG_SUGGESTIONS } from '@/lib/constants/help-tags';
import { welcomeStepASchema, welcomeStepBSchema } from '@/lib/validation/onboarding';

const LABELS = ['Profile polish', 'Help & privacy'];

export default function WelcomePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Step A state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);

  // Step B state
  const [offered, setOffered] = useState<string[]>([]);
  const [needed, setNeeded] = useState<string[]>([]);
  const [showWA, setShowWA] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [showDir, setShowDir] = useState(true);

  useEffect(() => {
    // Preload any existing profile data so returning users can edit.
    fetch('/api/profile/me').then(async (r) => {
      if (!r.ok) return;
      const j = await r.json();
      if (j?.profile?.profile_picture_url) setAvatarUrl(j.profile.profile_picture_url);
      if (j?.profile?.bio) setBio(j.profile.bio);
    }).catch(() => {});
  }, []);

  async function uploadAvatar(file: File) {
    const fd = new FormData(); fd.append('file', file);
    setBusy(true); setErr(null);
    try {
      const r = await fetch('/api/profile/avatar', { method: 'POST', body: fd });
      const j = await r.json();
      if (!j.ok) { setErr(j.error ?? 'Upload failed'); return; }
      setAvatarUrl(j.url);
    } finally { setBusy(false); }
  }

  async function next() {
    setErr(null);
    if (step === 1) {
      const r = welcomeStepASchema.safeParse({ profile_picture_url: avatarUrl, bio, skills });
      if (!r.success) { setErr(r.error.issues[0]?.message ?? 'Invalid input'); return; }
      setStep(2); return;
    }
    if (step === 2) {
      const r = welcomeStepBSchema.safeParse({
        help_offered: offered, help_needed: needed,
        show_whatsapp: showWA, show_email: showEmail, show_in_directory: showDir,
      });
      if (!r.success) { setErr(r.error.issues[0]?.message ?? 'Invalid input'); return; }
      setBusy(true);
      try {
        const res = await fetch('/api/onboarding/complete', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            profile_picture_url: avatarUrl, bio, skills,
            help_offered: offered, help_needed: needed,
            show_whatsapp: showWA, show_email: showEmail, show_in_directory: showDir,
          }),
        });
        const j = await res.json();
        if (!j.ok) { setErr(j.error ?? 'Could not complete'); return; }
        router.push('/dashboard');
      } finally { setBusy(false); }
    }
  }

  return (
    <WizardShell
      step={step} total={2} labels={LABELS}
      title={step === 1 ? 'Welcome in. Let\'s polish your profile.' : 'How you help — and what you need'}
      subtitle={step === 1 ? 'This is what other members will see.' : 'Help us connect you to the right people.'}
      footer={
        <>
          <button
            type="button"
            className="px-4 py-2 text-sm text-navy border border-gray-300 rounded-md disabled:opacity-40"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1 || busy}
          >Back</button>
          <div className="flex items-center gap-3">
            {err && <span className="text-sm text-red-600">{err}</span>}
            <button
              type="button"
              className="px-5 py-2 text-sm bg-saffron text-navy font-semibold rounded-md disabled:opacity-40"
              onClick={next}
              disabled={busy}
            >{busy ? 'Working…' : step === 2 ? 'Finish' : 'Next'}</button>
          </div>
        </>
      }
    >
      {step === 1 && (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full bg-gradient-to-br from-saffron to-navy"/>}
            </div>
            <div>
              <label className="inline-block px-3 py-2 text-sm border border-gray-300 rounded-md cursor-pointer hover:bg-beige">
                {avatarUrl ? 'Change photo' : 'Upload photo'}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }}
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">JPG/PNG/WebP up to 2MB</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy">Bio</label>
            <textarea
              rows={4} maxLength={500}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={bio} onChange={(e) => setBio(e.target.value)}
              placeholder="A few sentences about your work and what you're building."
            />
            <p className="text-xs text-gray-500 mt-1">{bio.length}/500</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy">Skills <span className="text-gray-500 font-normal">(3–10)</span></label>
            <TagInput value={skills} onChange={setSkills} placeholder="Product, SaaS, Fundraising…"/>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-navy">What can you help others with?</label>
            <TagInput value={offered} onChange={setOffered} suggestions={HELP_TAG_SUGGESTIONS} placeholder="e.g. Hiring first engineers"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy">What do you need help with?</label>
            <TagInput value={needed} onChange={setNeeded} suggestions={HELP_TAG_SUGGESTIONS} placeholder="e.g. B2B marketing"/>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <div className="text-sm font-medium text-navy mb-2">Privacy</div>
            <label className="flex items-center gap-2 text-sm text-navy"><input type="checkbox" checked={showDir} onChange={(e)=>setShowDir(e.target.checked)}/> Show me in the directory</label>
            <label className="flex items-center gap-2 text-sm text-navy mt-1"><input type="checkbox" checked={showWA} onChange={(e)=>setShowWA(e.target.checked)}/> Let members message me on WhatsApp</label>
            <label className="flex items-center gap-2 text-sm text-navy mt-1"><input type="checkbox" checked={showEmail} onChange={(e)=>setShowEmail(e.target.checked)}/> Show my email to members</label>
          </div>
        </div>
      )}
    </WizardShell>
  );
}
```

- [ ] **Step 2: Add `/api/profile/me/route.ts`**

Create `app/api/profile/me/route.ts`:
```ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  const { data: skills } = await supabase.from('member_skills').select('skill_name').eq('user_id', user.id);
  const { data: help } = await supabase.from('help_tags').select('direction, tag').eq('user_id', user.id);
  return NextResponse.json({
    ok: true,
    profile,
    skills: (skills ?? []).map(s => s.skill_name),
    help_offered: (help ?? []).filter(h => h.direction === 'offered').map(h => h.tag),
    help_needed: (help ?? []).filter(h => h.direction === 'needed').map(h => h.tag),
  });
}
```

- [ ] **Step 3: Build & commit**

```bash
npm run build
git add bizcelona-app/app/\(protected\)/welcome bizcelona-app/app/api/profile
git commit -m "feat(welcome): post-approval 2-step onboarding + profile/me endpoint"
```

---

## Phase 4 — Directory + profile pages

### Task 4.1: Profile view components

**Files:** Create `components/profile/ProfileHero.tsx`, `components/profile/ProfileHelpCards.tsx`, `components/profile/SkillsGrid.tsx`, `components/profile/GreyedSection.tsx`, `components/profile/WhatsAppButton.tsx`

- [ ] **Step 1: Write `components/profile/WhatsAppButton.tsx`**

```tsx
export function WhatsAppButton({ number, name }: { number: string; name: string }) {
  const text = encodeURIComponent(`Hi ${name.split(' ')[0]}, I found you via Bizcelona.`);
  const clean = number.replace(/[^\d+]/g, '').replace(/^\+/, '');
  const href = `https://wa.me/${clean}?text=${text}`;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
       className="inline-flex items-center gap-2 px-4 py-2 bg-[#25d366] text-white rounded-md text-sm font-medium hover:brightness-110">
      <span>💬</span> Message on WhatsApp
    </a>
  );
}
```

- [ ] **Step 2: Write `components/profile/GreyedSection.tsx`**

```tsx
import { cn } from '@/lib/cn';
export function GreyedSection({ visible, children, overlay }: {
  visible: boolean; children: React.ReactNode; overlay?: React.ReactNode;
}) {
  if (visible) return <>{children}</>;
  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm grayscale opacity-60">{children}</div>
      {overlay && <div className="absolute inset-0 flex items-center justify-center">{overlay}</div>}
    </div>
  );
}
```

- [ ] **Step 3: Write `components/profile/ProfileHero.tsx`**

```tsx
import Link from 'next/link';
import { WhatsAppButton } from './WhatsAppButton';

export function ProfileHero({
  fullName, role, company, industry, headline, pictureUrl,
  linkedinUrl, whatsappNumber, showWhatsapp, isOwnProfile, signedIn,
}: {
  fullName: string; role: string | null; company: string | null; industry: string | null;
  headline: string | null; pictureUrl: string | null;
  linkedinUrl: string | null; whatsappNumber: string | null;
  showWhatsapp: boolean; isOwnProfile: boolean; signedIn: boolean;
}) {
  return (
    <div>
      <div className="h-28 bg-gradient-to-r from-navy to-navy/80"></div>
      <div className="px-6 pb-6 relative">
        <div className="absolute -top-10 left-6 w-20 h-20 rounded-full border-4 border-off-white overflow-hidden bg-gray-200">
          {pictureUrl ? <img src={pictureUrl} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full bg-gradient-to-br from-saffron to-navy"/>}
        </div>
        <div className="pt-12 flex flex-wrap justify-between items-start gap-3">
          <div>
            <h1 className="text-xl font-bold text-navy">{fullName}</h1>
            <div className="text-sm text-gray-600">
              {[role, company].filter(Boolean).join(' · ')}
              {industry && <span className="text-gray-400"> · {industry}</span>}
            </div>
          </div>
          <div className="flex gap-2">
            {isOwnProfile && (
              <Link href="/profile" className="px-3 py-2 text-sm border border-gray-300 rounded-md text-navy">Edit</Link>
            )}
            {signedIn && showWhatsapp && whatsappNumber && (
              <WhatsAppButton number={whatsappNumber} name={fullName} />
            )}
            {signedIn && linkedinUrl && (
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer"
                 className="px-3 py-2 bg-navy text-white text-sm rounded-md">LinkedIn</a>
            )}
          </div>
        </div>
        {headline && <p className="mt-3 text-sm text-navy">{headline}</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write `components/profile/ProfileHelpCards.tsx`**

```tsx
export function ProfileHelpCards({ offered, needed }: { offered: string[]; needed: string[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="text-xs font-semibold text-green-700 uppercase tracking-wider">Can help with</div>
        <div className="mt-2 flex flex-wrap gap-1">
          {offered.length === 0
            ? <span className="text-sm text-gray-500">—</span>
            : offered.map((t) => <span key={t} className="px-2 py-0.5 bg-white border border-green-200 rounded-full text-xs">{t}</span>)}
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Looking for help with</div>
        <div className="mt-2 flex flex-wrap gap-1">
          {needed.length === 0
            ? <span className="text-sm text-gray-500">—</span>
            : needed.map((t) => <span key={t} className="px-2 py-0.5 bg-white border border-amber-200 rounded-full text-xs">{t}</span>)}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Write `components/profile/SkillsGrid.tsx`**

```tsx
export function SkillsGrid({ skills }: { skills: string[] }) {
  if (skills.length === 0) return null;
  return (
    <div>
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Skills</div>
      <div className="mt-2 flex flex-wrap gap-1">
        {skills.map((s) => <span key={s} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-navy">{s}</span>)}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add bizcelona-app/components/profile
git commit -m "feat(profile): hero, help cards, skills grid, whatsapp button, greyed section"
```

---

### Task 4.2: Public profile page `/members/[slug]`

**Files:** Create `app/members/[slug]/page.tsx`

- [ ] **Step 1: Write it**

```tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { ProfileHelpCards } from '@/components/profile/ProfileHelpCards';
import { SkillsGrid } from '@/components/profile/SkillsGrid';
import { GreyedSection } from '@/components/profile/GreyedSection';

export default async function PublicProfilePage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Use the SECURITY INVOKER view for the anonymous photo lookup
  const { data: slugRow } = await supabase
    .from('public_profile_slugs')
    .select('id, slug, profile_picture_url')
    .eq('slug', slug)
    .maybeSingle();

  if (!slugRow) notFound();

  const signedIn = !!user;
  const isOwn = user?.id === slugRow.id;

  if (!signedIn) {
    // Public (signed-out) view — only photo is fully visible
    return (
      <div className="min-h-screen bg-off-white">
        <div className="max-w-3xl mx-auto py-10 px-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm relative">
            <GreyedSection
              visible={false}
              overlay={
                <Link href="/signup"
                      className="px-5 py-3 bg-saffron text-navy font-semibold rounded-md shadow-md">
                  Join Bizcelona to see this member's details
                </Link>
              }
            >
              <ProfileHero
                fullName="Bizcelona member" role="Role" company="Company" industry="Industry"
                headline="A short one-line intro goes here, so non-members see the shape without the substance."
                pictureUrl={null}
                linkedinUrl={null} whatsappNumber={null}
                showWhatsapp={false} isOwnProfile={false} signedIn={false}
              />
              <div className="p-6 space-y-5">
                <ProfileHelpCards offered={['Hidden tag', 'Hidden tag']} needed={['Hidden tag']} />
                <SkillsGrid skills={['Hidden','Hidden','Hidden']} />
              </div>
            </GreyedSection>
            {/* Photo layer that is NOT greyed, positioned over the greyed hero */}
            <div className="absolute left-6 top-[86px] w-20 h-20 rounded-full border-4 border-off-white overflow-hidden bg-gray-200">
              {slugRow.profile_picture_url
                ? <img src={slugRow.profile_picture_url} alt="" className="w-full h-full object-cover"/>
                : <div className="w-full h-full bg-gradient-to-br from-saffron to-navy"/>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Signed-in full view
  const [{ data: profile }, { data: member }, { data: skills }, { data: help }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', slugRow.id).maybeSingle(),
    supabase.from('members').select('status').eq('user_id', slugRow.id).maybeSingle(),
    supabase.from('member_skills').select('skill_name').eq('user_id', slugRow.id),
    supabase.from('help_tags').select('direction, tag').eq('user_id', slugRow.id),
  ]);

  if (!profile || member?.status !== 'approved' || !profile.show_in_directory) {
    // Only own approval-pending user can see their own pending profile
    if (!isOwn) notFound();
  }

  const offered = (help ?? []).filter(h => h.direction === 'offered').map(h => h.tag);
  const needed = (help ?? []).filter(h => h.direction === 'needed').map(h => h.tag);

  return (
    <div className="min-h-screen bg-off-white">
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <ProfileHero
            fullName={profile!.full_name ?? 'Member'}
            role={profile!.business_role}
            company={profile!.company}
            industry={profile!.industry}
            headline={profile!.headline}
            pictureUrl={profile!.profile_picture_url}
            linkedinUrl={profile!.linkedin_url}
            whatsappNumber={profile!.show_whatsapp ? profile!.whatsapp_number : null}
            showWhatsapp={profile!.show_whatsapp}
            isOwnProfile={isOwn}
            signedIn={true}
          />
          <div className="p-6 space-y-5">
            {profile!.bio && (
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">About</div>
                <p className="mt-2 text-sm text-navy whitespace-pre-wrap">{profile!.bio}</p>
              </div>
            )}
            <ProfileHelpCards offered={offered} needed={needed} />
            <SkillsGrid skills={(skills ?? []).map(s => s.skill_name)} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build & commit**

```bash
npm run build
git add bizcelona-app/app/members
git commit -m "feat(profile): public /members/[slug] page with greyed-out view for signed-out"
```

---

### Task 4.3: Directory row component + filters

**Files:** Create `components/directory/MemberRow.tsx`, `components/directory/DirectoryFilters.tsx`

- [ ] **Step 1: Write `components/directory/MemberRow.tsx`**

```tsx
import Link from 'next/link';
import { WhatsAppButton } from '@/components/profile/WhatsAppButton';

export type DirectoryMember = {
  id: string;
  slug: string;
  full_name: string;
  business_role: string | null;
  company: string | null;
  industry: string | null;
  headline: string | null;
  profile_picture_url: string | null;
  whatsapp_number: string | null;
  show_whatsapp: boolean;
  help_offered: string[];
  help_needed: string[];
};

export function MemberRow({ m }: { m: DirectoryMember }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex gap-4 items-start hover:border-saffron transition">
      <Link href={`/members/${m.slug}`} className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
        {m.profile_picture_url
          ? <img src={m.profile_picture_url} alt="" className="w-full h-full object-cover"/>
          : <div className="w-full h-full bg-gradient-to-br from-saffron to-navy"/>}
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline gap-3">
          <Link href={`/members/${m.slug}`} className="font-semibold text-navy hover:underline truncate">{m.full_name}</Link>
          {m.industry && <span className="text-xs text-gray-500 flex-shrink-0">{m.industry}</span>}
        </div>
        <div className="text-xs text-gray-600">{[m.business_role, m.company].filter(Boolean).join(' at ')}</div>
        {m.headline && <div className="text-xs text-navy mt-1 line-clamp-2">{m.headline}</div>}
        <div className="mt-2 flex flex-wrap gap-1">
          {m.help_offered.slice(0, 3).map((t) => (
            <span key={`o-${t}`} className="px-2 py-0.5 bg-green-50 border border-green-200 rounded-full text-[10px] text-green-700">Helps: {t}</span>
          ))}
          {m.help_needed.slice(0, 2).map((t) => (
            <span key={`n-${t}`} className="px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-full text-[10px] text-amber-700">Needs: {t}</span>
          ))}
        </div>
      </div>
      {m.show_whatsapp && m.whatsapp_number && (
        <div className="flex-shrink-0">
          <WhatsAppButton number={m.whatsapp_number} name={m.full_name} />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write `components/directory/DirectoryFilters.tsx`**

```tsx
'use client';
import { INDUSTRIES } from '@/lib/constants/industries';

export function DirectoryFilters({
  search, onSearch, selectedIndustries, onToggleIndustry,
  helpOffered, selectedOffered, onToggleOffered,
  helpNeeded, selectedNeeded, onToggleNeeded,
  counts,
}: {
  search: string; onSearch: (v: string) => void;
  selectedIndustries: string[]; onToggleIndustry: (i: string) => void;
  helpOffered: string[]; selectedOffered: string[]; onToggleOffered: (t: string) => void;
  helpNeeded: string[]; selectedNeeded: string[]; onToggleNeeded: (t: string) => void;
  counts: Record<string, number>;
}) {
  return (
    <aside className="space-y-5">
      <input
        type="search"
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        placeholder="Search name, skill, company…"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />
      <div>
        <div className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">Industry</div>
        <div className="mt-2 space-y-1 text-sm text-navy">
          {INDUSTRIES.map((i) => (
            <label key={i} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={selectedIndustries.includes(i)} onChange={() => onToggleIndustry(i)} />
              <span>{i}</span>
              <span className="text-xs text-gray-400 ml-auto">{counts[i] ?? 0}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">Can help with</div>
        <div className="mt-2 flex flex-wrap gap-1">
          {helpOffered.slice(0, 20).map((t) => (
            <button key={t}
              onClick={() => onToggleOffered(t)}
              className={`px-2 py-0.5 text-[11px] rounded-full border ${selectedOffered.includes(t) ? 'bg-green-600 text-white border-green-600' : 'bg-green-50 border-green-200 text-green-800'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">Looking for help with</div>
        <div className="mt-2 flex flex-wrap gap-1">
          {helpNeeded.slice(0, 20).map((t) => (
            <button key={t}
              onClick={() => onToggleNeeded(t)}
              className={`px-2 py-0.5 text-[11px] rounded-full border ${selectedNeeded.includes(t) ? 'bg-amber-600 text-white border-amber-600' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add bizcelona-app/components/directory
git commit -m "feat(directory): row + filters components"
```

---

### Task 4.4: Directory page `/members`

**Files:** Create `app/(protected)/members/page.tsx`, `app/(protected)/members/DirectoryClient.tsx`

- [ ] **Step 1: Server entry `app/(protected)/members/page.tsx`**

```tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DirectoryClient } from './DirectoryClient';
import type { DirectoryMember } from '@/components/directory/MemberRow';

export default async function DirectoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Approved + directory-visible profiles
  const { data: rows } = await supabase
    .from('profiles')
    .select(`
      id, slug, full_name, business_role, company, industry, headline,
      profile_picture_url, whatsapp_number, show_whatsapp,
      member_skills(skill_name),
      help_tags(direction, tag),
      members!inner(status)
    `)
    .eq('show_in_directory', true)
    .eq('members.status', 'approved')
    .order('full_name');

  const members: DirectoryMember[] = (rows ?? []).map((r: any) => ({
    id: r.id, slug: r.slug,
    full_name: r.full_name ?? 'Member',
    business_role: r.business_role,
    company: r.company,
    industry: r.industry,
    headline: r.headline,
    profile_picture_url: r.profile_picture_url,
    whatsapp_number: r.whatsapp_number,
    show_whatsapp: !!r.show_whatsapp,
    help_offered: (r.help_tags ?? []).filter((h: any) => h.direction === 'offered').map((h: any) => h.tag),
    help_needed: (r.help_tags ?? []).filter((h: any) => h.direction === 'needed').map((h: any) => h.tag),
  }));

  return <DirectoryClient members={members} />;
}
```

- [ ] **Step 2: Client `app/(protected)/members/DirectoryClient.tsx`**

```tsx
'use client';
import { useMemo, useState } from 'react';
import { MemberRow, type DirectoryMember } from '@/components/directory/MemberRow';
import { DirectoryFilters } from '@/components/directory/DirectoryFilters';

export function DirectoryClient({ members }: { members: DirectoryMember[] }) {
  const [search, setSearch] = useState('');
  const [industries, setIndustries] = useState<string[]>([]);
  const [offered, setOffered] = useState<string[]>([]);
  const [needed, setNeeded] = useState<string[]>([]);

  const allOffered = useMemo(() => {
    const s = new Set<string>(); members.forEach(m => m.help_offered.forEach(t => s.add(t))); return Array.from(s).sort();
  }, [members]);
  const allNeeded = useMemo(() => {
    const s = new Set<string>(); members.forEach(m => m.help_needed.forEach(t => s.add(t))); return Array.from(s).sort();
  }, [members]);

  const industryCounts = useMemo(() => {
    const c: Record<string, number> = {};
    members.forEach(m => { if (m.industry) c[m.industry] = (c[m.industry] ?? 0) + 1; });
    return c;
  }, [members]);

  const filtered = useMemo(() => members.filter((m) => {
    if (industries.length && !(m.industry && industries.includes(m.industry))) return false;
    if (offered.length && !offered.some(o => m.help_offered.includes(o))) return false;
    if (needed.length && !needed.some(n => m.help_needed.includes(n))) return false;
    if (search) {
      const s = search.toLowerCase();
      const hay = [m.full_name, m.business_role, m.company, m.headline, ...m.help_offered, ...m.help_needed]
        .filter(Boolean).join(' ').toLowerCase();
      if (!hay.includes(s)) return false;
    }
    return true;
  }), [members, industries, offered, needed, search]);

  function toggle(list: string[], setList: (v: string[]) => void, val: string) {
    setList(list.includes(val) ? list.filter(v => v !== val) : [...list, val]);
  }

  return (
    <div className="min-h-screen bg-off-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-navy">Members</h1>
        <p className="text-sm text-gray-600">Find someone to ask for help.</p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
          <DirectoryFilters
            search={search} onSearch={setSearch}
            selectedIndustries={industries} onToggleIndustry={(i) => toggle(industries, setIndustries, i)}
            helpOffered={allOffered} selectedOffered={offered} onToggleOffered={(t) => toggle(offered, setOffered, t)}
            helpNeeded={allNeeded} selectedNeeded={needed} onToggleNeeded={(t) => toggle(needed, setNeeded, t)}
            counts={industryCounts}
          />
          <div>
            <div className="text-xs text-gray-500 mb-2">{filtered.length} of {members.length} members</div>
            <div className="space-y-2">
              {filtered.map((m) => <MemberRow key={m.id} m={m}/>)}
              {filtered.length === 0 && <div className="text-sm text-gray-500 italic p-6">No members match these filters.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Build & commit**

```bash
npm run build
git add bizcelona-app/app/\(protected\)/members
git commit -m "feat(directory): /members list with filters and WhatsApp quick-contact"
```

---

### Task 4.5: Self-edit profile page `/profile`

**Files:** Create `app/(protected)/profile/page.tsx`

- [ ] **Step 1: Write it** — a single-page edit form reusing the welcome structure but without the step shell.

```tsx
'use client';
import { useEffect, useState } from 'react';
import { TagInput } from '@/components/ui/TagInput';
import { HELP_TAG_SUGGESTIONS } from '@/lib/constants/help-tags';
import { INDUSTRIES } from '@/lib/constants/industries';

export default function ProfileEditPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    full_name: '', company: '', business_role: '', industry: '', headline: '',
    bio: '', whatsapp_number: '', linkedin_url: '',
    profile_picture_url: '' as string | null,
    show_whatsapp: true, show_email: false, show_in_directory: true,
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [offered, setOffered] = useState<string[]>([]);
  const [needed, setNeeded] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/profile/me'); const j = await r.json();
      if (j.ok) {
        setProfile((p) => ({
          ...p,
          full_name: j.profile?.full_name ?? '',
          company: j.profile?.company ?? '',
          business_role: j.profile?.business_role ?? '',
          industry: j.profile?.industry ?? '',
          headline: j.profile?.headline ?? '',
          bio: j.profile?.bio ?? '',
          whatsapp_number: j.profile?.whatsapp_number ?? '',
          linkedin_url: j.profile?.linkedin_url ?? '',
          profile_picture_url: j.profile?.profile_picture_url ?? null,
          show_whatsapp: j.profile?.show_whatsapp ?? true,
          show_email: j.profile?.show_email ?? false,
          show_in_directory: j.profile?.show_in_directory ?? true,
        }));
        setSkills(j.skills ?? []);
        setOffered(j.help_offered ?? []);
        setNeeded(j.help_needed ?? []);
      }
      setLoading(false);
    })();
  }, []);

  async function uploadAvatar(file: File) {
    const fd = new FormData(); fd.append('file', file);
    const r = await fetch('/api/profile/avatar', { method: 'POST', body: fd });
    const j = await r.json();
    if (j.ok) setProfile((p) => ({ ...p, profile_picture_url: j.url }));
  }

  async function save() {
    setSaving(true); setMsg(null);
    const res = await fetch('/api/profile/update', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ profile, skills, help_offered: offered, help_needed: needed }),
    });
    const j = await res.json();
    setSaving(false);
    setMsg(j.ok ? 'Saved.' : (j.error ?? 'Error saving'));
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;

  return (
    <div className="min-h-screen bg-off-white py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-navy">Your profile</h1>
        <p className="text-sm text-gray-600 mt-1">What other members see.</p>

        <div className="mt-6 flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
            {profile.profile_picture_url
              ? <img src={profile.profile_picture_url} alt="" className="w-full h-full object-cover"/>
              : <div className="w-full h-full bg-gradient-to-br from-saffron to-navy"/>}
          </div>
          <label className="inline-block px-3 py-2 text-sm border border-gray-300 rounded-md cursor-pointer hover:bg-beige">
            Change photo
            <input type="file" className="hidden" accept="image/png,image/jpeg,image/webp"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }} />
          </label>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Field label="Full name" value={profile.full_name} set={(v) => setProfile({ ...profile, full_name: v })}/>
          <Field label="Role" value={profile.business_role} set={(v) => setProfile({ ...profile, business_role: v })}/>
          <Field label="Company" value={profile.company} set={(v) => setProfile({ ...profile, company: v })}/>
          <div>
            <label className="block text-sm font-medium text-navy">Industry</label>
            <select className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
              value={profile.industry} onChange={(e) => setProfile({ ...profile, industry: e.target.value })}>
              <option value="">Pick one…</option>
              {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-navy">Headline</label>
          <input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={profile.headline} onChange={(e) => setProfile({ ...profile, headline: e.target.value })}/>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-navy">Bio</label>
          <textarea rows={4} maxLength={500} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })}/>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Field label="LinkedIn URL" value={profile.linkedin_url} set={(v) => setProfile({ ...profile, linkedin_url: v })}/>
          <Field label="WhatsApp" value={profile.whatsapp_number} set={(v) => setProfile({ ...profile, whatsapp_number: v })}/>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-navy">Skills</label>
          <TagInput value={skills} onChange={setSkills} />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-navy">Can help with</label>
          <TagInput value={offered} onChange={setOffered} suggestions={HELP_TAG_SUGGESTIONS}/>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-navy">Looking for help with</label>
          <TagInput value={needed} onChange={setNeeded} suggestions={HELP_TAG_SUGGESTIONS}/>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm font-medium text-navy mb-2">Privacy</div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={profile.show_in_directory} onChange={(e) => setProfile({ ...profile, show_in_directory: e.target.checked })}/> Show me in the directory</label>
          <label className="flex items-center gap-2 text-sm mt-1"><input type="checkbox" checked={profile.show_whatsapp} onChange={(e) => setProfile({ ...profile, show_whatsapp: e.target.checked })}/> Let members message me on WhatsApp</label>
          <label className="flex items-center gap-2 text-sm mt-1"><input type="checkbox" checked={profile.show_email} onChange={(e) => setProfile({ ...profile, show_email: e.target.checked })}/> Show my email to members</label>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button type="button" disabled={saving}
            onClick={save}
            className="px-5 py-2 bg-saffron text-navy font-semibold rounded-md disabled:opacity-40">
            {saving ? 'Saving…' : 'Save'}
          </button>
          {msg && <span className="text-sm text-gray-600">{msg}</span>}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, set }: { label: string; value: string; set: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-navy">{label}</label>
      <input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        value={value} onChange={(e) => set(e.target.value)} />
    </div>
  );
}
```

- [ ] **Step 2: Add `/api/profile/update/route.ts`**

```ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const schema = z.object({
  profile: z.object({
    full_name: z.string().min(2).max(120),
    company: z.string().max(120),
    business_role: z.string().max(120),
    industry: z.string(),
    headline: z.string().max(200),
    bio: z.string().max(500),
    whatsapp_number: z.string().max(32),
    linkedin_url: z.string().url().or(z.literal('')),
    show_whatsapp: z.boolean(),
    show_email: z.boolean(),
    show_in_directory: z.boolean(),
  }),
  skills: z.array(z.string().min(1)).max(20),
  help_offered: z.array(z.string().min(1)).max(20),
  help_needed: z.array(z.string().min(1)).max(20),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Not signed in' }, { status: 401 });

  const { profile, skills, help_offered, help_needed } = parsed.data;
  const { error: e1 } = await supabase.from('profiles').update(profile).eq('id', user.id);
  if (e1) return NextResponse.json({ ok: false, error: e1.message }, { status: 500 });

  await supabase.from('member_skills').delete().eq('user_id', user.id);
  if (skills.length) await supabase.from('member_skills').insert(skills.map((s) => ({ user_id: user.id, skill_name: s })));

  await supabase.from('help_tags').delete().eq('user_id', user.id);
  const rows = [
    ...help_offered.map((t) => ({ user_id: user.id, direction: 'offered' as const, tag: t })),
    ...help_needed.map((t) => ({ user_id: user.id, direction: 'needed' as const, tag: t })),
  ];
  if (rows.length) await supabase.from('help_tags').insert(rows);

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Build & commit**

```bash
npm run build
git add bizcelona-app/app/\(protected\)/profile bizcelona-app/app/api/profile/update
git commit -m "feat(profile): self-edit page + update endpoint"
```

---

## Phase 5 — Admin additions

### Task 5.1: Admin layout helper

**Files:** Create `app/(admin)/admin/AdminNav.tsx`

- [ ] **Step 1: Write it**

```tsx
import Link from 'next/link';

export function AdminNav({ active }: { active: 'home' | 'applications' | 'members' | 'activity' | 'whatsapp' }) {
  const tab = (k: string, href: string, label: string) => (
    <Link key={k} href={href}
      className={`px-3 py-2 text-sm rounded-md ${active === k ? 'bg-navy text-white' : 'text-navy hover:bg-beige'}`}>
      {label}
    </Link>
  );
  return (
    <nav className="flex gap-2 mb-6">
      {tab('home', '/admin', 'Home')}
      {tab('applications', '/admin/applications', 'Applications')}
      {tab('members', '/admin/members', 'Members')}
      {tab('activity', '/admin/activity', 'Activity')}
      {tab('whatsapp', '/admin/whatsapp-links', 'WhatsApp links')}
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add bizcelona-app/app/\(admin\)/admin/AdminNav.tsx
git commit -m "feat(admin): top nav"
```

---

### Task 5.2: Admin `/admin/applications` — bulk + inline LinkedIn

**Files:** Modify `app/(admin)/admin/applications/` (existing). Add server actions.

- [ ] **Step 1: Verify existing path**

```bash
ls 'bizcelona-app/app/(admin)/admin/applications'
```
You should see a `page.tsx` and likely an `[id]` detail. If the existing list page doesn't show LinkedIn/contributor inline, add them.

- [ ] **Step 2: Create approve/reject endpoints**

`app/api/admin/applications/[id]/approve/route.ts`:
```ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isUserAdmin } from '@/lib/admin';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await isUserAdmin())) return NextResponse.json({ ok: false }, { status: 403 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const { error } = await supabase.rpc('approve_application', {
    p_application_id: id, p_reviewer_id: user.id, p_notes: null,
  });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  // Fire the approval email (best effort)
  fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/application-approved`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ application_id: id }),
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
```

`app/api/admin/applications/[id]/reject/route.ts`:
```ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isUserAdmin } from '@/lib/admin';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await isUserAdmin())) return NextResponse.json({ ok: false }, { status: 403 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  let notes: string | null = null;
  try { const b = await req.json(); notes = b?.notes ?? null; } catch {}
  const { error } = await supabase.rpc('reject_application', {
    p_application_id: id, p_reviewer_id: user.id, p_notes: notes,
  });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Update the applications list page to surface new fields + add bulk**

Modify `app/(admin)/admin/applications/page.tsx` to:
- `select('id, full_name, email, company, business_role, industry, linkedin_url, contributor_interest, status, created_at')`
- Render a table row per application with the new columns + checkboxes + a floating bulk-action bar.

Because this file already exists and the plan shouldn't rewrite it fully, the implementing agent should:
1. Read current contents (`cat ...`).
2. Add columns for LinkedIn (clickable icon) and Contributor (green badge "Yes" / grey "No").
3. Add a client-side bulk-action bar wired to POST the two new endpoints sequentially.

If the existing list is server-rendered Server Component, extract the table into a new `ApplicationsTable.tsx` client component that receives the rows as a prop.

- [ ] **Step 4: Commit**

```bash
git add bizcelona-app/app/api/admin bizcelona-app/app/\(admin\)/admin/applications
git commit -m "feat(admin): approve/reject endpoints + inline LinkedIn + bulk actions on applications list"
```

---

### Task 5.3: Admin `/admin/members`

**Files:** Create `app/(admin)/admin/members/page.tsx`

- [ ] **Step 1: Write it**

```tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isUserAdmin } from '@/lib/admin';
import { AdminNav } from '../AdminNav';

export default async function AdminMembersPage() {
  if (!(await isUserAdmin())) redirect('/dashboard');
  const supabase = await createClient();

  const { data } = await supabase
    .from('profiles')
    .select('id, slug, full_name, email, company, business_role, industry, onboarding_completed_at, members!inner(status)')
    .order('full_name');

  return (
    <div className="min-h-screen bg-beige">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <AdminNav active="members"/>
        <h1 className="text-2xl font-bold text-navy">Members</h1>
        <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-beige text-left">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Company / role</th>
                <th className="px-4 py-2">Industry</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Onboarded</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((m: any) => (
                <tr key={m.id} className="border-t border-gray-100">
                  <td className="px-4 py-2">
                    <div className="font-medium text-navy">{m.full_name ?? '—'}</div>
                    <div className="text-xs text-gray-500">{m.email}</div>
                  </td>
                  <td className="px-4 py-2">{[m.business_role, m.company].filter(Boolean).join(' at ') || '—'}</td>
                  <td className="px-4 py-2">{m.industry ?? '—'}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${m.members?.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                      {m.members?.status ?? 'none'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500">{m.onboarding_completed_at ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-2 text-right">
                    {m.slug && <Link href={`/members/${m.slug}`} className="text-saffron text-sm underline">View</Link>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add bizcelona-app/app/\(admin\)/admin/members
git commit -m "feat(admin): members list page"
```

---

### Task 5.4: Admin `/admin/activity`

**Files:** Create `app/(admin)/admin/activity/page.tsx`

- [ ] **Step 1: Write it**

```tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isUserAdmin } from '@/lib/admin';
import { AdminNav } from '../AdminNav';

export default async function ActivityPage({
  searchParams,
}: { searchParams: Promise<{ page?: string }> }) {
  if (!(await isUserAdmin())) redirect('/dashboard');
  const supabase = await createClient();
  const { page } = await searchParams;
  const p = Math.max(1, parseInt(page ?? '1', 10) || 1);
  const pageSize = 50;

  const { data, count } = await supabase
    .from('activity_logs')
    .select('id, action, resource_type, resource_id, metadata, created_at, user_id, profiles:profiles!activity_logs_user_id_fkey(full_name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((p - 1) * pageSize, p * pageSize - 1);

  return (
    <div className="min-h-screen bg-beige">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <AdminNav active="activity"/>
        <h1 className="text-2xl font-bold text-navy">Activity log</h1>
        <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-beige text-left">
              <tr>
                <th className="px-4 py-2">When</th>
                <th className="px-4 py-2">Who</th>
                <th className="px-4 py-2">Action</th>
                <th className="px-4 py-2">Resource</th>
                <th className="px-4 py-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((row: any) => (
                <tr key={row.id} className="border-t border-gray-100 align-top">
                  <td className="px-4 py-2 text-xs text-gray-500">{new Date(row.created_at).toLocaleString('en-GB')}</td>
                  <td className="px-4 py-2">{row.profiles?.full_name ?? row.user_id ?? '—'}</td>
                  <td className="px-4 py-2 font-mono text-xs">{row.action}</td>
                  <td className="px-4 py-2 text-xs">{row.resource_type} {row.resource_id && <code>{row.resource_id.slice(0,8)}</code>}</td>
                  <td className="px-4 py-2 text-xs text-gray-600">{row.metadata ? JSON.stringify(row.metadata) : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-between text-sm">
          <a href={`?page=${Math.max(1, p - 1)}`} className="text-navy underline">← Prev</a>
          <div className="text-gray-500">{((p - 1) * pageSize) + 1}–{Math.min(p * pageSize, count ?? 0)} of {count ?? 0}</div>
          <a href={`?page=${p + 1}`} className="text-navy underline">Next →</a>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add bizcelona-app/app/\(admin\)/admin/activity
git commit -m "feat(admin): activity log viewer"
```

---

### Task 5.5: Admin `/admin/whatsapp-links` CRUD

**Files:** Create `app/(admin)/admin/whatsapp-links/page.tsx`, `app/api/admin/whatsapp-links/route.ts`, `app/api/admin/whatsapp-links/[id]/route.ts`

- [ ] **Step 1: Server API — list + create**

`app/api/admin/whatsapp-links/route.ts`:
```ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isUserAdmin } from '@/lib/admin';
import { z } from 'zod';

const createSchema = z.object({
  group_name: z.string().min(1).max(120),
  public_url: z.string().min(1).max(200),
  actual_whatsapp_url: z.string().url(),
  is_active: z.boolean().default(true),
});

export async function GET() {
  if (!(await isUserAdmin())) return NextResponse.json({ ok: false }, { status: 403 });
  const supabase = await createClient();
  const { data } = await supabase.from('whatsapp_links').select('*').order('created_at', { ascending: false });
  return NextResponse.json({ ok: true, data });
}

export async function POST(req: Request) {
  if (!(await isUserAdmin())) return NextResponse.json({ ok: false }, { status: 403 });
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message }, { status: 400 });
  const supabase = await createClient();
  const { error } = await supabase.from('whatsapp_links').insert(parsed.data);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Server API — update + delete**

`app/api/admin/whatsapp-links/[id]/route.ts`:
```ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isUserAdmin } from '@/lib/admin';
import { z } from 'zod';

const patchSchema = z.object({
  group_name: z.string().min(1).max(120).optional(),
  public_url: z.string().min(1).max(200).optional(),
  actual_whatsapp_url: z.string().url().optional(),
  is_active: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isUserAdmin())) return NextResponse.json({ ok: false }, { status: 403 });
  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message }, { status: 400 });
  const supabase = await createClient();
  const { error } = await supabase.from('whatsapp_links').update(parsed.data).eq('id', id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isUserAdmin())) return NextResponse.json({ ok: false }, { status: 403 });
  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase.from('whatsapp_links').delete().eq('id', id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: UI page**

`app/(admin)/admin/whatsapp-links/page.tsx`:
```tsx
'use client';
import { useEffect, useState } from 'react';
import { AdminNav } from '../AdminNav';

type Link = { id: string; group_name: string; public_url: string; actual_whatsapp_url: string; is_active: boolean };

export default function WhatsAppLinksPage() {
  const [rows, setRows] = useState<Link[]>([]);
  const [form, setForm] = useState({ group_name: '', public_url: '', actual_whatsapp_url: '', is_active: true });
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const r = await fetch('/api/admin/whatsapp-links'); const j = await r.json();
    if (j.ok) setRows(j.data);
  }
  useEffect(() => { load(); }, []);

  async function create() {
    setMsg(null);
    const r = await fetch('/api/admin/whatsapp-links', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form),
    });
    const j = await r.json();
    if (!j.ok) { setMsg(j.error ?? 'Error'); return; }
    setForm({ group_name: '', public_url: '', actual_whatsapp_url: '', is_active: true });
    load();
  }

  async function toggle(id: string, is_active: boolean) {
    await fetch(`/api/admin/whatsapp-links/${id}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ is_active }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this link?')) return;
    await fetch(`/api/admin/whatsapp-links/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="min-h-screen bg-beige">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <AdminNav active="whatsapp"/>
        <h1 className="text-2xl font-bold text-navy">WhatsApp links</h1>

        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-navy">Add link</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <input placeholder="Group name" className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.group_name} onChange={(e) => setForm({ ...form, group_name: e.target.value })}/>
            <input placeholder="Public URL segment (e.g. founders)" className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.public_url} onChange={(e) => setForm({ ...form, public_url: e.target.value })}/>
            <input placeholder="Actual chat.whatsapp.com URL" className="rounded-md border border-gray-300 px-3 py-2 text-sm col-span-2" value={form.actual_whatsapp_url} onChange={(e) => setForm({ ...form, actual_whatsapp_url: e.target.value })}/>
          </div>
          <div className="mt-3 flex gap-3 items-center">
            <button onClick={create} className="px-4 py-2 bg-saffron text-navy font-semibold rounded-md text-sm">Add</button>
            {msg && <span className="text-sm text-red-600">{msg}</span>}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-beige text-left">
              <tr><th className="px-4 py-2">Group</th><th className="px-4 py-2">Public URL</th><th className="px-4 py-2">Target</th><th className="px-4 py-2">Active</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="px-4 py-2">{r.group_name}</td>
                  <td className="px-4 py-2 font-mono text-xs">/{r.public_url}</td>
                  <td className="px-4 py-2 text-xs text-gray-500 truncate max-w-xs">{r.actual_whatsapp_url}</td>
                  <td className="px-4 py-2"><input type="checkbox" checked={r.is_active} onChange={(e) => toggle(r.id, e.target.checked)}/></td>
                  <td className="px-4 py-2 text-right"><button onClick={() => remove(r.id)} className="text-red-600 text-xs underline">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add bizcelona-app/app/api/admin/whatsapp-links bizcelona-app/app/\(admin\)/admin/whatsapp-links
git commit -m "feat(admin): WhatsApp links CRUD"
```

---

### Task 5.6: Add AdminNav to existing admin pages

**Files:** Modify `app/(admin)/admin/page.tsx`, `app/(admin)/admin/applications/page.tsx`

- [ ] **Step 1: Import and insert nav**

In both files, import `AdminNav` and render `<AdminNav active="home"/>` (or `"applications"`) just inside the page root `<div>`.

- [ ] **Step 2: Build & commit**

```bash
npm run build
git add bizcelona-app/app/\(admin\)
git commit -m "feat(admin): consistent nav across admin pages"
```

---

## Phase 6 — Cleanup & rollout

### Task 6.1: Remove old `/apply` route

**Files:** Delete `app/(protected)/apply/`

- [ ] **Step 1: Confirm wizard fully covers what `/apply` did**

Manual verification: full wizard run-through on `/signup` matches the fields `/apply` used to collect. Already done in Task 2.8 smoke.

- [ ] **Step 2: Add a 308 redirect for bookmarked links**

Create `app/(protected)/apply/page.tsx`:
```tsx
import { redirect, permanentRedirect } from 'next/navigation';
export default function ApplyRedirect() {
  permanentRedirect('/signup');
}
```

Delete the backup files:
```bash
rm 'bizcelona-app/app/(protected)/apply/page_backup.tsx' \
   'bizcelona-app/app/(protected)/apply/page_updated.tsx'
```

- [ ] **Step 3: Commit**

```bash
git add bizcelona-app/app/\(protected\)/apply
git commit -m "chore(apply): redirect legacy /apply to /signup and drop backup files"
```

---

### Task 6.2: Update `vercel.json` matcher check

**Files:** Inspect `vercel.json`

- [ ] **Step 1: Sanity read**

```bash
cat bizcelona-app/vercel.json
```

If cron paths `/api/cron/keep-alive` and `/api/cron/application-reminder` exist — leave them. No change needed.

- [ ] **Step 2: No commit unless edits**

---

### Task 6.3: Sign off with a full smoke

- [ ] **Step 1: Deploy preview**

```bash
cd bizcelona-app && vercel
```
(Use the interactive CLI to push to a preview URL; don't deploy to production yet.)

- [ ] **Step 2: Walk the four flows on the preview URL**

1. New-user signup → wizard → dashboard (pending).
2. Admin approve → approval email → new member lands on `/welcome` on next login.
3. Complete welcome → `/dashboard` shows full home → `/members` directory populated.
4. Open `/members/[slug]` logged out → only photo is visible, rest greyed.

- [ ] **Step 3: Promote to production**

When the preview looks right:
```bash
vercel --prod
```

- [ ] **Step 4: Tag a release**

```bash
git tag v1.1.0-onboarding-directory
```

---

## Self-review checklist

- [x] Spec §"User flows" Flow 1 → Tasks 2.1–2.7, 2.8 smoke.
- [x] Spec §Flow 2 → Tasks 5.2 (approve/reject endpoints), 3.1–3.5 (welcome).
- [x] Spec §Flow 3 → Tasks 4.3–4.4.
- [x] Spec §Flow 4 → Task 4.2.
- [x] Spec §"Data model" → Task 1.1 (migration), 1.2 (apply + types), 1.3 (bucket).
- [x] Spec §Architecture routing gates → Task 2.6 (middleware).
- [x] Spec §Architecture components → Tasks 2.2, 2.4, 3.2, 4.1, 4.3, 5.1, 5.5.
- [x] Spec §Error handling (approve SQL function, `{ ok, error }` shape) → Task 1.1 + 5.2.
- [x] Spec §Notifications (approve email triggered) → Task 5.2 Step 2.
- [x] Spec §Rollout → Phases 1–6 mirror the rollout list.
- [x] Admin additions all accounted for (Tasks 5.1–5.6).
- [x] Delete legacy `/apply` → Task 6.1.

No placeholders found. Type consistency: `DirectoryMember` shared between 4.3 server and 4.3 client; wizard state is a single inline `State` type; `welcomeSchema` shared between 3.4 endpoint and 3.5 UI; approve/reject Postgres functions called from 5.2. Names are consistent.
