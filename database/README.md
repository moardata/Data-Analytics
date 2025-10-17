# Database Setup Guide

This folder contains the SQL schema and setup scripts for the Whop Creator Analytics application.

## 📁 Files Overview

| File | Purpose | When to Run |
|------|---------|-------------|
| `01-schema.sql` | Creates all tables, indexes, triggers, and functions | **Run FIRST** on new Supabase project |
| `02-rls-policies.sql` | Sets up Row Level Security (RLS) policies | **Run SECOND** after schema |
| `03-seed-data.sql` | Inserts sample test data (optional) | **Run THIRD** for development/testing only |

## 🚀 Quick Start

### For Fresh Setup

Run these files **in order** in your Supabase SQL Editor:

1. **01-schema.sql** - Creates the database structure
2. **02-rls-policies.sql** - Enables multi-tenant security
3. **03-seed-data.sql** - (Optional) Adds test data

### For Existing Database

If you already have tables and want to rebuild:

```sql
-- ⚠️ WARNING: This will delete ALL data!
-- Drop all tables (in correct order to handle dependencies)
DROP TABLE IF EXISTS lesson_interactions CASCADE;
DROP TABLE IF EXISTS course_enrollments CASCADE;
DROP TABLE IF EXISTS course_lessons CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS webhook_events CASCADE;
DROP TABLE IF EXISTS ai_text_pool CASCADE;
DROP TABLE IF EXISTS ai_runs CASCADE;
DROP TABLE IF EXISTS form_submissions CASCADE;
DROP TABLE IF EXISTS form_templates CASCADE;
DROP TABLE IF EXISTS insights CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS entities CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- Now run 01-schema.sql, then 02-rls-policies.sql
```

## 📊 Database Schema

### Core Tables
- **clients** - Whop creators using your app
- **entities** - Students/members for each creator
- **events** - Webhook events and activity tracking
- **subscriptions** - Student subscription data

### Feature Tables
- **insights** - AI-generated insights and recommendations
- **ai_runs** - Tracks AI processing jobs
- **ai_text_pool** - Stores text for AI analysis
- **form_templates** - Custom form definitions
- **form_submissions** - Form response data

### Course Tables (Whop Integration)
- **courses** - Course information from Whop
- **course_lessons** - Individual lessons
- **course_enrollments** - Student enrollments
- **lesson_interactions** - Lesson progress tracking

### System Tables
- **webhook_events** - Audit log of all incoming webhooks

## 🔒 Security Features

### Row Level Security (RLS)
All tables have RLS enabled to ensure:
- Creators only see their own data
- Multi-tenant isolation
- Secure data access

### Helper Functions
- `set_user_context(user_id, client_id)` - Sets context for RLS
- `get_current_client_id()` - Retrieves current client ID
- `update_updated_at_column()` - Auto-updates timestamps

## 🔍 Verification Queries

After running the scripts, verify everything is set up correctly:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check indexes exist
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY indexname;

-- Check policies exist
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

## 🛠️ Troubleshooting

### Error: "permission denied for schema public"
Your database user needs proper permissions. Run as superuser:
```sql
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
```

### Error: "relation already exists"
Tables already exist. Either:
1. Drop existing tables first (see "For Existing Database" above)
2. Or ignore the error (script uses `IF NOT EXISTS`)

### RLS policies not working
Make sure you're using the service role key in API routes:
```typescript
import { supabaseServer } from '@/lib/supabase-server';
// Use supabaseServer (not supabase) for server-side operations
```

## 📝 Environment Variables Required

Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🔄 Migration Notes

When making schema changes:
1. Create a new migration file (e.g., `04-add-feature.sql`)
2. Test locally first
3. Run on production during low-traffic periods
4. Always backup before major changes

## 📚 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)
- [Supabase Best Practices](https://supabase.com/docs/guides/database/postgres/best-practices)

