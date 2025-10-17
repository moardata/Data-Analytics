# 🎯 How to See Your App Working with Test Data

**Quick Guide**: Generate test data and see your dashboard come alive!

---

## 🚀 Option 1: Generate Test Data (Easiest!)

### **Step 1: Wait for Deployment**
Wait 2-3 minutes for the latest code to deploy to Vercel.

### **Step 2: Call the Test Data Generator**

Use this API endpoint to populate your dashboard instantly:

**Using curl:**
```bash
curl -X POST https://data-analytics-gold.vercel.app/api/test/populate \
  -H "Content-Type: application/json" \
  -d '{"companyId": "YOUR_COMPANY_ID", "studentCount": 5}'
```

**Using Postman:**
- Method: `POST`
- URL: `https://data-analytics-gold.vercel.app/api/test/populate`
- Body (JSON):
  ```json
  {
    "companyId": "YOUR_COMPANY_ID",
    "studentCount": 5
  }
  ```

**Replace `YOUR_COMPANY_ID` with your actual Whop company ID** (e.g., `biz_xxxxx`)

### **Step 3: Check the Response**

You should get:
```json
{
  "success": true,
  "message": "Test data created successfully",
  "data": {
    "studentsCreated": 5,
    "eventsCreated": 18,
    "subscriptionsCreated": 5,
    "formsCreated": 5,
    "insightCreated": true
  },
  "nextSteps": {
    "viewDashboard": "/analytics?companyId=biz_xxx",
    "viewStudents": "/students?companyId=biz_xxx",
    "viewInsights": "/insights?companyId=biz_xxx"
  }
}
```

### **Step 4: View Your Dashboard**

Open your app in Whop or go directly to:
```
https://data-analytics-gold.vercel.app/analytics?companyId=YOUR_COMPANY_ID
```

**You should now see:**
- 📊 **5 Students** tracked
- 📈 **Activity chart** with data points
- 💡 **AI Insight** generated
- 📋 **Active subscriptions**
- 📊 **Engagement metrics**

---

## 🎯 Option 2: Test with Webhooks from Whop

### **Step 1: Go to Whop Developer Dashboard**
1. Visit https://whop.com/apps
2. Click on your app
3. Go to **Webhooks** tab

### **Step 2: Send Test Webhook**
1. Click **"Test"** button
2. Select event type: `membership.experienced_claimed`
3. Click **"Send Test"**

### **Step 3: Check Response**

✅ **Success looks like:**
```json
{
  "status": "received",
  "action": "membership.experienced_claimed",
  "version": "v7-no-validation",
  "timestamp": "2025-10-17..."
}
```

❌ **If you still see Supabase error:**
```json
{
  "error": "SUPABASE_SERVICE_ROLE_KEY is required..."
}
```
Wait a bit longer for deployment, or check that the env var is set in Vercel.

### **Step 4: Refresh Dashboard**
Each webhook test creates:
- 1 new student
- 1 activity event
- 1 subscription record

Refresh your dashboard to see the numbers increase!

---

## 📊 What Test Data Creates

### **Students (5 created)**
- Alex Johnson
- Sam Smith  
- Jordan Lee
- Taylor Brown
- Casey Davis

### **Events (15-25 created)**
- Signups
- Course starts
- Lesson completions
- Form submissions
- Purchases

### **Subscriptions (5 created)**
- Mix of atom, core, pulse plans
- 70% active, 30% cancelled
- Various start dates

### **Form Submissions (5 created)**
- Feedback text samples
- Ratings 1-5 stars
- Sentiment analysis (positive/neutral/negative)

### **AI Insight (1 created)**
```
🎓 Your students are highly engaged! 
70% have completed at least 3 activities in the past week.

Recommendations:
- Consider creating advanced content for your most active students
- Send re-engagement emails to inactive members
- Create a community space for students to connect
```

---

## 🔍 Verify Data in Supabase

If you want to see the raw data:

1. Go to Supabase Dashboard
2. Click **Table Editor**
3. Check these tables:
   - `entities` - Your students
   - `events` - Activity log
   - `subscriptions` - Membership data
   - `form_submissions` - Feedback
   - `insights` - AI-generated insights

---

## 🧹 Clean Up Test Data (Optional)

If you want to remove test data and start fresh:

**Option A: Delete via Supabase**
1. Go to Supabase → SQL Editor
2. Run this query (replace with your company ID):
```sql
DELETE FROM entities 
WHERE client_id IN (
  SELECT id FROM clients WHERE company_id = 'YOUR_COMPANY_ID'
);

DELETE FROM events 
WHERE client_id IN (
  SELECT id FROM clients WHERE company_id = 'YOUR_COMPANY_ID'
);

DELETE FROM subscriptions 
WHERE client_id IN (
  SELECT id FROM clients WHERE company_id = 'YOUR_COMPANY_ID'
);

DELETE FROM form_submissions 
WHERE client_id IN (
  SELECT id FROM clients WHERE company_id = 'YOUR_COMPANY_ID'
);

DELETE FROM insights 
WHERE client_id IN (
  SELECT id FROM clients WHERE company_id = 'YOUR_COMPANY_ID'
);
```

**Option B: Keep it!**
Test data helps demonstrate your app during review.

---

## 📍 Where to Find Your Company ID

### **Method 1: From Whop URL**
When you're in your Whop business dashboard, check the URL:
```
https://whop.com/hub/biz_xxxxxxxxxxxxx
                     ^^^^^^^^^^^^^^^^^ This is your company ID
```

### **Method 2: From Whop API**
Check your Whop developer settings or API calls.

### **Method 3: Use Test Value**
For testing, you can also use:
```
companyId: biz_test123
```
And it will create a new test client.

---

## 🎬 Full Demo Flow

**Complete end-to-end test:**

1. ✅ **Generate test data**
   ```bash
   curl -X POST https://data-analytics-gold.vercel.app/api/test/populate \
     -H "Content-Type: application/json" \
     -d '{"companyId": "biz_test123", "studentCount": 5}'
   ```

2. ✅ **Open dashboard**
   ```
   https://data-analytics-gold.vercel.app/analytics?companyId=biz_test123
   ```

3. ✅ **See live data:**
   - Students: 5
   - Events: ~18
   - Subscriptions: 5
   - Insights: 1

4. ✅ **Test webhook** (from Whop)
   - Watch student count increase to 6
   - See new activity in charts

5. ✅ **Test AI insights** (go to /insights page)
   - See generated insight
   - Request new insight (if within tier limits)

---

## 🐛 Troubleshooting

### "SUPABASE_SERVICE_ROLE_KEY is required"
**Issue**: Environment variable not loaded yet  
**Fix**: Wait 2-3 minutes for deployment, or check Vercel env vars

### "Client not found"
**Issue**: No client exists for that company ID  
**Fix**: The test endpoint will create one automatically. Try again.

### "Dashboard shows no data"
**Issue**: Company ID mismatch  
**Fix**: Make sure the `companyId` in the URL matches what you used in the API call

### "401 Unauthorized"
**Issue**: Authentication required when accessing directly  
**Fix**: Either:
- Access through Whop iframe
- Set `BYPASS_WHOP_AUTH=true` in Vercel (for testing)

---

## ✅ Success Checklist

- [ ] Latest code deployed to Vercel
- [ ] Test data generation returns success
- [ ] Dashboard shows 5 students
- [ ] Charts display activity data
- [ ] AI insight appears on insights page
- [ ] Webhook test creates new student
- [ ] Student count increases after webhook
- [ ] All pages load without errors

---

**Ready to see your app in action? Run the test data generator now!** 🚀

**Questions?** Check the logs in Vercel Functions or Supabase logs.

