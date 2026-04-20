# Bizcelona — Onboarding, Profiles & Member Directory

**Date:** 2026-04-19
**Status:** Design approved, plan pending

## Overview

Overhaul the Bizcelona member experience end-to-end. Replace the current "signup → verify → Under Construction dashboard → standalone /apply form" split with a single unified join wizard, a polished member profile page, a searchable member directory with WhatsApp contact, and a beefed-up admin surface.

## Goals

1. One coherent joining experience from first click to "you're in the community" — no drop-offs for email verification mid-flow.
2. Every approved member has a complete, useful profile that other members can discover and contact.
3. Directory is the core utility: members can find the right person to ask for help in under 30 seconds.
4. Admin can review applications, manage members, and maintain WhatsApp group links without SQL.

## Non-goals (this round)

- In-app messaging (WhatsApp remains the contact channel).
- Paid tiers / subscriptions.
- Posts/blog admin UI (schema exists, surface is future work).
- A public "browse all members" marketing page (profiles render publicly-greyed, but the aggregated public directory is phase 2).

## User flows

### Flow 1 — New user joins

1. Lands on marketing site, clicks "Apply to join" → `/signup`.
2. **Unified wizard** (5 steps) on one URL with client-side step navigation:
   - **Step 1 Account.** Email, password, full name. On "Next" we call `supabase.auth.signUp()` — account is created immediately, unconfirmed, and the verification email is sent. Steps 2–5 are now authenticated.
   - **Step 2 About you.** Company, role/job title, industry (dropdown, controlled vocabulary), one-line intro ("What do you do?").
   - **Step 3 Intentions.** What you hope to get, what you hope to bring (give-first prompt), contributor interest (Yes/No).
   - **Step 4 Socials & source.** LinkedIn URL (required), WhatsApp number with country code (required), how you heard about us (required), anything else (optional long text).
   - **Step 5 Consent & submit.** Five individual consent checkboxes (guidelines / privacy / contact / selective accept / directory sharing). All must be ticked. Submit writes the `applications` row and fires `/api/notifications/new-application` to admins.
3. Redirect to `/dashboard` which renders the **pending-review state**: thank-you message, greyed-out directory teaser, email-verification banner (with resend CTA) if unconfirmed.
4. If the user abandons mid-wizard, their partial data is persisted per step (client-side in localStorage; server-side only after Step 1 which creates the account). Returning to `/signup` resumes at the last step; returning to `/apply` after Step 1 completes is the same wizard scoped to the authenticated user.

### Flow 2 — Admin approves

1. Admin opens `/admin/applications`, reviews a submission (LinkedIn, bio, contributor flag all inline), clicks Approve.
2. Server action updates `applications.status = 'approved'`, creates/updates the `members` row with `status = 'approved'`, fires `/api/notifications/application-approved`.
3. On the new member's next login, middleware detects `members.status = 'approved'` AND `profiles.onboarding_completed_at IS NULL` and redirects to `/welcome` — the **post-approval onboarding**:
   - **Step A Profile polish.** Upload photo (Supabase Storage bucket `profile-pictures`), expand bio, add skills (tag input, min 3 max 10), add industry tags.
   - **Step B Help & privacy.** "What I can help with" (tag input), "What I need help with" (tag input), WhatsApp-visible toggle, email-visible toggle, show-in-directory toggle (default on).
4. Completing Step B sets `profiles.onboarding_completed_at = now()` and redirects to `/dashboard` which now renders the full member home (own profile summary + directory link + recent joins).

### Flow 3 — Member uses the directory

1. `/members` renders the **rich-list directory**: left-rail filters (industry checkboxes, "can help with" tag chips, "looking for help" tag chips, free-text search) and a scrolling list of member rows.
2. Each row: photo, name, role + company, industry badge, bio snippet, two pill rows (green "Helps: …", amber "Needs: …"), one-tap WhatsApp button on the right.
3. Click a row → `/members/[slug]` — full **hero-led profile page**: banner + overlapping photo, name/role/company/industry header, contact buttons (WhatsApp green, LinkedIn navy), bio, Can-Help / Looking-For coloured cards, full skills grid.
4. WhatsApp button opens `https://wa.me/<number>?text=Hi <name>, I found you via Bizcelona.` — no intermediate redirect for member-to-member contact.

### Flow 4 — Public profile view

1. Logged-out or non-member viewer hits `/members/[slug]` (e.g. from a shared link).
2. **Only the profile photo is visible in full.** Everything else — name, role, company, industry, headline, bio, skills, help-offered, help-needed, LinkedIn, WhatsApp button — renders as **greyed placeholders** with a shared "Join Bizcelona to see this member's details" overlay linking to `/signup`. The only unblurred page metadata is the photo and the `<title>` on the browser tab, which uses the first name only to avoid leaking full names in shared-link previews.
3. `/members` index is members-only (redirect to `/login`).

## Data model

All changes land as new migrations. Never edit existing migrations.

### Source-of-truth split

- **`profiles`** holds the living record — current values, editable by the member post-approval. Everything the directory and profile pages read comes from here.
- **`applications`** is the immutable snapshot of what the applicant submitted at review time. Admins read this to approve/reject; members cannot edit it after submission. Status/review metadata on this row is the only thing that changes.
- The wizard writes to **both** in a single server action: profile fields (`company`, `business_role`, `industry`, `headline`, `linkedin_url`, `whatsapp_number`, `full_name`) go to `profiles`; the full set of application answers (including a copy of those fields plus `hopes_to_get`, `hopes_to_bring`, `contributor_interest`, `heard_from`, `additional_info`, consent items) goes to `applications`.
- Post-approval onboarding writes only to `profiles` (photo, bio, skills, help tags, privacy toggles).

### New migration `00009_onboarding_and_directory.sql`

**`profiles` additions:**
```sql
ALTER TABLE profiles
  ADD COLUMN slug TEXT UNIQUE,                       -- URL-safe, generated from full_name + suffix
  ADD COLUMN onboarding_completed_at TIMESTAMPTZ,    -- gate into full dashboard
  ADD COLUMN industry TEXT,                          -- moved from applications for directory filtering
  ADD COLUMN headline TEXT;                          -- the "one-line intro", shown under name everywhere
```

**`applications` additions (individual consent tracking):**
```sql
ALTER TABLE applications
  ADD COLUMN consent_guidelines BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN consent_privacy BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN consent_contact BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN consent_selective BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN consent_directory BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN hopes_to_get TEXT,
  ADD COLUMN hopes_to_bring TEXT,
  ADD COLUMN contributor_interest BOOLEAN,
  ADD COLUMN heard_from TEXT,
  ADD COLUMN linkedin_url TEXT,
  ADD COLUMN additional_info TEXT,
  ADD COLUMN industry TEXT;
-- Keep existing `consent_given` column as a derived convenience (trigger: true when all 5 individual consents are true).
```

**New table `help_tags`:**
```sql
CREATE TABLE help_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('offered','needed')),
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, direction, tag)
);
CREATE INDEX idx_help_tags_user_id ON help_tags(user_id);
CREATE INDEX idx_help_tags_direction_tag ON help_tags(direction, tag);
```
Replaces the less-structured `member_help_requests` for directory filtering. `member_help_requests` stays (free-text longer-form requests) but is not used by the directory MVP.

**Slug generator + uniqueness:**
- Trigger on `profiles` insert/update fills `slug` from `full_name` (lowercase, ASCII-fold, hyphenated) with numeric suffix on collision.

**Storage:**
- New Supabase Storage bucket `profile-pictures`, public-read, authenticated-write, 2 MB size limit, `image/*` only. RLS: owner can upload/update/delete their own path `{user_id}.*`.

**RLS updates (added in migration):**
- `help_tags`: select by any authenticated user if target profile's `show_in_directory = true` AND corresponding `members.status = 'approved'`; insert/update/delete only by owner.
- `profiles.slug`: readable publicly (needed for unauth `/members/[slug]`), other columns remain per existing policy.

### Existing tables — no schema change

`members`, `admins`, `member_skills`, `whatsapp_links`, `activity_logs`, `posts` stay as-is. Member skills continue to use `member_skills`.

## Architecture

### Directory structure (new/changed)

```
bizcelona-app/
├── app/
│   ├── (auth)/signup/
│   │   └── page.tsx                        # REPLACED → unified wizard, client component
│   ├── (protected)/
│   │   ├── dashboard/page.tsx              # REWRITE → pending vs approved vs onboarding-needed states
│   │   ├── welcome/                        # NEW — post-approval 2-step onboarding
│   │   │   └── page.tsx
│   │   ├── members/                        # NEW — directory (members-only)
│   │   │   └── page.tsx
│   │   ├── profile/                        # NEW — self-edit
│   │   │   └── page.tsx
│   │   └── apply/                          # DELETED (merged into /signup wizard)
│   ├── members/                            # NEW — public profile pages
│   │   └── [slug]/page.tsx
│   ├── (admin)/admin/
│   │   ├── page.tsx                        # KEEP + add cards linking to new sub-pages
│   │   ├── applications/                   # KEEP existing, add bulk actions + inline LinkedIn
│   │   ├── members/                        # NEW — member list + quick actions
│   │   │   └── page.tsx
│   │   ├── activity/                       # NEW — activity log viewer
│   │   │   └── page.tsx
│   │   └── whatsapp-links/                 # NEW — CRUD for whatsapp_links
│   │       └── page.tsx
│   └── api/
│       ├── signup/route.ts                 # NEW — server action wrapper for step-by-step writes
│       ├── application/submit/route.ts     # NEW — validates + writes application + notifies admins
│       ├── onboarding/complete/route.ts    # NEW — writes profile polish + help tags + onboarding_completed_at
│       ├── admin/applications/[id]/approve/route.ts   # NEW — transactional approve
│       └── admin/applications/[id]/reject/route.ts    # NEW — transactional reject
├── components/
│   ├── wizard/                             # NEW — reusable stepper, form state, progress bar
│   │   ├── Wizard.tsx
│   │   ├── WizardStep.tsx
│   │   ├── WizardProgress.tsx
│   │   └── hooks/useWizardState.ts
│   ├── directory/                          # NEW
│   │   ├── MemberRow.tsx
│   │   ├── DirectoryFilters.tsx
│   │   └── WhatsAppButton.tsx
│   ├── profile/                            # NEW
│   │   ├── ProfileHero.tsx
│   │   ├── ProfileAbout.tsx
│   │   ├── ProfileHelpCards.tsx
│   │   ├── SkillsGrid.tsx
│   │   └── GreyedSection.tsx               # "join to see" overlay
│   └── admin/                              # NEW supporting components
│       ├── MemberList.tsx
│       ├── BulkActionBar.tsx
│       └── ActivityLogRow.tsx
├── lib/
│   ├── constants/industries.ts             # NEW — dropdown values
│   ├── slug.ts                             # NEW — generate + uniqueness
│   ├── validation/
│   │   ├── application.ts                  # NEW — zod schemas per wizard step
│   │   └── onboarding.ts                   # NEW — zod schemas for welcome steps
│   └── supabase/{client,server,middleware}.ts    # KEEP
├── proxy.ts                                # REPLACE existing `middleware.ts` (Next 16 rename) with
│                                           #   added rule: approved + no onboarding → /welcome
└── supabase/migrations/
    └── 00009_onboarding_and_directory.sql  # NEW
```

### Routing & auth gates

Gate logic lives in `proxy.ts`:

| Auth state | Has profile? | Has application? | Member status | Onboarding done? | Destination |
|---|---|---|---|---|---|
| Logged out | — | — | — | — | Public pages OK, `/dashboard` etc → `/login` |
| Logged in | yes | no | — | — | `/signup` (wizard resumes from step they left) |
| Logged in | yes | yes | `pending` | — | `/dashboard` (pending state) |
| Logged in | yes | yes | `approved` | no | `/welcome` (redirect from anywhere except `/welcome` and `/logout`) |
| Logged in | yes | yes | `approved` | yes | Full access |
| Logged in | yes | yes | `rejected`/`inactive` | — | `/dashboard` (rejected/inactive message) |

### Component boundaries

Each directory has one purpose and a small public API:

- **`components/wizard/`** — generic multi-step form. Knows nothing about Bizcelona. Props: steps, initial values, `onStepComplete`, `onFinalSubmit`. Consumers drop it into `/signup` and `/welcome`.
- **`components/directory/`** — render a list of member rows with filters. Pure presentational + minimal client interactivity. Data fetched server-side in `/members/page.tsx`.
- **`components/profile/`** — render a profile. `GreyedSection` wraps any private children and accepts a `visible: boolean` prop — public profile page passes false, logged-in member view passes true.
- **`lib/validation/`** — zod schemas. Shared between client (inline errors) and server actions (hard validation before DB writes). Single source of truth.

### Error handling

- Wizard: per-step zod validation; form errors inline, server errors via a toast + retry. If `auth.signUp()` fails at Step 1 (duplicate email), surface the specific message and offer "log in instead".
- Server actions: always return `{ ok: true } | { ok: false, error: string }`; never throw to the client.
- Admin approvals: run the three writes (update `applications`, upsert `members`, insert `activity_logs`) in a single Postgres function `approve_application(application_id, reviewer_id)` so a partial failure never leaves orphaned state. Reject mirrors this.
- Storage uploads: size/type validation client-side; server-side enforcement via Supabase Storage policy; failed upload doesn't block the rest of the form.

### Notifications

All Resend calls stay on existing endpoints. Approved-email triggers on admin approval action. Welcome email on signup stays. New: daily cron-driven "you still have X days to complete your application" email if `/signup` was started but no `applications` row after 48h (phase 2, flagged but not required in this round).

## Testing

- **Unit**: zod schemas (`lib/validation/*`), `lib/slug.ts`, `approve_application` SQL function (via Supabase SQL tests or an integration-style Jest against a local Supabase branch).
- **Integration**: full signup→application→approval→onboarding flow as a Playwright test; directory filter interactions; WhatsApp deep-link rendering with a stubbed wa.me handler.
- **Smoke**: one happy-path run against the production-shaped Supabase project after each deploy (use the existing `/api/diagnostics/env-check` route as the health touchstone).

## Rollout

1. Ship the migration first (no UI reads the new columns yet — safe additive changes).
2. Ship wizard + pending-state dashboard + welcome onboarding. Old `/apply` route stays live behind a feature flag on the rare chance someone has a bookmarked link; it redirects to `/signup` or Step 2 of the wizard as appropriate.
3. Ship directory + profile pages.
4. Ship admin surface additions.
5. Delete `/apply` and its backup files; drop the feature flag.

## Open questions

None — all key decisions locked during brainstorming.

## Decisions log

| Decision | Choice |
|---|---|
| Signup flow shape | Unified wizard (Option C). Account created unconfirmed at Step 1; admin approval is the real gate. |
| Wizard scope | Hybrid — 5-step pre-approval (replicates the 13 Google Form questions) + 2-step post-approval onboarding. |
| Company vs role | Split into two fields (`company`, `business_role`). |
| Industry | Dropdown, controlled vocabulary. |
| Consent tracking | All five consent items stored as individual booleans. |
| Profile layout | Hero-led (banner + overlapping photo + help-offered/needed coloured cards). |
| Profile visibility | Only the profile photo is visible publicly; all other fields (name, role, company, industry, bio, skills, help, contact) render as greyed placeholders with a "Join Bizcelona to see" overlay. `/members` index is members-only. |
| Directory layout | Rich list rows with inline help-offered/needed and one-tap WhatsApp. |
| Admin scope | Keep existing stats/applications; add Members tab, activity log view, WhatsApp links manager, bulk actions on applications. |
