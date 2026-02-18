# Bizcelona Email Templates

Professional, branded email templates for Supabase Auth emails.

## 📧 Templates

### 1. **confirm-email.html**
**Use for:** New user signup email confirmation

**Supabase Template:** "Confirm signup"

**When sent:** When a new user creates an account and needs to verify their email

**Features:**
- Welcoming tone for new members
- Explains next steps after confirmation
- 24-hour expiration notice
- Branded colors (navy, saffron)

---

### 2. **reset-password.html**
**Use for:** Password reset requests

**Supabase Template:** "Change Email / Reset Password" OR "Reset Password"

**When sent:** When a user clicks "Forgot your password?" and requests a reset

**Features:**
- Clear call-to-action button
- 1-hour expiration notice
- Security information
- Fallback for non-HTML email clients

---

### 3. **email-change.html**
**Use for:** Email address change confirmation

**Supabase Template:** "Change Email" OR "Confirm email change"

**When sent:** When a user updates their email address in account settings

**Features:**
- Security warning if not requested
- Clear confirmation button
- 24-hour expiration notice
- Emphasis on security

---

## 🚀 How to Apply Templates

### Step 1: Go to Supabase Email Templates
https://app.supabase.com/project/wwjkxlbwvuvssamtsbqt/auth/templates

### Step 2: For Each Template

1. **Confirm Signup Template:**
   - Click on "Confirm signup" in Supabase
   - Copy contents of `confirm-email.html`
   - Paste into Supabase template editor
   - Click "Save"

2. **Reset Password Template:**
   - Click on "Reset password" or "Change Email / Reset Password" in Supabase
   - Copy contents of `reset-password.html`
   - Paste into Supabase template editor
   - Click "Save"

3. **Email Change Template:**
   - Click on "Change Email" or "Confirm email change" in Supabase
   - Copy contents of `email-change.html`
   - Paste into Supabase template editor
   - Click "Save"

---

## ✨ Template Features

All templates include:
- ✅ **Professional Design** - Clean, modern layout
- ✅ **Branded Colors** - Bizcelona navy (#1e3a5f) and saffron (#f59e0b)
- ✅ **Responsive** - Works on all devices
- ✅ **Spam-Resistant** - Proper HTML structure with good content
- ✅ **Security Info** - Clear expiration times and security warnings
- ✅ **Fallback Links** - Plain text URLs for email clients that don't support buttons
- ✅ **Professional Footer** - Company info and branding

---

## 🛡️ Anti-Spam Improvements

These templates help prevent emails from going to spam by:

1. **More Content** - Longer, more detailed emails look less suspicious
2. **Proper HTML Structure** - Valid HTML with proper headers
3. **Professional Formatting** - Tables for layout (email standard)
4. **Clear Purpose** - Explains why the email was sent
5. **Company Branding** - Logo, colors, company info
6. **Footer Information** - Proper sender identification

---

## 🎨 Customization

To customize colors or text:

1. **Navy color:** Search for `#1e3a5f` and replace
2. **Saffron color:** Search for `#f59e0b` and replace
3. **Company name:** Search for `Bizcelona` and replace
4. **Website URL:** Search for `bizcelona.com` and replace

---

## 📋 Variables Available

Supabase provides these variables you can use in templates:

- `{{ .ConfirmationURL }}` - The confirmation/reset link
- `{{ .Token }}` - The confirmation token (if needed separately)
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL from Supabase config
- `{{ .Email }}` - User's email address

---

## 🧪 Testing

After applying templates:

1. Test signup flow - create a test account
2. Test password reset - use "Forgot password?"
3. Check spam folder - mark as "Not spam" if needed
4. Verify links work correctly
5. Test on different email clients (Gmail, Outlook, Apple Mail)

---

## 📝 Notes

- Templates are stored in Supabase, not in the codebase
- These files are reference copies for version control
- Update both Supabase AND these files when making changes
- Test thoroughly before applying to production

---

**Last Updated:** February 2026
**Version:** 1.0
