# Supabase Setup Guide

This guide will walk you through setting up Supabase for the Bizcelona application.

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in the details:
   - **Name**: Bizcelona
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users (e.g., Europe West for Barcelona)
   - **Pricing Plan**: Free tier is fine to start
5. Click "Create new project"
6. Wait for the project to be provisioned (~2 minutes)

## Step 2: Get Your API Credentials

1. Once your project is ready, go to **Settings** (gear icon in sidebar)
2. Click on **API** in the settings menu
3. Copy the following values:
   - **Project URL** - This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** - This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** - This is your `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Step 3: Update Environment Variables

1. Open `.env.local` in the root of your project
2. Replace the placeholder values with your actual credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
```

3. Save the file
4. Restart your Next.js development server

## Step 4: Run Database Migrations

1. In your Supabase project, go to **SQL Editor** (in the sidebar)
2. Click **New Query**
3. Copy the contents of `supabase/migrations/00001_initial_schema.sql`
4. Paste into the SQL editor and click **Run**
5. Wait for success message
6. Create another new query
7. Copy the contents of `supabase/migrations/00002_rls_policies.sql`
8. Paste and run
9. You should see "Success. No rows returned"

## Step 5: Configure Authentication

1. Go to **Authentication** → **Providers** in Supabase
2. Make sure **Email** is enabled (it should be by default)
3. Configure email settings:
   - Go to **Authentication** → **Email Templates**
   - Customize the confirmation and reset password emails if desired
4. Optional: Configure additional providers (Google, GitHub, etc.)

## Step 6: Set Up Storage (Optional)

If you want to allow profile picture uploads:

1. Go to **Storage** in Supabase
2. Click **Create bucket**
3. Name it `profile-pictures`
4. Make it **Public**
5. Set up storage policies in the bucket settings

## Step 7: Test the Database

1. Go to **Table Editor** in Supabase
2. You should see all these tables:
   - profiles
   - member_skills
   - member_help_requests
   - members
   - applications
   - admins
   - whatsapp_links
   - posts
   - activity_logs

## Step 8: Create Your First Admin User

After you've signed up for an account through the app:

1. Go to **SQL Editor** in Supabase
2. Run this query (replace `your-user-id` with your actual user ID):

```sql
-- Get your user ID first
SELECT id, email FROM auth.users;

-- Then insert admin record
INSERT INTO admins (user_id, role, granted_by)
VALUES ('your-user-id', 'super_admin', 'your-user-id');
```

## Troubleshooting

### Migration Errors

If you get errors running migrations:
- Make sure you're running them in order (00001 before 00002)
- Check that UUID extension is enabled
- Verify you're using PostgreSQL 12+

### Authentication Not Working

- Verify environment variables are correct
- Make sure you restarted the dev server after updating `.env.local`
- Check browser console for errors
- Verify email provider is enabled in Supabase

### RLS Policies Blocking Access

- Check user is authenticated in the app
- Verify user has correct role (member, admin, etc.)
- Review the RLS policies in `00002_rls_policies.sql`
- Use SQL Editor to manually check user permissions

## Next Steps

Once Supabase is set up:
1. Test user signup at `/signup`
2. Verify email confirmation works
3. Test login at `/login`
4. Create your first application
5. Make yourself an admin
6. Test admin approval flow

## Useful Supabase Dashboard Links

- **Table Editor**: View and edit data directly
- **SQL Editor**: Run custom queries
- **API Docs**: Auto-generated API documentation
- **Logs**: View real-time logs and errors
- **Database**: Database settings and connection info
