# Bizcelona Email Notifications - Quick Setup Guide

## ✅ What's Been Added

Your Bizcelona application now has **automatic email notifications** for admins!

### Two Types of Emails:

1. **New User Signup** 👋
   - Sent when someone creates an account
   - Includes: name, email, signup time

2. **New Application** 🎯
   - Sent when someone submits membership application
   - Includes: Full applicant details (name, email, phone, WhatsApp, business, role, message, contributor interest)
   - **Direct link** to review in admin panel

## 🚀 Setup Steps (5 minutes)

### Step 1: Create Resend Account
1. Go to https://resend.com
2. Sign up (free - no credit card needed)
3. Verify your email

### Step 2: Get API Key
1. In Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Name it "Bizcelona"
4. Copy the key (starts with `re_...`)

### Step 3: Add to Vercel
1. Go to your Vercel project: https://vercel.com
2. Click **Settings** → **Environment Variables**
3. Add these **two** variables:

```
RESEND_API_KEY = re_your_actual_key_here
ADMIN_EMAIL = owen@bizcelona.com,matthew@bizcelona.com
```

**Note:** For multiple admins, separate emails with commas (no spaces needed - they're automatically trimmed)

4. Click **Save**

### Step 4: Redeploy
1. Go to **Deployments** tab
2. Click the **⋮** menu on latest deployment
3. Click **Redeploy**

**That's it!** You'll now receive emails for all new users and applications.

## 📧 What Emails Look Like

### New User Email:
```
Subject: New User Signup: John Doe

👋 NEW ACCOUNT

A new user has created an account on Bizcelona:

Name: John Doe
Email: john@example.com
Created: Monday, December 10, 2024 at 3:45 PM

⏳ Next Step: This user will likely complete their membership application soon.
```

### New Application Email:
```
Subject: New Application: John Doe

🎯 New Bizcelona Application

A new member has applied to join Bizcelona:

Full Name: John Doe
Email: john@example.com
Phone: +34612345678
WhatsApp: +34612345678
Business/Role: Entrepreneur
Company: Tech Startup Inc
About: [Full message from application]
Willing to Contribute: Yes ✅

[Review Application Button] → Links directly to admin panel
```

## 🎯 Testing

### Test New User Notification:
1. Sign up with a test email at https://bizcelona.com/signup
2. Check your admin email inbox
3. Should receive notification within seconds

### Test Application Notification:
1. Complete and submit application form
2. Check your admin email inbox
3. Should receive full applicant summary with review link

## 📊 Free Tier Limits

Resend free tier includes:
- ✅ 100 emails/day
- ✅ 3,000 emails/month
- ✅ No credit card required

This is more than enough for Bizcelona's needs!

## ⚠️ Important Notes

### Domain Verification (Optional but Recommended)

For better deliverability, verify your domain in Resend:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain** → Enter `bizcelona.com`
3. Add the DNS records shown (SPF, DKIM, DMARC)
4. Wait 5-15 minutes for verification

**Without verification:**
- Emails send from `onboarding@resend.dev`
- May go to spam folder

**With verification:**
- Emails send from `notifications@bizcelona.com`
- Better deliverability, professional appearance

### After Domain Verification

Update the sender address in these files:
- `app/api/notifications/new-user/route.ts`
- `app/api/notifications/new-application/route.ts`

Change line:
```typescript
from: 'Bizcelona <notifications@bizcelona.com>',
```

## 🔍 Troubleshooting

**Not receiving emails?**
1. Check spam folder
2. Verify `RESEND_API_KEY` is correct in Vercel
3. Verify `ADMIN_EMAIL` is correct
4. Check Resend dashboard → Logs for delivery status

**Emails in spam?**
1. Verify your domain in Resend
2. Add SPF, DKIM, DMARC records
3. Wait 24 hours for DNS propagation

## 📚 Full Documentation

See `EMAIL_SETUP.md` for detailed setup instructions, troubleshooting, and advanced configuration.

## ✨ What Happens Next

Every time:
- Someone signs up → You get an email
- Someone applies → You get a detailed email with review link

You can review and approve applications right from your email!
