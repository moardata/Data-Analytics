/**
 * Course Sync API
 * Fetches and syncs course data from Whop API
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { requireAdminAccess } from '@/lib/auth/whop-auth-unified';

export async function POST(request: NextRequest) {
  try {
    // Require admin access for syncing courses
    const auth = await requireAdminAccess({ request });
    const companyId = auth.companyId;

    // Get client record
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('company_id', companyId)
      .single();

    if (clientError || !clientData) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const clientId = clientData.id;

    // Fetch courses from Whop API
    // Note: You'll need to implement the actual Whop API call here
    // For now, this is a placeholder structure
    
    const whopApiKey = process.env.WHOP_API_KEY;
    const response = await fetch(`https://api.whop.com/api/v5/companies/${companyId}/courses`, {
      headers: {
        'Authorization': `Bearer ${whopApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Whop API error: ${response.statusText}`);
    }

    const coursesData = await response.json();
    const courses = coursesData.data || [];

    let syncedCourses = 0;
    let syncedLessons = 0;

    // Sync each course
    for (const course of courses) {
      // Upsert course
      const { data: syncedCourse, error: courseError } = await supabase
        .from('courses')
        .upsert({
          client_id: clientId,
          whop_course_id: course.id,
          title: course.title || course.name,
          description: course.description,
          thumbnail_url: course.thumbnail_url || course.image_url,
          instructor_name: course.instructor?.name,
          total_lessons: course.lessons?.length || 0,
          total_duration_minutes: course.total_duration || 0,
          is_published: course.is_published !== false,
          metadata: {
            original_data: course,
          },
        }, {
          onConflict: 'whop_course_id',
        })
        .select()
        .single();

      if (courseError) {
        console.error(`Error syncing course ${course.id}:`, courseError);
        continue;
      }

      syncedCourses++;

      // Sync lessons for this course
      if (course.lessons && Array.isArray(course.lessons)) {
        for (const lesson of course.lessons) {
          const { error: lessonError } = await supabase
            .from('course_lessons')
            .upsert({
              course_id: syncedCourse.id,
              whop_lesson_id: lesson.id,
              title: lesson.title || lesson.name,
              description: lesson.description,
              lesson_order: lesson.order || lesson.position || 0,
              duration_minutes: lesson.duration || 0,
              video_url: lesson.video_url,
              content_type: lesson.content_type || 'video',
              is_free_preview: lesson.is_free_preview || false,
              metadata: {
                original_data: lesson,
              },
            }, {
              onConflict: 'whop_lesson_id',
            });

          if (lessonError) {
            console.error(`Error syncing lesson ${lesson.id}:`, lessonError);
            continue;
          }

          syncedLessons++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      syncedCourses,
      syncedLessons,
      message: `Synced ${syncedCourses} courses and ${syncedLessons} lessons`,
    });

  } catch (error: any) {
    console.error('Error syncing courses:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync courses' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireCompanyAccess({ request });
    const companyId = auth.companyId;

    // Get client record
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('company_id', companyId)
      .single();

    if (clientError || !clientData) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const clientId = clientData.id;

    // Get courses with lesson counts
    const { data: courses, error } = await supabase
      .from('courses')
      .select(`
        *,
        lessons:course_lessons(count),
        enrollments:course_enrollments(count)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      courses: courses || [],
      total: courses?.length || 0,
    });

  } catch (error: any) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

