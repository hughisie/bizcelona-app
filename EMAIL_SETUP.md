# Email Notifications Setup

This guide explains how to set up email notifications for new user signups and applications.

## Overview

The application sends two types of email notifications to admins:

1. **New User Signup** - When someone creates an account
2. **New Application** - When someone submits their membership application (includes full application details)

## Setup Instructions

### 1. Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Click "Start Building" or "Sign Up"
3. Verify your email address
4. Complete account setup

**Why Resend?**
- ✅ **Free tier**: 100 emails/day, 3,000 emails/month
- ✅ No credit card required
- ✅ Simple API
- ✅ Great deliverability

### 2. Get Your API Key

1. Log into your Resend dashboard
2. Go to **API Keys** in the sidebar
3. Click **Create API Key**
4. Give it a name like "Bizcelona Notifications"
5. Select **Full Access** permission
6. Click **Add**
7. **Copy the API key** (you won't see it again!)

### 3. Verify Your Domain (Important!)

**Option A: Use Resend's Test Domain (Quick Start)**
- Resend provides `onboarding@resend.dev` for testing
- Emails will work but may go to spam
- Good for testing only

**Option B: Verify Your Own Domain (Recommended)**

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain: `bizcelona.com`
4. Add the DNS records shown (SPF, DKIM, DMARC)
5. Wait for verification (usually 5-15 minutes)

**DNS Records Example:**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none

Type: TXT
Name: resend._domainkey
Value: [provided by Resend]

Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
```

### 4. Update Environment Variables

#### Local Development (.env.local):
```bash
RESEND_API_KEY=re_123456789abcdefg  # Your actual API key
ADMIN_EMAIL=your-email@bizcelona.com  # Where to send notifications
```

#### Production (Vercel):

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add these variables:

```
RESEND_API_KEY = re_123456789abcdefg
ADMIN_EMAIL = your-email@bizcelona.com
```

4. Click **Save**
5. **Redeploy** your application for changes to take effect

### 5. Update Email Sender Address

After domain verification, update the notification API routes:

**File:** `app/api/notifications/new-application/route.ts`
**File:** `app/api/notifications/new-user/route.ts`

Change:
```typescript
from: 'Bizcelona <notifications@bizcelona.com>',
```

To use your verified domain:
```typescript
from: 'Bizcelona <notifications@yourdomain.com>',
```

### 6. Test the Notifications

#### Test New User Notification:
1. Sign up with a test email
2. Check your admin email inbox
3. You should receive: "👋 New User Signup: [Name]"

#### Test New Application Notification:
1. Complete the application form
2. Submit it
3. Check your admin email inbox
4. You should receive: "🎯 New Bizcelona Application: [Name]"

## Email Templates

### New User Signup Email Includes:
- ✉️ User's name (if provided)
- ✉️ Email address
- ✉️ Account creation timestamp
- ✉️ Note that application will likely follow

### New Application Email Includes:
- ✉️ Full name
- ✉️ Email
- ✉️ Phone (if provided)
- ✉️ WhatsApp number
- ✉️ Business/Role
- ✉️ Company
- ✉️ About section (full message)
- ✉️ Contributor interest status (Yes/No)
- ✉️ **Direct link** to review application in admin panel

## Troubleshooting

### Emails Not Sending?

**1. Check API Key**
```bash
# In terminal, verify environment variable is set:
echo $RESEND_API_KEY
```

**2. Check Logs**
- Open browser dev console (F12)
- Check for errors in Network tab
- Look for `/api/notifications/*` requests

**3. Check Resend Dashboard**
- Go to **Logs** in Resend dashboard
- See if emails were sent
- Check delivery status and any errors

### Emails Going to Spam?

**1. Verify Domain**
- Make sure all DNS records are added correctly
- Wait 24-48 hours for propagation

**2. Warm Up Your Domain**
- Send a few test emails manually first
- Gradually increase volume

**3. Add SPF, DKIM, DMARC**
- These improve deliverability significantly
- Resend provides all necessary records

### Still Having Issues?

1. **Check Resend status**: [status.resend.com](https://status.resend.com)
2. **Contact Resend support**: support@resend.com
3. **Check logs**: Both in browser console and Vercel logs

## Alternative: Using Gmail SMTP

If you prefer to use Gmail instead of Resend:

1. Enable 2-Factor Authentication on Gmail
2. Create an App Password
3. Use a different email library (nodemailer)
4. Update the notification routes accordingly

## Cost

**Free Tier Limits:**
- 100 emails per day
- 3,000 emails per month
- Perfect for small to medium communities

**If you exceed:**
- Paid plans start at $20/month for 50,000 emails
- You likely won't need this for a while

## Security Notes

- ✅ API keys are stored in environment variables (not in code)
- ✅ API keys are **never** committed to GitHub
- ✅ Only authenticated users can trigger notifications
- ✅ Notifications are sent server-side (can't be spoofed)

## Support

For issues specific to:
- **Resend**: [docs.resend.com](https://resend.com/docs)
- **Bizcelona app**: Check application logs or contact developer
