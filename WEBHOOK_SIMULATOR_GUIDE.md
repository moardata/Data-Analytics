# 🚀 Webhook Simulator & Data Setup Guide

## **Quick Start - Trigger Data Immediately**

### **Option 1: One Command Setup (Recommended)**
```bash
npm run quick-setup
```
This will:
1. Generate realistic data for both test companies
2. Calculate and cache all dashboard metrics
3. Make data visible in the dashboard immediately

### **Option 2: Step-by-Step Setup**
```bash
# Step 1: Simulate realistic data
npm run simulate

# Step 2: Cache dashboard metrics
npm run cache-metrics

# Step 3: Verify data
npm run verify-data
```

---

## **📊 What Gets Created**

### **For Both Test Companies**:
- `biz_Jkhjc11f6HHRxh` (TechEd Academy)
- `biz_3GYHNPbGkZCEky` (Creative Skills Hub)

### **Data Generated**:
✅ **40-50 Students** per company
✅ **1000+ Events** with realistic patterns:
   - Membership creation events
   - Experience claimed events (content access)
   - Subscription events
   - Engagement patterns

✅ **20-30 Form Submissions** with feedback
✅ **Realistic Time Spans**: 30-40 days of activity
✅ **Content Engagement**: Multiple modules, quizzes, live sessions
✅ **Behavioral Patterns**: 
   - Early adopters (joined early, high engagement)
   - Consistent learners (regular engagement)
   - At-risk students (low engagement)
   - Power users (high engagement, multi-content)

---

## **🎯 Dashboard Metrics Generated**

After running the simulator, these metrics will be available:

### **1. Engagement Consistency Score**
- Measures week-over-week engagement patterns
- Identifies consistent vs. sporadic students
- Shows engagement trends

### **2. Aha Moment Tracker**
- Identifies breakthrough content experiences
- Shows which modules drive the most engagement spikes
- Flags stagnant students

### **3. Content Heat Map (Pathways)**
- Shows ideal content sequences
- Identifies dead-end modules
- Reveals power combinations

### **4. Popular Content Today**
- Real-time content engagement
- Trending modules and lessons
- Student participation counts

### **5. Top Feedback Themes**
- AI-analyzed feedback themes
- Sentiment analysis
- Common student requests

### **6. Commitment Probability Score**
- Predicts student completion likelihood
- Identifies at-risk students early
- Shows commitment distribution

---

## **🔧 Available Scripts**

### **Data Generation**
```bash
npm run simulate              # Generate realistic webhook data
npm run cache-metrics         # Calculate and cache metrics
npm run quick-setup          # Do both in one command
```

### **Data Verification**
```bash
npm run verify-data          # Check data status
node scripts/check-simulation-status.js    # Detailed status
node scripts/check-cached-metrics.js       # Check cached metrics
```

### **Data Cleanup**
```bash
npm run force-purge          # Delete all data
npm run purge-mock-data      # Purge and regenerate
```

---

## **📁 Simulator Files**

### **Main Simulator**
- `scripts/simulate-realistic-data.js`
  - Generates realistic student journeys
  - Creates engagement patterns
  - Simulates content pathways
  - Generates feedback submissions

### **Metric Calculator**
- `scripts/manual-metric-calculation.js`
  - Calculates all 6 dashboard metrics
  - Caches results in database
  - Sets appropriate TTLs

### **Verification Tools**
- `scripts/check-simulation-status.js` - Check data status
- `scripts/check-cached-metrics.js` - Verify cached metrics
- `scripts/verify-simulation-data.js` - Full data verification

---

## **🎬 How It Works**

### **Step 1: Client Creation**
```javascript
// Creates or gets client records for both companies
biz_Jkhjc11f6HHRxh → TechEd Academy
biz_3GYHNPbGkZCEky → Creative Skills Hub
```

### **Step 2: Student Generation**
```javascript
// Creates 40-50 students per company with:
- Realistic join dates (over 30-40 days)
- Email addresses
- User IDs
- Membership statuses
```

### **Step 3: Engagement Simulation**
```javascript
// Generates realistic engagement patterns:
- Content views (activity events)
- Experience claimed events
- Multi-day engagement patterns
- Weekly consistency patterns
```

### **Step 4: Content Pathways**
```javascript
// Creates content progression sequences:
Module 1 → Module 2 → Live Session
Module 1 → Quiz → Module 3
Resource Library → Community → Module 2
```

### **Step 5: Feedback Generation**
```javascript
// Creates form submissions with:
- Ratings (1-5 stars)
- Text feedback
- Realistic timestamps
- Various sentiment levels
```

### **Step 6: Metric Calculation**
```javascript
// Calculates and caches:
- Engagement consistency scores
- Aha moment analysis
- Content pathways
- Popular content
- Feedback themes
- Commitment scores
```

---

## **⚡ Immediate Data Trigger**

### **For Production Webhooks**
The simulator creates data that **mimics real webhook results**:

```javascript
// Real webhook would create:
POST /api/webhooks
{
  "action": "membership.created",
  "data": { user_id: "user_123", ... }
}

// Simulator creates the RESULT:
INSERT INTO entities (...)
INSERT INTO events (...)
INSERT INTO subscriptions (...)
```

### **Why This Works**
- ✅ Same database structure
- ✅ Same data patterns
- ✅ Same metric calculations
- ✅ Instant results (no webhook delays)
- ✅ Perfect for testing

---

## **🧪 Testing the Dashboard**

### **After Running Simulator**:

1. **Go to Dashboard in Whop**
   - The dashboard should load with data immediately

2. **Click "Sync Data" Button**
   - Forces fresh metric calculation
   - Shows real-time updates

3. **Check Each Metric Panel**:
   - ✅ Engagement Consistency Score (with gauge)
   - ✅ Aha Moment Tracker (with top experiences)
   - ✅ Content Pathways (with sequences)
   - ✅ Popular Content (with today's activity)
   - ✅ Feedback Themes (with AI analysis)
   - ✅ Commitment Scores (with distribution)

---

## **🔍 Debugging**

### **No Data Showing?**
```bash
# Check if data was created
npm run verify-data

# Check if metrics were cached
node scripts/check-cached-metrics.js

# Re-run the entire setup
npm run quick-setup
```

### **Metrics Not Calculating?**
```bash
# Check Vercel function logs
# Go to: Vercel Dashboard → Project → Functions → Logs

# Or test API directly
curl https://your-app.vercel.app/api/dashboard/metrics?clientId=xxx
```

### **Old Data Still Showing?**
```bash
# Clear everything and start fresh
npm run force-purge
npm run quick-setup
```

---

## **📊 Expected Results**

After running `npm run quick-setup`, you should see:

### **Console Output**:
```
🚀 Starting Realistic Data Simulation...

📊 Generating realistic data for biz_Jkhjc11f6HHRxh...
  ✓ Client exists: e379694f-7de5-411d-9040-9f62cf0ac0dc
  ✓ Generated 48 students
  ✓ Created 1000 events
  ✓ Generated engagement patterns
  ✓ Created aha moments
  ✓ Generated content pathways
  ✓ Created today's content activity
  ✓ Generated 24 feedback submissions
✅ Completed realistic data for biz_Jkhjc11f6HHRxh

... (same for biz_3GYHNPbGkZCEky)

🎉 Realistic data generation complete!

🔍 Manually Calculating and Caching Metrics...

📊 Processing biz_Jkhjc11f6HHRxh:
  ✅ Client ID: e379694f-7de5-411d-9040-9f62cf0ac0dc
  📊 Calculating basic metrics...
    Events: 1000
    Students: 48
    Form Submissions: 24
  💾 Caching metrics...
    ✅ Cached engagement_consistency
    ✅ Cached aha_moments
    ✅ Cached content_pathways
    ✅ Cached popular_content_daily
    ✅ Cached feedback_themes
    ✅ Cached commitment_scores

... (same for biz_3GYHNPbGkZCEky)

🎯 Manual calculation complete!
```

### **Database**:
- ✅ 91 students total
- ✅ 2000+ events
- ✅ 50+ form submissions
- ✅ 12 cached metrics (6 per company)

### **Dashboard**:
- ✅ All 6 metric panels show data
- ✅ Sync button works
- ✅ Metrics update on refresh
- ✅ No loading errors

---

## **🎯 Summary**

**To trigger data immediately:**
```bash
npm run quick-setup
```

**To verify it worked:**
```bash
npm run verify-data
```

**To see it in the dashboard:**
1. Open dashboard in Whop
2. Data should appear immediately
3. Click "Sync Data" to refresh

**All done!** 🎉

The webhook simulator creates realistic data instantly, making it perfect for:
- ✅ Testing the dashboard
- ✅ Demo purposes
- ✅ Development
- ✅ Verifying metrics calculations
- ✅ Training/onboarding

---

## **📞 Troubleshooting**

### **"Missing Supabase credentials"**
- Make sure `.env.local` exists with correct credentials
- Check: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### **"Table not found"**
- Run all database migrations in Supabase SQL editor
- Files: `database/01-schema.sql` through `05-dashboard-metrics.sql`

### **"No data in dashboard"**
- Re-run: `npm run quick-setup`
- Check browser console for API errors
- Verify Vercel deployment is live

---

**🚀 Ready to go! Your dashboard now has realistic data!**

