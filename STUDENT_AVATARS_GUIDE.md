# Student Names & Photos in Submissions

## Overview
The submission section now displays actual student names and profile photos instead of generic "Student X" placeholders!

## How It Works

### For New Submissions
When a student submits a form, the system automatically:
1. Fetches their profile data from Whop API (username, email, avatar)
2. Stores this information in the `entities` table
3. Displays their real name and photo in the submissions list

### For Existing Mock Data
To enrich existing student records with real Whop data:

1. Go to the **Submissions** tab in the Forms page
2. Click the **"Sync Student Data"** button in the top right
3. The system will:
   - Fetch real user data from Whop API for each student
   - Update entity records with actual names and avatars
   - Refresh the submissions list automatically

## What You'll See

### Submission Cards
Each submission now shows:
- **Student Avatar**: Profile picture from Whop (or a default icon if no avatar)
- **Student Name**: Real username from Whop (or "Anonymous User" if unavailable)
- **Form Name**: Which survey they completed
- **Submission Date & Time**

### Data Storage
Student data is stored in the `entities` table:
```sql
{
  name: "John Doe",              -- Student's username
  email: "john@example.com",     -- Student's email
  metadata: {
    avatar_url: "https://...",   -- Profile picture URL
    source: "form_submission"
  }
}
```

## Technical Details

### Avatar Sources
The system checks for avatars in this order:
1. `metadata.avatar_url`
2. `metadata.avatar`
3. `metadata.profile_picture_url`

### API Endpoint
- **Enrich Students**: `POST /api/admin/enrich-students?companyId={companyId}`
- Fetches data from: `https://api.whop.com/api/v5/users/{userId}`
- Requires: `WHOP_API_KEY` environment variable

### UI Components

#### Forms Page (`app/forms/page.tsx`)
- Added avatar display in submission cards
- Added "Sync Student Data" button
- Shows loading state during enrichment
- Auto-refreshes after sync

#### Submit API (`app/api/forms/submit/route.ts`)
- Automatically fetches user data on first submission
- Creates enriched entity records
- Falls back to generic names if Whop API unavailable

## Environment Requirements

Make sure you have set in your `.env.local`:
```
WHOP_API_KEY=your_whop_api_key_here
```

## Troubleshooting

### Issue: Still seeing "Student X" names
**Solution**: Click the "Sync Student Data" button to enrich existing records

### Issue: No avatars showing
**Possible causes**:
- Whop API key not configured
- Students haven't uploaded profile pictures
- API rate limiting

**Solution**: 
1. Verify `WHOP_API_KEY` is set
2. Check server logs for API errors
3. Wait a few minutes and try syncing again

### Issue: "Sync Student Data" fails
**Check**:
- Console logs for specific error messages
- Whop API key permissions
- Network connectivity to Whop API

## Testing

### With Real Whop Users
1. Have real users submit forms
2. Their profiles should appear automatically with avatars

### With Mock Data
1. Run the enrichment sync
2. Only users with real Whop IDs will get enriched
3. Mock/test users (IDs starting with `user_biz_`) are skipped

## Benefits

✅ **Better UX**: See who actually submitted each form
✅ **Professional Look**: Real photos and names
✅ **Easy Sync**: One-click enrichment for existing data
✅ **Automatic**: New submissions auto-enrich
✅ **Graceful Fallbacks**: Works even if Whop API is unavailable

## Next Steps

1. Click "Sync Student Data" to update existing submissions
2. Test by having a student submit a new form
3. Verify their name and photo appear correctly
4. Monitor the enrichment process in server logs

---

Need help? Check server logs for detailed information about the enrichment process.

