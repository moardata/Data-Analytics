# Whop App Testing Guide - Company ID Association

## 🎯 **Core Testing Requirements**

This guide ensures your Whop app properly associates company IDs with users when they install the app.

---

## 📋 **Testing Checklist**

### ✅ **1. Whop App Configuration**

**Your app URL must be configured as:**
```
https://data-analytics-gold.vercel.app?companyId={{COMPANY_ID}}
```

**Verify in Whop Dashboard:**
- [ ] App URL includes `{{COMPANY_ID}}` placeholder
- [ ] App is installed to a test group/company
- [ ] App permissions include: `read_memberships`, `read_company`

### ✅ **2. Company ID Detection Testing**

**Test Methods:**

#### **Method A: Direct URL Test**
```
https://data-analytics-gold.vercel.app/analytics?companyId=biz_3GYHNPbGkZCEky
```

**Expected Result:**
- ✅ Dashboard loads without errors
- ✅ Company ID detected: `biz_3GYHNPbGkZCEky`
- ✅ No "No company context found" error

#### **Method B: Whop Iframe Test**
1. Install app to a test group in Whop
2. Open app from within the group
3. Check browser console for: `✅ Company ID found in URL: biz_xxxxx`

**Expected Result:**
- ✅ App loads automatically
- ✅ Company ID injected by Whop
- ✅ Data filtered by company ID

#### **Method C: Development Testing**
```
http://localhost:3000/analytics?companyId=biz_3GYHNPbGkZCEky
```

**Expected Result:**
- ✅ Local development works
- ✅ Fallback company ID used if needed

---

## 🔍 **Debugging Company ID Issues**

### **Check Browser Console**

Look for these messages:

**✅ Success Messages:**
```
✅ Company ID found in URL: biz_3GYHNPbGkZCEky
✅ Whop auth successful: { userId: "user_xxx", companyId: "biz_xxx", accessLevel: "admin" }
✅ Access verified: user is authorized for company biz_xxx
```

**❌ Error Messages:**
```
❌ No company context found
❌ Whop authentication failed
❌ Access denied: Only course owners and admins can view analytics data
```

### **Common Issues & Solutions**

#### **Issue 1: "No company context found"**

**Causes:**
- Whop app URL not configured with `{{COMPANY_ID}}`
- App not installed to a group
- Accessing app directly (not through Whop)

**Solutions:**
1. ✅ Configure Whop app URL: `https://your-app.com?companyId={{COMPANY_ID}}`
2. ✅ Install app to a test group
3. ✅ Access app from within Whop group

#### **Issue 2: "Whop authentication failed"**

**Causes:**
- Dev proxy not enabled in Whop
- Invalid API keys
- App not properly configured

**Solutions:**
1. ✅ Enable dev proxy in Whop app settings
2. ✅ Verify API keys in environment variables
3. ✅ Check app permissions

#### **Issue 3: "Access denied"**

**Causes:**
- User is not admin/owner of the company
- Permission system blocking access

**Solutions:**
1. ✅ Ensure user is admin/owner of the group
2. ✅ Check permission system configuration

---

## 🧪 **Step-by-Step Testing Process**

### **Step 1: Basic Company ID Detection**

1. **Open browser console** (F12)
2. **Navigate to:** `https://data-analytics-gold.vercel.app/analytics?companyId=biz_3GYHNPbGkZCEky`
3. **Check console for:** `✅ Company ID found in URL: biz_3GYHNPbGkZCEky`
4. **Verify:** Dashboard loads without errors

### **Step 2: Whop Iframe Integration**

1. **Go to Whop dashboard:** https://whop.com/apps
2. **Configure app URL:** `https://data-analytics-gold.vercel.app?companyId={{COMPANY_ID}}`
3. **Install app to a test group**
4. **Open app from within the group**
5. **Check console for:** Company ID detection messages
6. **Verify:** App loads with proper company context

### **Step 3: Multi-Tenant Testing**

1. **Create two test groups** in Whop
2. **Install app to both groups**
3. **Open app from Group A**
4. **Verify:** Only Group A data is visible
5. **Open app from Group B**
6. **Verify:** Only Group B data is visible
7. **Confirm:** Complete data isolation

### **Step 4: Sync Functionality**

1. **Open app from a Whop group**
2. **Click "Sync Students from Whop"**
3. **Check console for:** `✅ Admin access verified for sync`
4. **Verify:** Students are imported from Whop
5. **Confirm:** Data appears in dashboard

---

## 🚀 **Production Readiness Checklist**

### **Before Going Live:**

- [ ] **Whop app URL configured** with `{{COMPANY_ID}}`
- [ ] **Company ID detection working** in all scenarios
- [ ] **Multi-tenant isolation verified** (each group sees only their data)
- [ ] **Access control working** (only owners/admins can access)
- [ ] **Sync functionality tested** (students import correctly)
- [ ] **Error handling tested** (graceful failures)
- [ ] **Performance tested** (fast loading times)

### **Environment Variables Verified:**

```bash
# Required for production
NEXT_PUBLIC_WHOP_APP_ID=app_xxxxxxxxxxxxx
WHOP_API_KEY=whop_xxxxxxxxxxxxx
NEXT_PUBLIC_WHOP_COMPANY_ID=biz_3GYHNPbGkZCEky  # Your company ID
NEXT_PUBLIC_WHOP_AGENT_USER_ID=user_xxxxxxxxxxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Optional
BYPASS_WHOP_AUTH=false  # Should be false in production
```

---

## 📞 **Troubleshooting Commands**

### **Test API Endpoints:**

```bash
# Test company context API
curl "https://data-analytics-gold.vercel.app/api/whop/context?companyId=biz_3GYHNPbGkZCEky"

# Test analytics API
curl "https://data-analytics-gold.vercel.app/api/analytics/metrics?companyId=biz_3GYHNPbGkZCEky"

# Test sync API
curl -X POST "https://data-analytics-gold.vercel.app/api/sync/students?companyId=biz_3GYHNPbGkZCEky"
```

### **Check Deployment Status:**

```bash
# Check if app is responding
curl -I "https://data-analytics-gold.vercel.app"

# Check specific page
curl -I "https://data-analytics-gold.vercel.app/analytics"
```

---

## 🎯 **Success Criteria**

**Your app is working correctly when:**

1. ✅ **Company ID automatically detected** when accessing through Whop
2. ✅ **No manual URL parameters needed** in production
3. ✅ **Each group sees only their data** (multi-tenant isolation)
4. ✅ **Only owners/admins can access** analytics
5. ✅ **Students can sync from Whop** successfully
6. ✅ **App loads fast and reliably**

---

## 🔄 **Next Steps After Testing**

1. **Fix any issues** found during testing
2. **Deploy final version** to production
3. **Monitor app performance** in production
4. **Gather user feedback** from real Whop groups
5. **Iterate and improve** based on usage patterns

**The key to success is ensuring the `{{COMPANY_ID}}` placeholder works correctly in your Whop app URL configuration!**
