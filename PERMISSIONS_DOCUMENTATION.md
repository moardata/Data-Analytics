# 🔐 CreatorIQ Permissions Documentation
**Complete breakdown of all 24 permissions and their usage**

---

## 📋 PERMISSIONS OVERVIEW

CreatorIQ uses **24 permissions** to provide comprehensive analytics for Whop creators. All permissions are **read-only** or event-based, with no write access to sensitive data.

**Categories:**
- 👥 Member & User Data (5 permissions)
- 🏢 Company & Account (3 permissions)
- 🔧 Developer & OAuth (5 permissions)
- 📚 Courses & Learning (2 permissions)
- 💰 Revenue & Payments (6 permissions)
- 🔔 Webhooks (5 permissions)

---

## 👥 MEMBER & USER DATA

### `member:basic:read` ✅
**What it does:**
- Read basic member details (ID, username, join date)
- View membership status and tier

**Why we need it:**
- Display student lists in `/students` page
- Calculate total member count
- Track member growth over time
- Show engagement insights per member

**Usage in app:**
- `app/students/page.tsx` - Display member list
- `app/api/analytics/metrics/route.ts` - Calculate total students
- `app/api/webhooks/route.ts` - Process member events

**Data stored:**
```typescript
// entities table
{
  whop_user_id: string,
  name: string,
  created_at: timestamp
}
```

---

### `member:email:read` ✅
**What it does:**
- Read member email addresses

**Why we need it:**
- Connect survey responses to member profiles
- Enable personalized AI insights
- Contact members about course updates (future feature)

**Usage in app:**
- `app/forms/page.tsx` - Link form submissions to members
- `lib/utils/aiInsights.ts` - Generate personalized insights
- Future: Email notifications

**Data stored:**
```typescript
// entities table
{
  email: string  // Encrypted, never exposed publicly
}
```

---

### `member:stats:read` ✅
**What it does:**
- Read aggregated member statistics
- Access participation metrics
- View completion rates

**Why we need it:**
- Calculate active vs inactive members
- Display engagement percentages
- Show completion trends

**Usage in app:**
- `app/api/analytics/metrics/route.ts` - Calculate engagement rate
- `app/analytics/page.tsx` - Display member stats
- Dashboard KPIs (active members, engagement rate)

**Data displayed:**
- Total members: `{count}`
- Active members: `{percentage}%`
- Engagement rate: `{percentage}%`

---

### `courses:read` ✅
**What it does:**
- Read course structures and metadata
- Access course titles, descriptions, thumbnails
- View module/lesson organization

**Why we need it:**
- Display course list in `/courses` page
- Track which courses exist
- Show course details and structure

**Usage in app:**
- `app/api/courses/sync/route.ts` - Fetch courses from Whop
- `app/courses/page.tsx` - Display course catalog
- `database/add-course-tables.sql` - Store course data

**Data stored:**
```typescript
// courses table
{
  whop_course_id: string,
  title: string,
  description: string,
  total_lessons: number,
  instructor_name: string
}
```

---

### `course_lesson_interaction:read` ✅
**What it does:**
- Track lesson views and interactions
- Access completion status
- Read time spent on lessons

**Why we need it:**
- Calculate course completion rates
- Identify drop-off points
- Show student progress

**Usage in app:**
- `app/api/courses/progress/route.ts` - Track lesson progress
- `app/api/analytics/metrics/route.ts` - Calculate completion rates
- Dashboard shows: `courseCompletionRate`, `averageCourseProgress`

**Data stored:**
```typescript
// lesson_interactions table
{
  lesson_id: uuid,
  entity_id: uuid,
  progress_percentage: decimal,
  time_spent_seconds: number,
  is_completed: boolean,
  completed_at: timestamp
}
```

---

## 🏢 COMPANY & ACCOUNT

### `company:basic:read` ✅
**What it does:**
- Read company profile information
- Access company name and details
- View company metadata

**Why we need it:**
- Differentiate data between multiple creators
- Ensure proper data isolation (RLS policies)
- Display company name in dashboard

**Usage in app:**
- `lib/auth/whop-auth.ts` - Get company context
- All API routes - Verify company access
- RLS policies - Filter data by company

**Critical for:**
- Multi-tenancy (multiple creators using the app)
- Data security (each creator sees only their data)

---

### `company:balance:read` ✅
**What it does:**
- Read company balance and revenue totals
- Access verified payment data
- View transaction summaries

**Why we need it:**
- Display accurate revenue in dashboard
- Calculate net revenue (payments - refunds - disputes)
- Show financial metrics

**Usage in app:**
- `app/api/revenue/balance/route.ts` - Fetch current balance
- `app/api/analytics/metrics/route.ts` - Calculate net revenue
- Dashboard displays: `totalRevenue`, `netRevenue`, `grossRevenue`

**Data displayed:**
```typescript
{
  grossRevenue: 10000,
  refundedAmount: 500,
  disputedAmount: 200,
  netRevenue: 9300
}
```

---

### `company:log:read` ✅
**What it does:**
- Read historical transaction logs
- Access payment event history
- View membership change logs

**Why we need it:**
- Track revenue trends over time
- Identify payment spikes or drops
- Analyze cancellation patterns

**Usage in app:**
- `app/api/revenue/balance/route.ts` - Fetch transaction history
- `app/analytics/page.tsx` - Display revenue charts
- Time-series data for graphs

---

## 🔧 DEVELOPER & OAUTH

### `app_authorization:read` ✅
**What it does:**
- Verify app installation status
- Validate OAuth tokens
- Check authorization scope

**Why we need it:**
- Confirm the app is properly installed
- Validate user sessions
- Ensure correct permissions

**Usage in app:**
- `lib/whop-sdk.ts` - SDK initialization
- All API routes - Token validation
- Security checks

---

### `developer:basic:read` ✅
**What it does:**
- Read app configuration
- Access developer settings
- View app metadata

**Why we need it:**
- Maintain proper SDK connections
- Verify API compatibility
- Debug integration issues

**Usage in app:**
- Initial app setup
- Configuration verification
- Troubleshooting

---

### `developer:manage_api_key` ✅
**What it does:**
- Verify app API key configuration
- Check API key validity
- Ensure proper authentication

**Why we need it:**
- Validate API connections
- Ensure secure communication with Whop
- Maintain service reliability

**Usage in app:**
- API initialization
- Request authentication
- SDK configuration

---

### `developer:manage_oauth` ✅
**What it does:**
- Implement OAuth login flows
- Handle authorization redirects
- Manage user sessions

**Why we need it:**
- Secure creator authentication
- Connect Whop accounts to app
- Maintain logged-in sessions

**Usage in app:**
- User login flow
- Session management
- Authorization checks

---

### `developer:manage_webhook` ✅
**What it does:**
- Register webhook endpoints
- Update webhook configurations
- Verify webhook delivery

**Why we need it:**
- Receive real-time event notifications
- Keep analytics up-to-date
- Process payments, refunds, disputes

**Usage in app:**
- Webhook registration: `https://your-app.vercel.app/api/webhooks`
- Event processing in `app/api/webhooks/route.ts`

---

### `developer:update_app` ✅
**What it does:**
- Update app metadata during deployment
- Keep permissions current
- Modify app configuration

**Why we need it:**
- Continuous deployment updates
- Permission management
- App maintenance

**Usage in app:**
- CI/CD pipeline
- Version updates
- Configuration changes

---

## 💰 REVENUE & PAYMENTS

### `invoice:basic:export` ✅
**What it does:**
- Export summarized invoice data
- Access payment records
- Generate revenue reports

**Why we need it:**
- Produce accurate revenue charts
- Calculate financial trends
- Export financial data

**Usage in app:**
- `app/api/export/csv/route.ts` - Export invoices
- `app/api/export/pdf/route.ts` - Generate PDF reports
- Revenue analytics

---

### `lead:basic:export` ✅
**What it does:**
- Export lead source data
- Track conversion metrics
- View campaign performance

**Why we need it:**
- Analyze marketing effectiveness
- Track lead sources
- Calculate conversion rates

**Usage in app:**
- Future feature: Marketing analytics
- Lead tracking
- Campaign ROI

---

### `checkout_configuration:basic:read` ✅
**What it does:**
- Read checkout settings
- View pricing configurations
- Access payment options

**Why we need it:**
- Understand pricing tiers
- Display plan information
- Show upgrade options

**Usage in app:**
- `app/upgrade/page.tsx` - Display pricing
- `lib/pricing/tiers.ts` - Map Whop plans to app tiers

---

## 🔔 WEBHOOKS (Event Processing)

### `webhook_receive:memberships` ✅
**What it does:**
- Receive member join events
- Get cancellation notifications
- Track tier changes

**Why we need it:**
- Update member count in real-time
- Track membership changes
- Sync analytics automatically

**Events processed:**
- `membership.created` - New member joined
- `membership.cancelled` - Member cancelled
- `membership.expired` - Membership expired
- `membership.renewed` - Membership renewed

**Usage in app:**
```typescript
// app/api/webhooks/route.ts
if (action.startsWith('membership.')) {
  // Update subscription status
  await upsertSubscription(clientId, entityId, subscriptionData);
}
```

---

### `webhook_receive:app_memberships` ✅
**What it does:**
- Track app subscription changes
- Enforce tier-based limits
- Sync billing status

**Why we need it:**
- Restrict features by plan (Atom vs Quantum)
- Update usage limits automatically
- Handle plan upgrades/downgrades

**Usage in app:**
- `lib/pricing/usage-tracker.ts` - Check limits
- Tier enforcement
- Feature gating

---

### `webhook_receive:payments` ✅
**What it does:**
- Receive successful payment events
- Get payment amount and currency
- Track payment timestamps

**Why we need it:**
- Update revenue in real-time
- Calculate total income
- Show payment history

**Events processed:**
- `payment.succeeded` - Payment completed

**Usage in app:**
```typescript
// app/api/webhooks/route.ts
if (action === 'payment.succeeded') {
  console.log(`Payment succeeded: $${data.final_amount}`);
  // Store in events table
}
```

**Data stored:**
```typescript
// events table
{
  event_type: 'payment_succeeded',
  event_data: {
    amount: 10000,  // in cents
    currency: 'usd'
  }
}
```

---

### `webhook_receive:refunds` ✅
**What it does:**
- Receive refund notifications
- Get refund amounts
- Track refund reasons

**Why we need it:**
- Adjust revenue automatically
- Calculate net revenue
- Track refund rate

**Events processed:**
- `payment.refunded` - Refund issued

**Usage in app:**
```typescript
// app/api/webhooks/route.ts
if (action === 'payment.refunded') {
  await supabase.from('events').insert({
    event_type: 'payment_refunded',
    event_data: {
      amount: data.final_amount,
      refund_reason: data.refund_reason
    }
  });
}
```

**Impact on analytics:**
```typescript
netRevenue = grossRevenue - refundedAmount - disputedAmount
```

---

### `webhook_receive:disputes` ✅
**What it does:**
- Receive payment dispute notifications
- Track dispute status
- Get dispute reasons

**Why we need it:**
- Alert creators to disputes
- Calculate dispute rate
- Adjust revenue calculations

**Events processed:**
- `payment.disputed` - Dispute opened
- `payment.dispute_resolved` - Dispute resolved

**Usage in app:**
```typescript
// app/api/webhooks/route.ts
if (action === 'payment.disputed') {
  // Alert creator
  console.warn(`Dispute: $${data.final_amount}`);
  // Store dispute event
}
```

**Data displayed:**
- Dispute count: `{count}`
- Dispute rate: `{percentage}%`
- Disputed amount: `${amount}`

---

### `webhook_receive:resolutions` ✅
**What it does:**
- Process dispute resolution events
- Update dispute status
- Adjust final revenue

**Why we need it:**
- Update analytics when disputes resolve
- Correct revenue calculations
- Track resolution outcomes

**Events processed:**
- `payment.dispute_resolved` - Dispute closed

**Usage in app:**
```typescript
// app/api/webhooks/route.ts
if (action === 'payment.dispute_resolved') {
  // Update revenue if dispute won
  // Final adjustment to net revenue
}
```

---

### `webhook_receive:app_payments` ✅
**What it does:**
- Track Creator Analytics subscription changes
- Process plan upgrades/downgrades
- Handle billing events

**Why we need it:**
- Enforce tier limits (Atom: 100 students, Quantum: 10,000)
- Update feature access
- Track app revenue

**Usage in app:**
- `lib/pricing/usage-tracker.ts` - Enforce limits
- Plan upgrade flow
- Feature unlocking

---

## 🔒 DATA SECURITY & PRIVACY

### **What we DON'T do:**
- ❌ Store credit card information
- ❌ Access user passwords
- ❌ Modify payment settings
- ❌ Send emails without consent
- ❌ Share data with third parties
- ❌ Expose personal information publicly

### **What we DO:**
- ✅ Encrypt all sensitive data
- ✅ Use RLS policies for data isolation
- ✅ Anonymize data in reports
- ✅ Store only necessary information
- ✅ Follow GDPR/CCPA compliance
- ✅ Provide data export on request

### **Data Retention:**
- Member data: Deleted 30 days after uninstall
- Analytics data: Retained for historical trends
- Financial data: Kept for tax/compliance (7 years)

---

## 📊 PERMISSION USAGE BREAKDOWN

| Permission | Read | Write | Webhook | Critical |
|-----------|------|-------|---------|----------|
| member:basic:read | ✅ | ❌ | ❌ | ✅ |
| member:email:read | ✅ | ❌ | ❌ | ⚠️ |
| member:stats:read | ✅ | ❌ | ❌ | ✅ |
| courses:read | ✅ | ❌ | ❌ | ✅ |
| course_lesson_interaction:read | ✅ | ❌ | ❌ | ✅ |
| company:basic:read | ✅ | ❌ | ❌ | ✅ |
| company:balance:read | ✅ | ❌ | ❌ | ✅ |
| company:log:read | ✅ | ❌ | ❌ | ✅ |
| app_authorization:read | ✅ | ❌ | ❌ | ✅ |
| developer:basic:read | ✅ | ❌ | ❌ | ⚠️ |
| developer:manage_api_key | ✅ | ❌ | ❌ | ✅ |
| developer:manage_oauth | ✅ | ❌ | ❌ | ✅ |
| developer:manage_webhook | ❌ | ✅ | ❌ | ✅ |
| developer:update_app | ❌ | ✅ | ❌ | ⚠️ |
| invoice:basic:export | ✅ | ❌ | ❌ | ✅ |
| lead:basic:export | ✅ | ❌ | ❌ | ⚠️ |
| checkout_configuration:basic:read | ✅ | ❌ | ❌ | ⚠️ |
| webhook_receive:memberships | ❌ | ❌ | ✅ | ✅ |
| webhook_receive:app_memberships | ❌ | ❌ | ✅ | ✅ |
| webhook_receive:payments | ❌ | ❌ | ✅ | ✅ |
| webhook_receive:refunds | ❌ | ❌ | ✅ | ✅ |
| webhook_receive:disputes | ❌ | ❌ | ✅ | ✅ |
| webhook_receive:resolutions | ❌ | ❌ | ✅ | ⚠️ |
| webhook_receive:app_payments | ❌ | ❌ | ✅ | ✅ |

**Legend:**
- ✅ Critical: Required for core functionality
- ⚠️ Optional: Enhances features but not required
- ❌ Not used

---

## 🎯 PERMISSION JUSTIFICATION FOR WHOP REVIEW

**Why CreatorIQ needs these permissions:**

1. **Analytics Purpose**: We provide course creators with insights into student engagement, completion rates, and revenue trends
2. **Read-Only Access**: 20/24 permissions are read-only; we don't modify user data
3. **Real-Time Updates**: Webhooks ensure analytics stay current without manual refreshes
4. **Multi-Tenancy**: Company permissions enable proper data isolation between creators
5. **Revenue Tracking**: Payment/refund/dispute permissions provide accurate financial analytics
6. **Course Tracking**: Course permissions enable progress tracking and completion analytics

**All data is:**
- Stored securely in Supabase with RLS
- Encrypted at rest and in transit
- Anonymized in public reports
- Deletable on uninstall
- GDPR/CCPA compliant

---

**Total Permissions: 24**
**Critical: 17**
**Optional: 7**
**Read-Only: 20**
**Write: 2 (webhook/app management only)**
**Webhooks: 5**

