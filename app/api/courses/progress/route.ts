/**
 * Course Progress API
 * Tracks and retrieves student progress in courses
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';
import { requireAdminAccess, getCompanyIdFromRequest } from '@/lib/auth/whop-auth-unified';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const auth = await requireAdminAccess({ request });
    const companyId = auth.companyId;
    const courseId = searchParams.get('courseId');
    const entityId = searchParams.get('entityId'); // specific member

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

    let query = supabase
      .from('course_enrollments')
      .select(`
        *,
        course:courses(*),
        entity:entities(id, name, email, whop_user_id),
        interactions:lesson_interactions(
          id,
          lesson_id,
          progress_percentage,
          is_completed,
          time_spent_seconds,
          completed_at
        )
      `)
      .eq('client_id', clientId);

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    if (entityId) {
      query = query.eq('entity_id', entityId);
    }

    const { data: enrollments, error } = await query;

    if (error) throw error;

    // Calculate aggregate stats
    const stats = {
      totalEnrollments: enrollments?.length || 0,
      activeEnrollments: enrollments?.filter(e => !e.completed_at).length || 0,
      completedEnrollments: enrollments?.filter(e => e.completed_at).length || 0,
      averageProgress: enrollments?.length
        ? enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / enrollments.length
        : 0,
    };

    return NextResponse.json({
      enrollments: enrollments || [],
      stats,
    });

  } catch (error: any) {
    console.error('Error fetching course progress:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch course progress' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      companyId, 
      whopUserId, 
      whopCourseId, 
      whopLessonId, 
      progressPercentage, 
      timeSpentSeconds,
      isCompleted 
    } = body;

    if (!companyId || !whopUserId || !whopCourseId || !whopLessonId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

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

    // Get or create entity
    let { data: entity } = await supabase
      .from('entities')
      .select('id')
      .eq('whop_user_id', whopUserId)
      .eq('client_id', clientId)
      .single();

    if (!entity) {
      const { data: newEntity } = await supabase
        .from('entities')
        .insert({
          client_id: clientId,
          whop_user_id: whopUserId,
        })
        .select()
        .single();
      entity = newEntity;
    }

    if (!entity) {
      return NextResponse.json({ error: 'Failed to get or create entity' }, { status: 500 });
    }

    // Get course
    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('whop_course_id', whopCourseId)
      .eq('client_id', clientId)
      .single();

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Get lesson
    const { data: lesson } = await supabase
      .from('course_lessons')
      .select('id')
      .eq('whop_lesson_id', whopLessonId)
      .eq('course_id', course.id)
      .single();

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Get or create enrollment
    let { data: enrollment } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('entity_id', entity.id)
      .eq('course_id', course.id)
      .single();

    if (!enrollment) {
      const { data: newEnrollment } = await supabase
        .from('course_enrollments')
        .insert({
          client_id: clientId,
          entity_id: entity.id,
          course_id: course.id,
        })
        .select()
        .single();
      enrollment = newEnrollment;
    }

    if (!enrollment) {
      return NextResponse.json({ error: 'Failed to get or create enrollment' }, { status: 500 });
    }

    // Upsert lesson interaction
    const { data: interaction, error: interactionError } = await supabase
      .from('lesson_interactions')
      .upsert({
        client_id: clientId,
        entity_id: entity.id,
        lesson_id: lesson.id,
        enrollment_id: enrollment.id,
        progress_percentage: progressPercentage || 0,
        time_spent_seconds: timeSpentSeconds || 0,
        is_completed: isCompleted || false,
        completed_at: isCompleted ? new Date().toISOString() : null,
      }, {
        onConflict: 'entity_id,lesson_id',
      })
      .select()
      .single();

    if (interactionError) {
      console.error('Error recording lesson interaction:', interactionError);
      return NextResponse.json(
        { error: 'Failed to record progress' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      interaction,
    });

  } catch (error: any) {
    console.error('Error recording course progress:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to record progress' },
      { status: 500 }
    );
  }
}

