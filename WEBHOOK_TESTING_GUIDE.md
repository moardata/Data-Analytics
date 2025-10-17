# 🧪 Webhook Testing Guide for CreatorIQ

## 📋 Overview

This guide shows you how to test webhook functionality and verify that data flows correctly from Whop to your CreatorIQ app.

## 🎯 What You Can Test

### ✅ **Supported Webhook Events**
Your app processes these Whop webhook events:

1. **Payment Events**
   - `payment.succeeded` - Successful payments
   - `payment.failed` - Failed payments
   - `payment.refunded` - Refunds
   - `payment.disputed` - Payment disputes
   - `payment.dispute_resolved` - Dispute resolutions

2. **Membership Events**
   - `membership.created` - New subscriptions
   - `membership.renewed` - Subscription renewals
   - `membership.cancelled` - Cancelled subscriptions
   - `membership.expired` - Expired subscriptions

3. **Activity Events** (if available)
   - `user.*` - User activity events
   - `activity.*` - General activity events

## 🔧 Testing Methods

### **Method 1: Whop Developer Tools (Recommended)**

1. **Access Whop Developer Hub**
   - Go to https://whop.com/apps
   - Find your CreatorIQ app
   - Click on your app

2. **Enable Webhook Testing**
   - Go to "Webhooks" section
   - Look for "Test Webhooks" or "Send Test Events"
   - Whop should have mock data generators

3. **Test Different Events**
   - Send a `payment.succeeded` event
   - Send a `membership.created` event
   - Check your app's analytics dashboard

### **Method 2: Manual Webhook Testing**

1. **Get Your Webhook URL**
   ```
   https://your-app-domain.vercel.app/api/webhooks
   ```

2. **Test with curl (if you have webhook secret)**
   ```bash
   curl -X POST https://your-app-domain.vercel.app/api/webhooks \
     -H "Content-Type: application/json" \
     -H "X-Whop-Signature: your-signature" \
     -d '{
       "action": "payment.succeeded",
       "data": {
         "user_id": "test_user_123",
         "final_amount": 29.99,
         "currency": "USD",
         "product_id": "test_product",
         "plan_id": "plan_hnYnLn6egXRis"
       }
     }'
   ```

### **Method 3: Check Webhook Logs**

1. **View Webhook Events Table**
   - Go to your Supabase dashboard
   - Check the `webhook_events` table
   - Look for incoming webhooks and their processing status

2. **Check Application Logs**
   - Vercel dashboard → Functions → View logs
   - Look for webhook processing messages

## 📊 What to Look For

### **✅ Successful Webhook Processing**

1. **In Supabase `webhook_events` table:**
   - Status: `received` → `processing` → `completed`
   - No error messages

2. **In Supabase `events` table:**
   - New event records with proper `event_type`
   - Correct `event_data` with payment/subscription info

3. **In Supabase `entities` table:**
   - New user records created
   - Proper `client_id` association

4. **In Supabase `subscriptions` table:**
   - New subscription records for membership events
   - Correct status and plan information

### **✅ Dashboard Updates**

After webhook processing, check your analytics dashboard:

1. **Student Count** - Should increase with new users
2. **Revenue Metrics** - Should update with payment events
3. **Subscription Status** - Should reflect membership changes
4. **Engagement Data** - Should show activity events

## 🚨 Troubleshooting

### **Common Issues**

1. **Webhook Not Received**
   - Check webhook URL in Whop settings
   - Verify webhook secret matches
   - Check Vercel function logs

2. **Webhook Received But Failed**
   - Check `webhook_events` table for error messages
   - Verify database permissions
   - Check for missing required fields

3. **Data Not Appearing in Dashboard**
   - Verify `company_id` matches your test company
   - Check if client record exists
   - Ensure proper data normalization

### **Debug Steps**

1. **Check Webhook Events Table**
   ```sql
   SELECT * FROM webhook_events 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

2. **Check Events Table**
   ```sql
   SELECT * FROM events 
   WHERE client_id = 'your-client-id'
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

3. **Check Entities Table**
   ```sql
   SELECT * FROM entities 
   WHERE client_id = 'your-client-id'
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

## 🎯 Testing Checklist

### **Before Testing**
- [ ] Webhook URL configured in Whop
- [ ] Webhook secret matches environment variable
- [ ] App deployed to production
- [ ] Database tables exist and have proper permissions

### **During Testing**
- [ ] Send test payment webhook
- [ ] Send test membership webhook
- [ ] Check webhook_events table for processing
- [ ] Verify data appears in events/entities tables
- [ ] Check analytics dashboard updates

### **After Testing**
- [ ] Student count increased
- [ ] Revenue metrics updated
- [ ] Subscription status correct
- [ ] No error messages in logs

## 🔗 Useful Links

- **Whop Developer Docs**: https://docs.whop.com/sdk/validate-access
- **Whop Webhook Docs**: https://docs.whop.com/webhooks
- **Your App Dashboard**: https://your-app-domain.vercel.app/analytics
- **Supabase Dashboard**: Your project dashboard
- **Vercel Logs**: Your deployment logs

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review webhook_events table for error details
3. Check Vercel function logs
4. Join Whop developers community: https://whop.com/developers/

---

**Note**: Whop's webhook testing capabilities may vary. If they don't have built-in test tools, you may need to create test events manually or wait for real user activity to trigger webhooks.
