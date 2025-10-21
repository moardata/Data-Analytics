# 📖 How to Embed Surveys in Whop Courses

## **Step-by-Step Guide**

---

## **🎯 Part 1: Get Your Embed Code**

### **Step 1: Create Your Survey**
1. Go to your app at `/forms`
2. Click the **"Customize"** tab
3. Build your survey using the form builder
4. Add questions (rating, text, multiple choice, etc.)
5. Save your survey

### **Step 2: Get the Embed Code**
1. Click the **"Embed Code"** tab
2. Find your survey in the list
3. You'll see an embed code box with your iframe code
4. Click **"Copy Embed Code"** button
5. ✅ Code is now in your clipboard!

---

## **🎯 Part 2: Paste in Whop Course**

### **Method 1: Using Whop Dashboard (Recommended)**

**Step 1: Open Whop Dashboard**
1. Go to [https://dash.whop.com](https://dash.whop.com)
2. Navigate to your company
3. Go to **Products** or **Experiences**
4. Select your course/product

**Step 2: Edit a Lesson**
1. Click on the course you want to add the survey to
2. Find the lesson where you want the survey
3. Click **"Edit"** on that lesson
4. Look for the content editor

**Step 3: Add the Embed Code**
1. In the lesson content editor, look for:
   - **"HTML"** mode toggle, OR
   - **"Source Code"** button, OR
   - **"<>"** icon (code view)
2. Switch to HTML/code view
3. **Paste your embed code** where you want the survey to appear
4. Example placement:

```markdown
# Lesson 3: Advanced Analytics

Welcome to this lesson! Here's what you'll learn today...

[Your lesson content here]

---

## 📋 Quick Feedback

Please share your thoughts on this lesson:

<iframe 
  src="https://your-app.vercel.app/embed/survey/abc123?companyId=xyz"
  style="width: 100%; min-height: 600px; border: 2px solid #10B981; border-radius: 12px; margin: 20px 0;"
  frameborder="0"
  scrolling="auto"
  title="Course Feedback"
></iframe>

---

[Continue with rest of lesson...]
```

**Step 4: Save the Lesson**
1. Switch back to visual/preview mode to see how it looks
2. Click **"Save"** or **"Update"**
3. ✅ Done! Survey is now live in your course!

---

### **Method 2: If Whop Uses Rich Text Editor**

If Whop's editor doesn't have an HTML mode:

**Step 1: Try Embed Block**
1. Look for an **"Embed"** or **"Custom Code"** block
2. Click to add it
3. Paste your iframe code
4. Save

**Step 2: Alternative - Use Whop's Embed Feature**
1. Some Whop courses have a dedicated **"Embed Content"** option
2. Click it
3. Paste the iframe URL: `https://your-app.vercel.app/embed/survey/abc123?companyId=xyz`
4. Set width: `100%`, height: `600px`
5. Save

---

## **🎯 Part 3: Where to Place Surveys**

### **Best Practices:**

**End of Lesson (Most Common)**
```
Lesson Content
↓
[Video/Text Content]
↓
Survey (get feedback)
↓
Next Lesson Button
```
**Why:** Collect feedback after they've learned the material

**Beginning of Lesson (Quiz/Assessment)**
```
Lesson Start
↓
Survey (test prior knowledge)
↓
[Video/Text Content]
↓
Next Lesson
```
**Why:** Assess what students already know

**Middle of Lesson (Check Understanding)**
```
Part 1 of Lesson
↓
Survey (quick check)
↓
Part 2 of Lesson
```
**Why:** Ensure students understand before continuing

---

## **🧪 Testing Your Embed**

### **Before Publishing:**

1. **Preview the Lesson**
   - Use Whop's preview mode
   - Check if survey appears correctly
   - Test on mobile view

2. **Test the Survey**
   - Fill it out as a student would
   - Submit a test response
   - Check if it saves to your analytics

3. **Check Responsiveness**
   - Desktop view ✅
   - Tablet view ✅
   - Mobile view ✅

---

## **🎨 Customizing the Embed**

### **Change Height:**
```html
<iframe 
  src="..."
  style="width: 100%; min-height: 800px; ..."  ← Change this number
  ...
></iframe>
```

### **Remove Border:**
```html
<iframe 
  src="..."
  style="width: 100%; min-height: 600px; border: none; ..."  ← Change border style
  ...
></iframe>
```

### **Add Margin/Padding:**
```html
<iframe 
  src="..."
  style="width: 100%; min-height: 600px; margin: 40px 0; padding: 20px; ..."
  ...
></iframe>
```

---

## **🔍 Troubleshooting**

### **Problem: Survey doesn't appear**
**Solution:**
- Make sure you're in HTML/code mode, not visual mode
- Check if Whop allows iframe embeds (most do)
- Try the "Embed Block" method instead

### **Problem: Survey is cut off**
**Solution:**
- Increase `min-height` value (try `800px` or `1000px`)
- Remove `max-height` if present

### **Problem: Survey doesn't submit**
**Solution:**
- Check browser console for errors
- Make sure the survey URL is correct
- Test the direct link first (click "Test Survey" in your app)

### **Problem: Survey looks weird on mobile**
**Solution:**
- The survey is already responsive
- Make sure Whop's mobile view allows iframes
- Test in actual mobile device, not just desktop browser resize

---

## **📊 Tracking Responses**

### **After Students Submit:**

1. Go to your app → `/forms`
2. Click **"Analytics"** tab
3. See all responses
4. Export to CSV if needed

### **What Gets Tracked:**
- ✅ All survey responses
- ✅ Timestamp of submission
- ✅ Which form was submitted
- ✅ Company/course context

---

## **🎯 Quick Reference**

### **The Complete Workflow:**

```
┌─────────────────────────────────────┐
│ 1. Create Survey in Your App        │
│    → /forms → Customize tab         │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ 2. Get Embed Code                   │
│    → /forms → Embed Code tab        │
│    → Click "Copy Embed Code"        │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ 3. Open Whop Dashboard              │
│    → dash.whop.com                  │
│    → Your Course → Edit Lesson      │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ 4. Paste Embed Code                 │
│    → Switch to HTML mode            │
│    → Paste iframe code              │
│    → Save                           │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ 5. Students See Survey              │
│    → In the lesson                  │
│    → Fill out & submit              │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ 6. View Responses                   │
│    → Your App → Analytics tab       │
└─────────────────────────────────────┘
```

---

## **💡 Pro Tips**

1. **Test First:** Always test the embed in preview mode before publishing

2. **Clear Instructions:** Add text above/below the survey telling students why you're asking for feedback

3. **Strategic Placement:** Don't overwhelm students - one survey per 3-5 lessons is ideal

4. **Mobile-First:** Most students view on mobile - always test mobile view

5. **Update Surveys:** You can edit surveys in your app and the embed updates automatically!

6. **Multiple Surveys:** You can embed different surveys in different lessons

7. **Reuse Surveys:** Same survey can be embedded in multiple courses/lessons

---

## **🆘 Need Help?**

### **Can't find HTML mode in Whop?**
- Look for: "Source", "Code", "<>", "HTML", or "Custom Code" buttons
- Check Whop's documentation
- Contact Whop support

### **Survey not working?**
1. Test the direct link first (copy from Embed Code tab)
2. Open in new browser tab
3. If it works there, the embed will work in Whop

### **Want to customize the survey design?**
- The survey uses your app's design system
- Edit `app/embed/survey/[formId]/page.tsx` to change styling

---

## **✅ You're Ready!**

You now know how to:
- ✅ Create surveys in your app
- ✅ Get the embed code
- ✅ Paste into Whop courses
- ✅ Track responses
- ✅ Troubleshoot issues

**Start embedding surveys in your Whop courses today!** 🚀

