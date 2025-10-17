-- Add Course Tables for CreatorIQ
-- Run this after confirming you have courses:read and course_lesson_interaction:read permissions

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  whop_course_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  instructor_name TEXT,
  total_lessons INTEGER DEFAULT 0,
  total_duration_minutes INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course lessons table
CREATE TABLE IF NOT EXISTS course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  whop_lesson_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  lesson_order INTEGER NOT NULL,
  duration_minutes INTEGER DEFAULT 0,
  video_url TEXT,
  content_type TEXT, -- 'video', 'text', 'quiz', 'assignment'
  is_free_preview BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course enrollments (who's taking what course)
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  whop_enrollment_id TEXT UNIQUE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(entity_id, course_id)
);

-- Lesson progress tracking
CREATE TABLE IF NOT EXISTS lesson_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
  whop_interaction_id TEXT UNIQUE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER DEFAULT 0,
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  is_completed BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(entity_id, lesson_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_courses_client_id ON courses(client_id);
CREATE INDEX IF NOT EXISTS idx_courses_whop_id ON courses(whop_course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_course_id ON course_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_whop_id ON course_lessons(whop_lesson_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_client_id ON course_enrollments(client_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_entity_id ON course_enrollments(entity_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_interactions_client_id ON lesson_interactions(client_id);
CREATE INDEX IF NOT EXISTS idx_lesson_interactions_entity_id ON lesson_interactions(entity_id);
CREATE INDEX IF NOT EXISTS idx_lesson_interactions_lesson_id ON lesson_interactions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_interactions_enrollment_id ON lesson_interactions(enrollment_id);

-- RLS Policies
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_interactions ENABLE ROW LEVEL SECURITY;

-- Courses policies
CREATE POLICY "Users can view courses for their client"
  ON courses FOR SELECT
  USING (client_id IN (SELECT id FROM clients WHERE company_id = current_setting('request.jwt.claims', true)::json->>'company_id'));

CREATE POLICY "Service role can manage courses"
  ON courses FOR ALL
  USING (auth.role() = 'service_role');

-- Course lessons policies
CREATE POLICY "Users can view lessons for their client's courses"
  ON course_lessons FOR SELECT
  USING (course_id IN (
    SELECT id FROM courses WHERE client_id IN (
      SELECT id FROM clients WHERE company_id = current_setting('request.jwt.claims', true)::json->>'company_id'
    )
  ));

CREATE POLICY "Service role can manage lessons"
  ON course_lessons FOR ALL
  USING (auth.role() = 'service_role');

-- Course enrollments policies
CREATE POLICY "Users can view enrollments for their client"
  ON course_enrollments FOR SELECT
  USING (client_id IN (SELECT id FROM clients WHERE company_id = current_setting('request.jwt.claims', true)::json->>'company_id'));

CREATE POLICY "Service role can manage enrollments"
  ON course_enrollments FOR ALL
  USING (auth.role() = 'service_role');

-- Lesson interactions policies
CREATE POLICY "Users can view lesson interactions for their client"
  ON lesson_interactions FOR SELECT
  USING (client_id IN (SELECT id FROM clients WHERE company_id = current_setting('request.jwt.claims', true)::json->>'company_id'));

CREATE POLICY "Service role can manage lesson interactions"
  ON lesson_interactions FOR ALL
  USING (auth.role() = 'service_role');

-- Functions to update course progress automatically
CREATE OR REPLACE FUNCTION update_enrollment_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Update enrollment progress when lesson interaction changes
  UPDATE course_enrollments
  SET 
    progress_percentage = (
      SELECT COALESCE(AVG(CASE WHEN is_completed THEN 100 ELSE progress_percentage END), 0)
      FROM lesson_interactions
      WHERE enrollment_id = NEW.enrollment_id
    ),
    last_accessed_at = NOW(),
    completed_at = CASE 
      WHEN (
        SELECT COUNT(*) 
        FROM lesson_interactions 
        WHERE enrollment_id = NEW.enrollment_id AND is_completed = true
      ) = (
        SELECT COUNT(*) 
        FROM course_lessons 
        WHERE course_id = (SELECT course_id FROM course_enrollments WHERE id = NEW.enrollment_id)
      ) 
      THEN NOW()
      ELSE NULL
    END
  WHERE id = NEW.enrollment_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_enrollment_progress
AFTER INSERT OR UPDATE ON lesson_interactions
FOR EACH ROW
EXECUTE FUNCTION update_enrollment_progress();

-- Comments for documentation
COMMENT ON TABLE courses IS 'Stores course information from Whop';
COMMENT ON TABLE course_lessons IS 'Stores individual lessons within courses';
COMMENT ON TABLE course_enrollments IS 'Tracks which members are enrolled in which courses';
COMMENT ON TABLE lesson_interactions IS 'Tracks member progress and interactions with lessons';

