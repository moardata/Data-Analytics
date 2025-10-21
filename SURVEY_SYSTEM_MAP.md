# 📋 Survey System Architecture Map

## 🎯 **Current Implementation Status**

### ✅ **What We've Built:**

1. **Survey Components** (Frontend)
2. **Course Integration** (Test Page)
3. **Form Management** (Forms Page)
4. **Delivery Settings** (Schedule Tab)
5. **API Endpoints** (Backend)

---

## 🏗️ **System Architecture**

### **1. Survey Creation Flow** (Operator Side)

```
┌─────────────────────────────────────────────────────────┐
│                    OPERATOR WORKFLOW                      │
└─────────────────────────────────────────────────────────┘

Step 1: Create Survey
   /forms (Forms Page)
   ↓
   - Click "Create New Survey"
   - Use FormBuilderEnhanced to design questions
   - Add fields (rating, text, multiple choice, etc.)
   - Save survey to database

Step 2: Configure Delivery
   /forms → Schedule Tab
   ↓
   - Select survey from "My Surveys"
   - Configure delivery settings:
     • Frequency: once, daily, weekly, monthly
     • Auto-show: true/false
     • Delay: 0-60 seconds
     • Allow skip: true/false
   - Set as "Active"

Step 3: Test Survey
   /forms → "Test Survey" button
   ↓
   - Opens test course in new tab
   - Complete module to trigger survey
   - See how students will experience it
```

---

### **2. Survey Delivery Flow** (Student Side)

```
┌─────────────────────────────────────────────────────────┐
│                    STUDENT WORKFLOW                       │
└─────────────────────────────────────────────────────────┘

Step 1: Student Enters Course
   /courses/[courseId]
   ↓
   - Student navigates to course page
   - Course page loads with modules
   - StudentFormDelivery component mounts

Step 2: Trigger Event Occurs
   Student completes module 2 or final module
   ↓
   - handleModuleComplete() fires
   - Checks if survey should be shown
   - Sets showSurvey = true after 2 second delay

Step 3: Survey Appears
   StudentFormDelivery component renders
   ↓
   - Fetches form data from /api/forms/active
   - Falls back to /api/forms/test if no real form
   - Shows modal with survey questions

Step 4: Student Responds
   Student fills out or skips survey
   ↓
   - Submit: POST to /api/forms/submit
   - Skip: Store skip preference in localStorage
   - Frequency tracking: Store completion timestamp
```

---

## 🗂️ **File Structure & Responsibilities**

### **Frontend Components**

```
components/
├── StudentFormDelivery.tsx
│   └── Main survey modal for students
│       • Auto-show logic
│       • Frequency tracking (localStorage)
│       • Form fetching and submission
│       • Skip/complete handling
│
├── FormDeliverySettings.tsx
│   └── Operator control panel
│       • Frequency configuration
│       • Auto-show toggle
│       • Delay settings
│       • Active/inactive status
│
├── FormBuilderEnhanced.tsx
│   └── Survey creation tool
│       • Visual form builder
│       • Field type selection
│       • Templates and presets
│       • Live preview
│
├── DataForm.tsx
│   └── Dynamic form renderer
│       • Renders any field type
│       • Validation
│       • Response collection
│
├── CourseSurvey.tsx
│   └── Embedded course survey (alternative)
│       • For inline course surveys
│       • Not modal-based
│
└── SurveyModal.tsx
    └── Generic survey modal (alternative)
        • Reusable modal component
        • Manual trigger
```

---

### **Frontend Pages**

```
app/
├── forms/page.tsx
│   └── Main surveys management page
│       • Tab navigation (My Surveys, Customize, Schedule, etc.)
│       • Survey creation
│       • Delivery settings
│       • "Test Survey" button
│
├── courses/page.tsx
│   └── Course listing page (operator view)
│       • Shows all courses
│       • "Test Survey System" card
│       • Sync courses button
│
└── courses/[courseId]/page.tsx
    └── Individual course page (student view)
        • Module listing
        • Progress tracking
        • Survey delivery integration
        • Debug panel (development only)
```

---

### **Backend API Routes**

```
app/api/
├── forms/
│   ├── active/route.ts
│   │   └── GET: Fetch active forms for company/course
│   │       • Returns first active form
│   │       • Filters by company ID
│   │
│   ├── public/route.ts
│   │   └── GET: Fetch public form data
│   │       • Form ID → Form data
│   │       • Used by survey components
│   │
│   ├── submit/route.ts
│   │   └── POST: Submit form responses
│   │       • Stores submission in database
│   │       • Tracks metadata (course, frequency, etc.)
│   │
│   ├── test/route.ts
│   │   └── GET: Returns test form (no database)
│   │       • Fallback for testing
│   │       • Pre-defined test questions
│   │
│   └── create/route.ts
│       └── POST: Create new form
│           • Stores form template in database
│           • Associates with company
│
└── courses/
    └── sync/route.ts
        └── POST: Sync courses from Whop
            • Fetches courses via Whop API
            • Updates database
```

---

## 🔄 **Data Flow Diagram**

```
┌──────────────────────────────────────────────────────────────────┐
│                        COMPLETE DATA FLOW                          │
└──────────────────────────────────────────────────────────────────┘

1. OPERATOR CREATES SURVEY
   ┌─────────────┐
   │ Operator    │
   │ Creates     │
   │ Survey      │
   └──────┬──────┘
          │
          ↓
   ┌─────────────────┐
   │ FormBuilder     │
   │ Enhanced        │
   └──────┬──────────┘
          │
          ↓
   POST /api/forms/create
          │
          ↓
   ┌─────────────────┐
   │ Supabase DB     │
   │ form_templates  │
   └─────────────────┘

2. OPERATOR CONFIGURES DELIVERY
   ┌─────────────────┐
   │ Operator Sets   │
   │ Delivery        │
   │ Settings        │
   └──────┬──────────┘
          │
          ↓
   ┌─────────────────┐
   │ FormDelivery    │
   │ Settings        │
   └──────┬──────────┘
          │
          ↓
   UPDATE form_templates
   (is_active, frequency, etc.)

3. STUDENT TRIGGERS SURVEY
   ┌─────────────────┐
   │ Student         │
   │ Completes       │
   │ Module          │
   └──────┬──────────┘
          │
          ↓
   handleModuleComplete()
          │
          ↓
   setShowSurvey(true)
          │
          ↓
   ┌─────────────────┐
   │ StudentForm     │
   │ Delivery        │
   └──────┬──────────┘
          │
          ↓
   GET /api/forms/active
          │
          ↓
   ┌─────────────────┐
   │ Return Active   │
   │ Form            │
   └──────┬──────────┘
          │
          ↓
   Display Survey Modal

4. STUDENT SUBMITS RESPONSE
   ┌─────────────────┐
   │ Student Fills   │
   │ Out Survey      │
   └──────┬──────────┘
          │
          ↓
   handleSubmit()
          │
          ↓
   POST /api/forms/submit
          │
          ↓
   ┌─────────────────┐
   │ Supabase DB     │
   │ form_submissions│
   └─────────────────┘
          │
          ↓
   localStorage.setItem()
   (Track completion for frequency)
```

---

## 🎯 **Current State: What's Missing**

### **❌ What's NOT Working Yet:**

1. **Real Whop Course Integration**
   - Test course is mock data
   - Need to integrate with actual Whop courses
   - Need real course IDs from Whop

2. **Database Form Storage**
   - Forms are created but not stored persistently
   - Need to save to Supabase `form_templates` table
   - Currently using test form fallback

3. **Delivery Settings Persistence**
   - Settings are configured but not saved
   - Need to update database when settings change
   - Currently only in component state

4. **Frequency Tracking**
   - Uses localStorage (client-side only)
   - Should use database for cross-device tracking
   - Need to query previous submissions

---

## 🚀 **How to Actually Test It RIGHT NOW**

### **Option 1: Test with Mock Data (Currently Works)**

```bash
1. Go to /forms page
2. Click "Test Survey" button (top-right)
3. New tab opens → /courses/test-course
4. See debug panel in bottom-right
5. Click "Start Module" on module 2
6. Wait 2 seconds → Survey appears!
7. Fill out test form (rating, feedback, recommendation)
8. Submit or skip
```

### **Option 2: Test with Real Form (Needs Setup)**

```bash
1. Create database tables (form_templates, form_submissions)
2. Go to /forms page → My Surveys tab
3. Click "Create New Survey"
4. Build your survey in FormBuilderEnhanced
5. Save to database
6. Go to Schedule tab
7. Configure delivery (frequency, auto-show, etc.)
8. Make it active
9. Go to test course
10. Survey now shows your custom form!
```

---

## 🔧 **What Needs to Happen for Production**

### **Phase 1: Database Integration** (Next Step)

- [ ] Create/verify database tables
- [ ] Save forms to `form_templates`
- [ ] Save responses to `form_submissions`
- [ ] Query active forms by company ID
- [ ] Store delivery settings

### **Phase 2: Whop Course Integration**

- [ ] Fetch real courses from Whop API
- [ ] Replace mock course data
- [ ] Use real course/lesson IDs
- [ ] Track actual module completion

### **Phase 3: Smart Delivery Logic**

- [ ] Server-side frequency tracking
- [ ] Course-specific form mapping
- [ ] Completion state management
- [ ] Cross-device synchronization

### **Phase 4: Analytics & Reporting**

- [ ] Response analytics
- [ ] Completion rates
- [ ] Export to CSV/PDF
- [ ] Real-time insights

---

## 🎓 **Summary: How It Works**

### **Simple Version:**

1. **Operator creates survey** → Saved to database
2. **Operator sets delivery rules** → When/how often to show
3. **Student takes course** → Completes modules
4. **System checks rules** → Should we show survey?
5. **Survey appears** → Student fills it out
6. **Response saved** → Analytics updated

### **Current Version:**

1. **Operator creates survey** → ⚠️ Not saved yet (using test form)
2. **Operator sets delivery rules** → ⚠️ Not saved yet (component state only)
3. **Student takes course** → ✅ Mock course works
4. **System checks rules** → ✅ Logic implemented
5. **Survey appears** → ✅ Modal works
6. **Response saved** → ⚠️ Partially (needs database)

---

## 📍 **Where You Are Now**

```
YOU ARE HERE: Testing Phase with Mock Data
              ↓
┌─────────────────────────────────────────┐
│ ✅ Components Built                     │
│ ✅ UI/UX Complete                       │
│ ✅ Logic Implemented                    │
│ ⚠️  Database Integration Pending        │
│ ⚠️  Real Course Integration Pending     │
└─────────────────────────────────────────┘
```

### **To Actually See It Work:**

**RIGHT NOW:** Click "Test Survey" button in /forms page → Complete module 2 → Survey appears!

**The system is 80% complete** - it just needs database hookup and real Whop course data! 🎯

