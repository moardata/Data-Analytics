import { NextRequest, NextResponse } from 'next/server';
import { getStudentAllowedSurveys } from '@/lib/auth/student-access';

/**
 * Student Surveys API
 * Returns only surveys that are live and enabled for students
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const userId = searchParams.get('userId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get surveys allowed for this student
    const allowedSurveys = await getStudentAllowedSurveys(companyId, userId);
    
    // For now, return mock data with the allowed surveys
    // In production, this would fetch from your database
    const mockSurveys = [
      {
        id: 'survey-1',
        name: 'Course Feedback Survey',
        description: 'Help us improve this course by sharing your thoughts',
        fields: [
          { id: 'rating', label: 'How would you rate this course?', type: 'rating', required: true },
          { id: 'feedback', label: 'What did you think?', type: 'long_text', required: false }
        ],
        estimatedTime: '3',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        completed: false,
        completedAt: null
      },
      {
        id: 'survey-2',
        name: 'Learning Assessment',
        description: 'Quick quiz to test your understanding',
        fields: [
          { id: 'question1', label: 'What did you learn most?', type: 'radio', required: true },
          { id: 'question2', label: 'Rate your confidence level', type: 'rating', required: true }
        ],
        estimatedTime: '5',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        completed: true,
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
      }
    ];

    // Filter to only include allowed surveys
    const studentSurveys = mockSurveys.filter(survey => 
      allowedSurveys.some(allowed => allowed.surveyId === survey.id)
    );

    return NextResponse.json({
      success: true,
      surveys: studentSurveys,
      total: studentSurveys.length,
      allowedSurveyIds: allowedSurveys.map(s => s.surveyId)
    });

  } catch (error: any) {
    console.error('Error fetching student surveys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch surveys' },
      { status: 500 }
    );
  }
}
