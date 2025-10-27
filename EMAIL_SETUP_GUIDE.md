# Email Support & Feedback Setup Guide

## Overview
Your app now has a complete support and feedback system with email notifications!

## ✅ What's Implemented

### Features
- **Feedback Modal** - Users can submit product feedback
- **Support Modal** - Users can contact support with issues
- **Email Notifications** - Get emails for all submissions
- **Database Storage** - All tickets stored in Supabase
- **Professional UI** - Beautiful modal forms with success states

### Files Created
1. `database/07-support-feedback.sql` - Database table for tickets
2. `app/api/support/submit/route.ts` - API endpoint for submissions
3. `components/FeedbackModal.tsx` - Feedback form modal
4. `components/SupportModal.tsx` - Support form modal
5. Updated `app/settings/page.tsx` - Integrated modals

---

## 🚀 Setup Instructions

### Step 1: Get a Resend API Key (FREE)

1. Go to https://resend.com/signup
2. Sign up for a free account
3. Verify your email
4. Go to **API Keys** → **Create API Key**
5. Copy the key (starts with `re_...`)

**Free Tier Includes:**
- 3,000 emails/month
- 100 emails/day
- Perfect for support/feedback

### Step 2: Add Environment Variables

Add these to your `.env.local` file:

```bash
# Resend Email Configuration
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=CreatorIQ <noreply@yourdomain.com>
SUPPORT_EMAIL=your.email@example.com
```

**Important:**
- `RESEND_API_KEY` - Your Resend API key
- `RESEND_FROM_EMAIL` - Must be a verified domain OR use `onboarding@resend.dev` for testing
- `SUPPORT_EMAIL` - Where you want to receive notifications

### Step 3: Set Up Domain (Optional but Recommended)

#### For Testing (Quick Start):
Use Resend's test domain:
```bash
RESEND_FROM_EMAIL=CreatorIQ <onboarding@resend.dev>
```

#### For Production (Professional):
1. Go to Resend Dashboard → **Domains** → **Add Domain**
2. Add your domain (e.g., `creatoriq.com`)
3. Follow DNS setup instructions
4. Wait for verification (usually 5-10 minutes)
5. Update `.env.local`:
```bash
RESEND_FROM_EMAIL=CreatorIQ <support@yourdomain.com>
```

### Step 4: Run Database Migration

Execute the SQL in Supabase:

1. Go to your Supabase project
2. Click **SQL Editor**
3. Copy contents of `database/07-support-feedback.sql`
4. Paste and run it

This creates the `support_tickets` table.

### Step 5: Deploy & Test!

1. Restart your dev server: `npm run dev`
2. Go to Settings page
3. Click "Submit Feedback" or "Contact Support"
4. Fill out the form and submit
5. Check your email! 📧

---

## 📧 Email Notifications

### What You'll Receive

When someone submits feedback or support:

**Email Subject:** `[FEEDBACK] Your Subject Here` or `[SUPPORT] Issue Title`

**Email Contains:**
- Type (Feedback/Support)
- Submitter info (name, email, company ID)
- Ticket ID for tracking
- Full message content
- Submission timestamp

---

## 🗄️ Database Structure

All submissions are stored in `support_tickets` table:

```sql
{
  id: UUID (unique ticket ID)
  client_id: UUID (your company)
  ticket_type: 'feedback' | 'support' | 'bug' | 'feature'
  subject: string
  message: text
  user_email: string
  user_name: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  created_at: timestamp
  updated_at: timestamp
}
```

### Query Your Tickets

```sql
-- Get all open tickets
SELECT * FROM support_tickets 
WHERE status = 'open' 
ORDER BY created_at DESC;

-- Get feedback only
SELECT * FROM support_tickets 
WHERE ticket_type = 'feedback' 
ORDER BY created_at DESC;

-- Get high priority items
SELECT * FROM support_tickets 
WHERE priority = 'high' 
AND status != 'closed'
ORDER BY created_at DESC;
```

---

## 🎨 User Experience

### Feedback Flow:
1. User clicks "Submit Feedback" in Settings
2. Modal opens with form
3. User enters subject + message
4. Clicks submit
5. Success message appears
6. Modal auto-closes after 2 seconds
7. You get an email notification

### Support Flow:
1. User clicks "Contact Support" in Settings
2. Modal opens with form
3. User enters email + subject + message
4. Clicks submit
5. Success message appears
6. Modal auto-closes after 3 seconds
7. You get an email notification

---

## 🔧 Customization

### Change Email Template

Edit `app/api/support/submit/route.ts`:

```typescript
html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px;">
    <!-- Customize your HTML here -->
  </div>
`
```

### Add Priority Routing

```typescript
// In route.ts, auto-set priority based on keywords
priority: message.toLowerCase().includes('urgent') ? 'urgent' : 'normal'
```

### Add Auto-Responses

```typescript
// Send confirmation email to user
await resend.emails.send({
  from: 'CreatorIQ <support@yourdomain.com>',
  to: userEmail,
  subject: 'We received your request',
  html: 'Thanks for contacting us...'
});
```

---

## 🐛 Troubleshooting

### Issue: Not Receiving Emails

**Check:**
1. `RESEND_API_KEY` is set correctly in `.env.local`
2. `SUPPORT_EMAIL` is your actual email
3. Check spam folder
4. Verify Resend API key is active (check dashboard)
5. Check server logs for errors

**Test API Key:**
```bash
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "your.email@example.com",
    "subject": "Test",
    "html": "<p>Testing Resend</p>"
  }'
```

### Issue: Database Error

**Check:**
1. Migration ran successfully
2. Table `support_tickets` exists
3. RLS policies allow inserts (they should be auto-configured)

### Issue: Modal Not Opening

**Check:**
1. Browser console for errors
2. Imports are correct
3. State variables properly defined

---

## 📊 Viewing Tickets (Future Enhancement)

Want a dashboard to view all tickets? You can:

1. Create `/app/support-tickets/page.tsx`
2. Fetch from `support_tickets` table
3. Display in a table with filters
4. Add status updates

**Quick Example:**
```typescript
const { data: tickets } = await supabase
  .from('support_tickets')
  .select('*')
  .eq('client_id', clientId)
  .order('created_at', { ascending: false });
```

---

## 💰 Cost Breakdown

### Resend Free Tier:
- ✅ 3,000 emails/month
- ✅ 100 emails/day
- ✅ Unlimited recipients
- ✅ API access

### Paid Plans (if needed later):
- $20/month for 50,000 emails
- $80/month for 200,000 emails

**For most users, free tier is plenty!**

---

## ✅ Next Steps

1. [ ] Sign up for Resend
2. [ ] Add API key to `.env.local`
3. [ ] Run database migration
4. [ ] Test feedback submission
5. [ ] Test support submission
6. [ ] Verify email received
7. [ ] (Optional) Add custom domain

---

## 🎉 You're Done!

Your app now has a professional support and feedback system. Users can easily submit feedback or get help, and you'll receive clean, organized email notifications!

**Questions?** Submit feedback using your new system! 😄

