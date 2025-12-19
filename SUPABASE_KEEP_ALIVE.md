# Preventing Supabase Auto-Pause

Supabase free-tier projects automatically pause after **7 days of inactivity**. Here are your options to prevent this:

## ✅ Solution 1: Automatic Keep-Alive (Implemented - FREE)

I've added an automatic keep-alive system using Vercel Cron Jobs.

### How It Works:
- **Vercel Cron Job** runs every 3 days
- Pings `/api/cron/keep-alive` endpoint
- Makes a simple database query to show activity
- Keeps Supabase active indefinitely

### Configuration Files:
- **`app/api/cron/keep-alive/route.ts`** - The endpoint that queries the database
- **`vercel.json`** - Cron schedule configuration

### Cron Schedule:
```
0 0 */3 * *
```
This means: **Every 3 days at midnight UTC**

### How to Enable:

1. **Deploy to Vercel** (if not already deployed)
   - The cron job only works in production, not locally
   - Vercel automatically detects `vercel.json` and sets up the cron

2. **Verify It's Working**
   - Go to Vercel Dashboard → Your Project → Cron Jobs
   - You should see: `/api/cron/keep-alive` listed
   - Status will show last execution time

3. **Test Manually** (Optional)
   - Visit: `https://bizcelona.com/api/cron/keep-alive`
   - Should return: `{"success": true, "message": "Database keep-alive successful"}`

### Vercel Cron Limits (Free Tier):
- ✅ **Free on Hobby plan** (your current plan)
- ✅ Unlimited cron jobs
- ✅ No additional cost

**Note:** Vercel cron jobs on the Hobby (free) plan are completely free and unlimited!

---

## Option 2: External Cron Service (Alternative - FREE)

If you prefer an external service:

### Use Cron-Job.org:

1. **Create Account**
   - Go to https://cron-job.org
   - Sign up (free)

2. **Create Cron Job**
   - Click "Create Cronjob"
   - URL: `https://bizcelona.com/api/cron/keep-alive`
   - Schedule: Every 3 days
   - Click "Create"

3. **That's It!**
   - The service will ping your endpoint every 3 days
   - Keeps Supabase active

### Other Free Cron Services:
- **UptimeRobot** - https://uptimerobot.com (monitors + pings)
- **EasyCron** - https://www.easycron.com (free tier available)
- **GitHub Actions** - Use repository cron workflows

---

## Option 3: Upgrade to Supabase Pro ($25/month)

### Benefits:
- ✅ Never pauses
- ✅ Better performance
- ✅ More storage
- ✅ Automatic backups
- ✅ No connection limits

### When to Upgrade:
- If you need 100% guaranteed uptime
- When you launch to real users
- If free tier becomes limiting

### How to Upgrade:
1. Go to Supabase Dashboard
2. Settings → Billing
3. Click "Upgrade to Pro"

---

## Recommended Approach

**For Now (Pre-Launch):**
- ✅ Use the automatic Vercel Cron Job (already set up)
- ✅ Completely free
- ✅ No maintenance required

**After Launch (With Real Users):**
- Consider upgrading to Supabase Pro
- Ensures 100% uptime
- Better performance for users
- Professional support

---

## Monitoring

### Check if Cron is Running:

1. **Vercel Dashboard**
   - Go to your project
   - Click "Cron Jobs" tab
   - See execution history

2. **Vercel Logs**
   - Functions → Logs
   - Filter by `/api/cron/keep-alive`
   - See "Keep-alive ping successful" messages

3. **Supabase Dashboard**
   - Check "Last activity" timestamp
   - Should never exceed 7 days

---

## Troubleshooting

### Cron Not Running?

**Check Vercel Plan:**
- Cron jobs require Vercel deployment (not local)
- Works on Hobby (free) plan ✅

**Check vercel.json Deployment:**
```bash
# In your project, check if vercel.json is committed
git ls-files | grep vercel.json
```

**Manual Test:**
```bash
# Visit the endpoint directly
curl https://bizcelona.com/api/cron/keep-alive
```

### Still Getting Paused?

1. Check Vercel Cron logs for errors
2. Verify endpoint returns `{"success": true}`
3. Consider using external cron service as backup

---

## Current Setup Status

✅ **Implemented:** Vercel Cron Job
- Schedule: Every 3 days
- Endpoint: `/api/cron/keep-alive`
- Status: Active after next deployment

**Next Steps:**
1. Deploy to Vercel (push to GitHub)
2. Verify cron appears in Vercel dashboard
3. Wait 3 days and check Vercel logs
4. Supabase will stay active indefinitely!

---

## Cost Summary

| Solution | Cost | Reliability | Maintenance |
|----------|------|-------------|-------------|
| Vercel Cron (Current) | $0 | High | None |
| External Cron Service | $0 | High | None |
| Supabase Pro | $25/mo | Very High | None |

**Recommendation:** Stick with Vercel Cron (already set up) until you need Pro features.
