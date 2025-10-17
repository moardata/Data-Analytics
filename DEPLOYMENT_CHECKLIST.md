# 🚀 CreatorIQ Deployment Checklist
**Last Updated: October 17, 2025**

---

## ✅ COMPLETED WORK

### 1. **Database Schema** ✅
- [x] Fixed all `client_id` → UUID parameter issues
- [x] Created course tables (courses, course_lessons, course_enrollments, lesson_interactions)
- [x] Added RLS policies for security
- [x] Created indexes for performance
- [x] Added auto-update triggers for progress tracking

**File:** `database/add-course-tables.sql`

### 2. **API Routes** ✅
- [x] `/api/courses/sync` - Fetch and sync courses from Whop
- [x] `/api/courses/progress` - Track student progress
- [x] `/api/revenue/balance` - Get company balance with refunds/disputes
- [x] Enhanced `/api/analytics/metrics` with course data and net revenue
- [x] Updated `/api/webhooks` with refund/dispute handlers

### 3. **Frontend** ✅
- [x] Created `/courses` page with course overview
- [x] Updated navigation with all pages
- [x] Analytics now shows course metrics
- [x] Revenue tracking includes refunds/disputes

### 4. **Permissions** ✅
- [x] Added all 16 required permissions to Whop app
- [x] courses:read ✅
- [x] course_lesson_interaction:read ✅
- [x] company:balance:read ✅
- [x] webhook_receive:payments/refunds/disputes ✅

---

## 📋 DEPLOYMENT STEPS

### **STEP 1: Run Database Migration** ⚠️ REQUIRED
```sql
-- Open Supabase SQL Editor
-- Copy and paste contents of database/add-course-tables.sql
-- Click "Run" to execute

-- Or use Supabase CLI:
supabase db push
```

**Verify migration:**
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('courses', 'course_lessons', 'course_enrollments', 'lesson_interactions');

-- Should return 4 rows
```

### **STEP 2: Verify Environment Variables**
Check `.env.local` has:
```bash
WHOP_API_KEY=your_api_key
WHOP_WEBHOOK_SECRET=your_webhook_secret
WHOP_APP_ID=your_app_id
NEXT_PUBLIC_WHOP_COMPANY_ID=your_company_id
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_key (optional)
```

### **STEP 3: Test Course Sync**
```bash
# In browser console or via API tool:
POST /api/courses/sync
Headers: Content-Type: application/json
Body: { "companyId": "biz_YOUR_COMPANY_ID" }

# Should return:
# { "success": true, "syncedCourses": X, "syncedLessons": Y }
```

### **STEP 4: Verify Webhooks**
1. Go to Whop Dashboard → Your App → Webhooks
2. Ensure webhook URL is set: `https://your-app.vercel.app/api/webhooks`
3. Check webhook secret matches `WHOP_WEBHOOK_SECRET`
4. Verify these events are enabled:
   - `webhook_receive:app_memberships`
   - `webhook_receive:memberships`
   - `webhook_receive:payments`
   - `webhook_receive:refunds`
   - `webhook_receive:disputes`

### **STEP 5: Test Analytics Dashboard**
1. Visit `/analytics?companyId=YOUR_COMPANY_ID`
2. Verify metrics load:
   - Total Students
   - Active Subscriptions
   - Total Revenue (should show net revenue with refunds)
   - New course metrics (totalCourses, courseCompletionRate, etc.)

### **STEP 6: Test Courses Page**
1. Visit `/courses?companyId=YOUR_COMPANY_ID`
2. Click "Sync Courses" button
3. Verify courses appear with:
   - Course title and description
   - Lesson count
   - Enrollment count
   - Published status

### **STEP 7: Test Progress Tracking**
```bash
# Record a lesson interaction:
POST /api/courses/progress
Body: {
  "companyId": "biz_XXX",
  "whopUserId": "user_XXX",
  "whopCourseId": "course_XXX",
  "whopLessonId": "lesson_XXX",
  "progressPercentage": 50,
  "timeSpentSeconds": 300,
  "isCompleted": false
}

# Should return:
# { "success": true, "interaction": { ... } }
```

---

## 🔍 TESTING CHECKLIST

### **Database Tests**
- [ ] Run migration without errors
- [ ] Verify all 4 tables created
- [ ] Check RLS policies work
- [ ] Test auto-update trigger (update lesson_interaction, check enrollment progress updates)
- [ ] Verify indexes created

### **API Tests**
- [ ] Course sync fetches data from Whop
- [ ] Course progress recording works
- [ ] Revenue balance endpoint returns data
- [ ] Analytics metrics include course data
- [ ] Webhooks process refunds/disputes
- [ ] All routes use correct client_id → UUID flow

### **Frontend Tests**
- [ ] Navigation shows all pages
- [ ] Courses page loads and displays data
- [ ] Analytics page shows course metrics
- [ ] Sync button works on courses page
- [ ] All pages handle loading/error states

### **Permission Tests**
- [ ] Verify `courses:read` permission works
- [ ] Verify `course_lesson_interaction:read` permission works
- [ ] Verify `company:balance:read` permission works
- [ ] Test webhook receives payment events
- [ ] Test webhook receives refund events
- [ ] Test webhook receives dispute events

### **Integration Tests**
- [ ] Create a test course in Whop
- [ ] Sync courses to app
- [ ] Enroll a test user
- [ ] Record lesson progress
- [ ] Check analytics update
- [ ] Verify progress shows in dashboard

---

## 🚨 KNOWN ISSUES TO WATCH FOR

### **Issue 1: Whop API Response Format**
- **Problem**: Course sync API assumes a certain response structure from Whop
- **Solution**: May need to adjust parsing based on actual Whop API responses
- **File**: `app/api/courses/sync/route.ts`

### **Issue 2: Course Tables Not Yet Run**
- **Problem**: Database migration hasn't been executed yet
- **Impact**: Course endpoints will fail until migration runs
- **Solution**: Run `database/add-course-tables.sql` in Supabase

### **Issue 3: Empty Enrollment Counts**
- **Problem**: If no enrollments exist, counts will be 0
- **Solution**: Normal behavior; will populate as students enroll

### **Issue 4: Progress Not Updating**
- **Problem**: If trigger doesn't fire, progress won't auto-update
- **Solution**: Check PostgreSQL logs in Supabase; trigger function might have errors

---

## 📊 SUCCESS METRICS

After deployment, you should see:
- ✅ All API routes return 200 (not 400/500)
- ✅ Courses sync successfully from Whop
- ✅ Analytics show course completion rates
- ✅ Revenue reflects refunds/disputes
- ✅ Progress tracking updates in real-time
- ✅ No more `client_id` parameter errors in Supabase logs

---

## 🔄 ROLLBACK PLAN

If something breaks:

### **Database Rollback**
```sql
-- Drop new tables (WARNING: Deletes all course data)
DROP TABLE IF EXISTS lesson_interactions CASCADE;
DROP TABLE IF EXISTS course_enrollments CASCADE;
DROP TABLE IF EXISTS course_lessons CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
```

### **Code Rollback**
```bash
# Revert to previous working commit
git log --oneline  # Find last working commit
git revert HEAD    # Or specific commit hash
git push
```

---

## 🎯 POST-DEPLOYMENT

### **Immediate (Within 1 hour)**
1. Monitor Vercel logs for errors
2. Check Supabase logs for 400 errors
3. Test course sync with real data
4. Verify webhooks receiving events

### **Within 24 hours**
1. Check analytics for real user data
2. Verify course progress tracking works
3. Monitor revenue calculations
4. Test with multiple courses/students

### **Within 1 week**
1. Gather user feedback on new features
2. Monitor performance/load times
3. Check for edge cases
4. Optimize slow queries if needed

---

## ✅ FINAL VERIFICATION

Before marking complete, ensure:
- [ ] Database migration executed successfully
- [ ] All API endpoints return valid data
- [ ] Frontend pages load without errors
- [ ] Webhooks receiving and processing events
- [ ] Analytics show accurate metrics
- [ ] No console errors in browser
- [ ] No 400/500 errors in Supabase logs
- [ ] Navigation works across all pages
- [ ] Course sync retrieves data from Whop
- [ ] Progress tracking updates correctly

---

## 📞 SUPPORT CONTACTS

- **Supabase Issues**: https://supabase.com/dashboard/support
- **Whop API Issues**: https://whop.com/developers/ or Discord
- **Vercel Deployment**: https://vercel.com/support
- **Code Repository**: https://github.com/moardata/Data-Analytics

---

**STATUS**: Ready for deployment pending database migration

**NEXT STEP**: Run `database/add-course-tables.sql` in Supabase

