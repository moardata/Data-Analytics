# Testing Guide - CreatorIQ Analytics Dashboard

## 🚀 Quick Start: See Your App Working

### Step 1: Generate Test Data

**Wait 2-3 minutes for the latest deployment, then run:**

```bash
curl -X POST https://data-analytics-gold.vercel.app/api/test/populate-direct \
  -H "Content-Type: application/json" \
  -d '{"companyId": "biz_test_demo", "studentCount": 200}'
```

**This creates:**
- ✅ 200 students with progress tracking (30-70% completion)
- ✅ ~1,500 events with realistic revenue data
- ✅ 200 subscriptions (~$7,000/month recurring revenue)
- ✅ ~$20,000 in order revenue from events
- ✅ 3 form templates (Feedback, Satisfaction, Exit surveys)
- ✅ 80 form responses with 4-5 star ratings
- ✅ 4 AI insights (trend, weekly summary, recommendation, alert)

### Step 2: View Your Dashboard

**Option A: Through Whop (Recommended for Production)**
1. Go to: https://whop.com/apps
2. Find your "CreatorIQ" app
3. Click to open in Whop's interface
4. You should see all the test data!

**Option B: Direct Access (For Development)**
1. **Add to Vercel:** `BYPASS_WHOP_AUTH` = `true`
2. **Redeploy** (wait 2-3 minutes)
3. **Access:** https://data-analytics-gold.vercel.app/analytics?companyId=biz_test_demo

---

## 📊 What Data Will You See?

### Dashboard Page (`/analytics`)
- **Total Students**: 200
- **Engagement Rate**: ~70-80%
- **Revenue**: ~$27,000 total ($20k orders + $7k monthly recurring)
- **Charts**: Revenue over time, activity trends
- **Completion Rate**: 30-70% average

### Revenue Page (`/revenue`)
- **150-250 orders** ranging from $19.99 to $199.99
- **Total Revenue**: ~$15,000-$25,000 from orders
- **Order History**: Full transaction list with dates and amounts

### AI Insights Page (`/insights`)
- **4 Pre-generated Insights**:
  1. 📈 **Trend** - Strong Student Engagement Detected
  2. 📊 **Weekly Summary** - Revenue Growth Opportunity
  3. 💡 **Recommendation** - Form Response Insights
  4. ⚠️ **Alert** - High Satisfaction Score - Upsell Opportunity

### Students Page (`/students`)
- **200 students** with names, emails, and progress
- **Course assignments**: Beginner, Intermediate, Advanced, Master
- **Engagement scores**: 70-100 range

### Forms Page (`/forms`)
- **3 Form Templates**:
  - Course Feedback Survey (5 questions)
  - Student Satisfaction Survey (4 questions)
  - Exit Survey (3 questions)
- **80 Responses** with 4-5 star ratings

---

## ⚙️ Current Configuration

### Environment Variables (Vercel)
```
BYPASS_WHOP_AUTH=true              # For testing without Whop auth
SUPABASE_SERVICE_ROLE_KEY=<set>   # ✅ Now configured
NEXT_PUBLIC_SUPABASE_URL=<set>    # ✅ Configured
WHOP_API_KEY=<set>                 # ✅ Configured
OPENAI_API_KEY=<set>               # ✅ For AI insights
```

### Database (Supabase)
- **Clients**: Your company records
- **Entities**: Students/members
- **Events**: Activity tracking, orders, subscriptions
- **Subscriptions**: Recurring revenue tracking
- **Form Templates**: Survey definitions
- **Form Submissions**: Student feedback responses
- **Insights**: AI-generated recommendations

---

## 🐛 Troubleshooting

### Revenue Page Shows No Data
**Fixed!** ✅ Revenue page now uses `/api/revenue` endpoint instead of direct Supabase access.

**After latest deployment:**
- Revenue page will show all order events
- Total revenue calculated from `event_data.amount` field
- Events properly filtered by `event_type = 'order'`

### AI Insights Can't Generate
**Two types of insights:**

1. **Pre-generated Test Insights** (from test data)
   - These should already be in the database after running the populate command
   - Fetch existing insights: `GET /api/insights/generate?companyId=biz_test_demo`
   - Should see 4 insights immediately

2. **Real-time AI Generation** (requires OpenAI)
   - Needs `OPENAI_API_KEY` configured
   - Subject to tier limits (e.g., atom = 1/day, core = 5/day)
   - Check usage limits in `/api/insights/generate` POST response

**To test AI generation:**
```bash
curl -X POST https://data-analytics-gold.vercel.app/api/insights/generate \
  -H "Content-Type: application/json" \
  -d '{"companyId": "biz_test_demo", "timeRange": "week"}'
```

**If you get a 429 error**, you've hit the daily limit for your tier. Upgrade to a higher plan or wait until tomorrow.

### Dashboard Shows Zeros
**Likely causes:**
1. **Test data not generated yet** - Run the populate command
2. **Wrong companyId** - Make sure URL has `?companyId=biz_test_demo`
3. **Client record doesn't exist** - Populate command creates this

**To verify:**
```bash
# Check if data exists
curl https://data-analytics-gold.vercel.app/api/revenue?companyId=biz_test_demo
```

### Authentication Errors
**In Whop iframe:**
- Make sure you're accessing as an **admin**
- Enable dev proxy in Whop developer settings
- Refresh the page if you see auth errors

**For direct testing:**
- Set `BYPASS_WHOP_AUTH=true` in Vercel
- Redeploy
- Access with `?companyId=biz_test_demo` in URL

---

## 📈 Expected Metrics Summary

After running the test data generator with 200 students:

| Metric | Expected Value |
|--------|----------------|
| Total Students | 200 |
| Active Subscriptions | ~180 (90%) |
| Monthly Recurring Revenue | $6,000-$8,000 |
| Order Revenue (Total) | $15,000-$25,000 |
| Total Events | 1,000-2,000 |
| Order Events | 150-250 (15%) |
| Activity Events | 500-1,000 (50%) |
| Form Submissions | 300-450 (15%) |
| Engagement Rate | 70-80% |
| Avg Student Progress | 30-70% |
| Form Response Rate | 40% (80/200) |
| Avg Satisfaction | 4.3/5 |
| AI Insights | 4 pre-generated |

---

## 🎯 Next Steps

1. **✅ Run the test data populate command** (see Step 1)
2. **✅ Wait 2-3 minutes for deployment**
3. **✅ Access dashboard through Whop or with BYPASS_WHOP_AUTH**
4. **✅ Verify all pages show data** (analytics, revenue, insights, students, forms)
5. **Test webhook integration** with real Whop events
6. **Configure production environment variables** (remove BYPASS_WHOP_AUTH)
7. **Submit to Whop App Store** 🚀

---

## 🔐 Security Notes

**Before production:**
- ✅ Remove `BYPASS_WHOP_AUTH` environment variable
- ✅ Ensure `SUPABASE_SERVICE_ROLE_KEY` is set (not exposed to client)
- ✅ Row Level Security (RLS) is enabled on all tables
- ✅ Webhook validation is disabled for testing (re-enable for production)
- ⚠️ CORS headers currently allow `*` - should restrict to `whop.com` only

**After Whop approval:**
- Re-enable webhook signature validation
- Restrict CORS to Whop domains only
- Remove all test data from database
- Monitor API rate limits and usage

---

## 📞 Support

If you encounter issues:

1. **Check Vercel logs** - Functions tab → Find the API call → View logs
2. **Check browser console** - F12 → Console tab
3. **Test API directly** - Use curl commands above
4. **Verify environment variables** - Vercel → Settings → Environment Variables

Good luck with your launch! 🎉

