import { NextRequest, NextResponse } from 'next/server';

/**
 * Test Form API
 * Returns a simple test form for debugging
 */

export async function GET(request: NextRequest) {
  try {
    const testForm = {
      id: 'test-form-id',
      name: 'Test Course Feedback',
      description: 'A simple test form for debugging',
      fields: [
        {
          id: 'rating',
          label: 'How would you rate this course?',
          type: 'rating',
          required: true,
          max: 5
        },
        {
          id: 'feedback',
          label: 'What did you think of the course?',
          type: 'long_text',
          required: false,
          placeholder: 'Share your thoughts...'
        },
        {
          id: 'recommend',
          label: 'Would you recommend this course?',
          type: 'radio',
          required: true,
          options: ['Yes', 'No', 'Maybe']
        }
      ],
      is_active: true
    };

    return NextResponse.json({
      success: true,
      form: testForm
    });

  } catch (error: any) {
    console.error('Error creating test form:', error);
    return NextResponse.json(
      { error: 'Failed to create test form' },
      { status: 500 }
    );
  }
}
