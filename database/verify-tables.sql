-- Verify Course Tables Were Created Successfully
-- Run this in Supabase SQL Editor to confirm migration worked

-- Check that all 4 tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('courses', 'course_lessons', 'course_enrollments', 'lesson_interactions')
ORDER BY table_name;

-- Expected output: 4 rows
-- course_enrollments
-- course_lessons
-- courses
-- lesson_interactions

-- Check table structures
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name IN ('courses', 'course_lessons', 'course_enrollments', 'lesson_interactions')
ORDER BY table_name, ordinal_position;

-- Check RLS is enabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename IN ('courses', 'course_lessons', 'course_enrollments', 'lesson_interactions');

-- Should show rls_enabled = true for all 4 tables

-- Check indexes were created
SELECT 
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public' 
AND tablename IN ('courses', 'course_lessons', 'course_enrollments', 'lesson_interactions')
ORDER BY tablename, indexname;

-- Check trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name = 'trigger_update_enrollment_progress';

-- Should return 1 row showing the trigger on lesson_interactions table

