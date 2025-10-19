# 🛠️ Local Development with Whop Proxy

## Why whop-proxy is Required

When developing Whop apps locally, you MUST use `whop-proxy`. Here's why:

**Without whop-proxy:**
- ❌ No Whop auth headers forwarded
- ❌ Can't test iframe integration
- ❌ Auth will always fail
- ❌ Can't simulate production

**With whop-proxy:**
- ✅ Forwards Whop authentication headers
- ✅ Simulates production iframe environment
- ✅ Auth works locally
- ✅ Can test as if deployed

---

## 🚀 Quick Start

### **1. Install whop-proxy** (Already done!)
```bash
npm install -g @whop-apps/dev-proxy
```

### **2. Run Your App with Proxy**
```bash
# Use this command (NOT npm run dev!)
npm run dev:whop

# Or directly:
whop-proxy --command 'npm run dev'
```

You'll see:
```
🚀 Whop Proxy started on http://localhost:3000
✅ Forwarding requests to your Next.js app
```

### **3. Configure Whop App for Localhost**

Go to: https://whop.com/apps → Your App → Install to test company

**After installing:**
1. Open your app in Whop
2. Click the **Settings** button (top right)
3. Change dropdown from **Production** to **Localhost**
4. Enter port: **3000**
5. Click **Save**

Now your app runs locally but with real Whop auth!

---

## 🧪 Testing Flow

### **Step 1: Start Dev Server**
```bash
npm run dev:whop
```

### **Step 2: Open in Whop**
1. Go to your Whop company
2. Click on your Analytics app
3. Switch to Localhost mode (port 3000)

### **Step 3: Verify**
Check browser console for:
```
✅ Experience ID: exp_xxxxxxxxxxxxx
✅ Access verified: admin
✅ Company ID: biz_3GYHNPbGkZCEky
```

---

## 🔍 Debugging Tips

### **Auth Not Working?**
```bash
# Make sure you're using whop-proxy!
ps aux | grep whop-proxy

# If not running, start it:
npm run dev:whop
```

### **Can't Access in Whop?**
1. Check: App is installed to your company
2. Check: You're in Localhost mode (Settings)
3. Check: Port is 3000
4. Check: whop-proxy is running

### **Still Getting "No company context"?**
- Old cached version in browser
- Clear cache and hard reload (Ctrl+Shift+R)
- Check you changed **App path** to `/experiences/[experienceId]`

---

## 📝 Environment Variables for Local

Create `.env.local` (from `SAFE_ENV_TEMPLATE.md`):
```env
NEXT_PUBLIC_WHOP_APP_ID=app_qMCiZm0xUewsGe
WHOP_API_KEY=your-key
NEXT_PUBLIC_WHOP_AGENT_USER_ID=user_dYz9ieVSw3QEn
NEXT_PUBLIC_WHOP_COMPANY_ID=biz_3GYHNPbGkZCEky

NEXT_PUBLIC_SUPABASE_URL=your-url
SUPABASE_SERVICE_ROLE_KEY=your-key
```

---

## ⚡ Quick Commands

```bash
# Start with whop-proxy (CORRECT!)
npm run dev:whop

# Regular dev (WON'T WORK for Whop auth!)
npm run dev  ❌

# Build for production
npm run build

# Test production build locally
npm run start
```

---

## 🎯 Production vs Localhost

### **Localhost Mode:**
- Uses `http://localhost:3000`
- Run with `npm run dev:whop`
- Only you can see it
- Instant refresh on code changes

### **Production Mode:**
- Uses `https://data-analytics-gold.vercel.app`
- Deployed via Vercel
- All users see it
- Requires git push to update

---

## 🚨 Common Mistakes

❌ **Using `npm run dev`** instead of `npm run dev:whop`
✅ **Always use:** `npm run dev:whop`

❌ **Testing directly at localhost:3000**
✅ **Test through Whop iframe** (Localhost mode)

❌ **App path: `/analytics`**
✅ **App path: `/experiences/[experienceId]`**

---

## 📚 Next Steps

1. **Start proxy:** `npm run dev:whop`
2. **Open in Whop:** Switch to Localhost
3. **Change App Path** in Whop dashboard to `/experiences/[experienceId]`
4. **Test:** Should work without errors!
5. **When ready:** Push to GitHub → Vercel deploys

---

**Use whop-proxy for all local Whop app development! 🎯**

