# Fix Email Notifications Issue

## Problem
Admin notification emails are not being sent when new users register. The issue is missing environment variables for email configuration.

## Required Environment Variables

### 1. RESEND_API_KEY
Get your Resend API key from: https://resend.com/api-keys

### 2. ADMIN_EMAIL
Admin email addresses that should receive notifications (comma-separated for multiple):
```
ADMIN_EMAIL=owen@bizcelona.com,matthew@bizcelona.com
```

## Solution Steps

### Step 1: Update Local Development (.env.local)
The `.env.local` file has been updated with placeholders. You need to:

1. Go to https://resend.com and log in
2. Navigate to API Keys section
3. Copy your API key
4. Replace `your-resend-api-key-here` in `.env.local` with your actual API key

### Step 2: Update Vercel Production Environment Variables

**CRITICAL:** The production app on Vercel needs these environment variables configured.

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your `bizcelona-app` project
3. Go to **Settings** → **Environment Variables**
4. Add/Update these variables:

   ```
   RESEND_API_KEY = [your-resend-api-key]
   ADMIN_EMAIL = owen@bizcelona.com,matthew@bizcelona.com
   ```

5. **Important:** Select "Production", "Preview", and "Development" for both variables
6. Click **Save**
7. **Redeploy** your application for changes to take effect:
   - Go to **Deployments** tab
   - Click the 3-dot menu on the latest deployment
   - Select **Redeploy**

### Step 3: Test the Configuration

#### Option A: Use Diagnostic Endpoint (After deployment)
1. Log in to your production app as an admin
2. Visit: `https://bizcelona.com/api/diagnostics/env-check`
3. Check that both `RESEND_API_KEY` and `ADMIN_EMAIL` show "✅ Set"

#### Option B: Use Test Email Endpoint
1. Visit: `https://bizcelona.com/api/test-email`
2. This will send a test email to your admin addresses
3. Check owen@bizcelona.com and matthew@bizcelona.com inboxes

#### Option C: Test with Real Signup
1. Create a test account on your production site
2. Check if admins receive the "New User Signup" email

## Email Flow

When a new user signs up:
1. User creates account on `/signup` page
2. Signup page calls `/api/notifications/new-user` endpoint
3. Endpoint sends email via Resend to addresses in `ADMIN_EMAIL`
4. Email sent from: `Bizcelona <onboarding@resend.dev>`
5. Email sent to: `owen@bizcelona.com, matthew@bizcelona.com`

## Troubleshooting

### Email Still Not Received?

1. **Check Resend Dashboard:**
   - Go to https://resend.com/emails
   - Check if emails are being sent
   - Look for any errors or bounces

2. **Check Spam Folders:**
   - Search both Owen and Matthew's spam folders
   - If found, mark as "Not Spam"

3. **Verify Email Addresses:**
   - Make sure owen@bizcelona.com and matthew@bizcelona.com are correct
   - Test sending an email to these addresses manually

4. **Check Resend Domain:**
   - The emails are sent from `onboarding@resend.dev` (Resend's verified domain)
   - If you want to use `owen@bizcelona.com` as sender, you need to:
     - Verify the bizcelona.com domain in Resend
     - Update the `from` field in notification endpoints

5. **Check Application Logs:**
   - Go to Vercel → Your Project → Logs
   - Filter for "notification" or "resend" keywords
   - Look for error messages

## Next Steps After Fixing

Once email notifications are working:
- Test new user signup flow
- Test application submission flow (also sends notifications)
- Test approval email flow
- Consider setting up email monitoring/alerts in Resend
