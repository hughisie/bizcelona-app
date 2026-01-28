# Diagnose Email Confirmation Issue

## Problem
Users registering on the site are not receiving email confirmation from Supabase.

## Diagnostic Steps

### 1. Check Supabase Auth Settings

Go to: https://app.supabase.com/project/wwjkxlbwvuvssamtsbqt/auth/users

**Check Recent Users:**
- Look for the test user you just created
- Check the "Email Confirmed" column
- If it says "Not confirmed", the email was sent but not confirmed
- If the user doesn't appear at all, signup failed

### 2. Check Email Provider Configuration

Go to: https://app.supabase.com/project/wwjkxlbwvuvssamtsbqt/settings/auth

**Check these settings:**

**Enable Email Confirmations:**
- Should be ENABLED (toggle on)
- This requires users to confirm their email before accessing the app

**Email Provider:**
- Supabase uses its own SMTP by default
- For production, you may want to use a custom SMTP (like Resend)

### 3. Check Site URL Configuration

Go to: https://app.supabase.com/project/wwjkxlbwvuvssamtsbqt/auth/url-configuration

**Verify:**
- **Site URL:** Should be `https://bizcelona.com` (or your Vercel URL)
- **Redirect URLs:** Should include `https://bizcelona.com/**`

If this is wrong, confirmation links will point to the wrong domain.

### 4. Check Supabase Logs

Go to: https://app.supabase.com/project/wwjkxlbwvuvssamtsbqt/logs/explorer

**Look for:**
- Auth logs for the signup event
- Email sending logs
- Any errors related to email delivery

### 5. Test with Different Email Provider

Try signing up with:
- Gmail account
- Outlook/Hotmail account
- Your business email

Some email providers are stricter than others.

## Common Issues & Solutions

### Issue 1: Email Confirmations Disabled
**Solution:** Enable in Auth settings
1. Go to Auth Settings
2. Enable "Enable email confirmations"
3. Save changes

### Issue 2: Wrong Site URL
**Solution:** Update Site URL to production domain
1. Go to URL Configuration
2. Update Site URL to `https://bizcelona.com`
3. Save changes

### Issue 3: Supabase Email Service Issues
**Solution:** Use Custom SMTP (Resend)

Supabase's built-in email service can be unreliable. For production, configure custom SMTP:

1. Go to: https://app.supabase.com/project/wwjkxlbwvuvssamtsbqt/settings/auth
2. Scroll to **SMTP Settings**
3. Enable custom SMTP
4. Use Resend SMTP settings:
   - **Host:** smtp.resend.com
   - **Port:** 465 or 587
   - **Username:** resend
   - **Password:** Your Resend API key (re_12fHkMat_CavUZeE1hSSoBti5osYuer56)
   - **Sender email:** onboarding@resend.dev
   - **Sender name:** Bizcelona

### Issue 4: Email Rate Limiting
If you're testing multiple times, Supabase may rate-limit emails. Wait 5-10 minutes between test signups.

## Immediate Workaround

If a user signed up but can't confirm:

**Option A: Manually Confirm in Supabase**
1. Go to: https://app.supabase.com/project/wwjkxlbwvuvssamtsbqt/auth/users
2. Find the user
3. Click the three dots (...)
4. Select "Send confirmation email" or manually mark as confirmed

**Option B: Disable Email Confirmation Temporarily**
1. Go to Auth Settings
2. Disable "Enable email confirmations"
3. Users can sign up and access immediately
4. Re-enable later with custom SMTP

## Next Steps

1. Check Supabase Auth Users table - is the test user there?
2. Check your spam folder for the confirmation email
3. If using your production domain (bizcelona.com), verify DNS has propagated
4. Configure custom SMTP with Resend for reliable email delivery
