# Whop App Setup Guide - Company ID Configuration

## 🎯 The Problem

Your app shows "No company context found" because Whop needs to know which company is accessing the app. The company ID must be automatically injected when the app is embedded.

## ✅ The Solution

Configure your Whop app URL with the special `{{COMPANY_ID}}` placeholder that Whop will automatically replace.

---

## 📋 Step-by-Step Setup

### 1. **Go to your Whop App Settings**

Visit: https://whop.com/apps

Select your app and go to the **Settings** or **Configuration** section.

### 2. **Configure the App URL**

Find the field for your app's URL (might be called "App URL", "Iframe URL", or "Embed URL").

**Set it to:**
```
https://data-analytics-gold.vercel.app?companyId={{COMPANY_ID}}
```

**Important:**
- ✅ Use the exact placeholder `{{COMPANY_ID}}` (case-sensitive)
- ✅ Whop will automatically replace this with the actual company ID when embedding
- ✅ This ensures each group sees only their own data

### 3. **Alternative URL Formats (if needed)**

Depending on your Whop app configuration, you might need:

```
https://data-analytics-gold.vercel.app/analytics?companyId={{COMPANY_ID}}
```

Or for the dashboard:
```
https://data-analytics-gold.vercel.app/dashboard/{{COMPANY_ID}}
```

### 4. **Save and Test**

1. Save your Whop app configuration
2. Install the app to a test group/company
3. Open the app from within the Whop group
4. The company ID should now be automatically detected

---

## 🔍 How It Works

### When a User Opens Your App:

1. **User clicks your app in their Whop group**
   - Whop knows which company/group they're in

2. **Whop replaces `{{COMPANY_ID}}`**
   - Original URL: `https://your-app.com?companyId={{COMPANY_ID}}`
   - Becomes: `https://your-app.com?companyId=biz_abc123xyz`

3. **Your app receives the company ID**
   - Client-side: `useCompanyContext()` hook reads it from URL
   - Server-side: API routes read it from query parameters

4. **Data is filtered by company ID**
   - All database queries use this company ID
   - Each group sees only their own data

---

## 🧪 Testing Your Setup

### Method 1: Test with a Real Company ID

If you have a test company:
```
https://data-analytics-gold.vercel.app?companyId=biz_YOUR_ACTUAL_COMPANY_ID
```

### Method 2: Create a Test Company ID

1. Go to your Whop dashboard
2. Create a test group/company
3. Note the company ID (format: `biz_xxxxxxxxxxxxx`)
4. Use it in the URL

### Method 3: Development Testing

For local development:
```
http://localhost:3000?companyId=test_company
```

---

## 🔧 Troubleshooting

### Still seeing "No company context found"?

**Check these:**

1. ✅ **App URL is correctly configured in Whop**
   - Must include `?companyId={{COMPANY_ID}}`
   - Check for typos in the placeholder

2. ✅ **You're accessing the app through Whop**
   - Not accessing the URL directly in your browser
   - Open it from within a Whop group

3. ✅ **The app is installed to a group**
   - The app must be installed to a specific company/group
   - You must be viewing it from that group's context

4. ✅ **Check browser console**
   - Open Developer Tools (F12)
   - Look for messages like "✅ Company ID found in URL: biz_xxx"
   - Or errors that might indicate the issue

### Common Mistakes:

❌ **Wrong:** `https://your-app.com?companyId=COMPANY_ID`
✅ **Correct:** `https://your-app.com?companyId={{COMPANY_ID}}`

❌ **Wrong:** `https://your-app.com?company_id={{COMPANY_ID}}`
✅ **Correct:** `https://your-app.com?companyId={{COMPANY_ID}}` (camelCase)

❌ **Wrong:** Accessing the app directly (not through Whop)
✅ **Correct:** Access the app from within a Whop group

---

## 📝 Example Whop App Configuration

```json
{
  "app_name": "Creator Analytics",
  "app_url": "https://data-analytics-gold.vercel.app?companyId={{COMPANY_ID}}",
  "iframe_url": "https://data-analytics-gold.vercel.app?companyId={{COMPANY_ID}}",
  "permissions": ["read_memberships", "read_company"]
}
```

---

## 🎯 What You Should See

### When properly configured:

1. **In browser console:**
   ```
   ✅ Company ID found in URL: biz_abc123xyz
   ```

2. **In the app:**
   - No error messages
   - Dashboard loads with data
   - "Sync Students" button visible if no data yet

3. **Each group sees:**
   - Only their own students
   - Only their own analytics
   - Only their own data

---

## 🔐 Multi-Tenancy & Security

This setup ensures:

- ✅ **Complete data isolation** - Each company sees only their data
- ✅ **Automatic company detection** - No manual configuration needed
- ✅ **Secure** - Company ID comes from Whop, not user input
- ✅ **Access control** - Only owners/admins can access analytics

---

## 📞 Need Help?

1. Check the browser console for error messages
2. Verify your Whop app URL configuration
3. Ensure you're accessing the app through Whop (not directly)
4. Test with `?companyId=test_company` to verify the app works

---

## ✨ After Setup

Once configured correctly, the app will:

1. ✅ Automatically detect the company ID
2. ✅ Show only that company's data
3. ✅ Allow syncing students from Whop
4. ✅ Restrict access to owners/admins only
5. ✅ Block all student access

**The URL configuration is the key to making everything work automatically!**
