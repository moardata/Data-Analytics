import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';

/**
 * Survey Trigger API
 * Creates survey triggers for Whop courses
 * Allows surveys to be embedded or triggered within course content
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      formId, 
      companyId, 
      courseId, 
      triggerType, 
      triggerConfig 
    } = body;

    if (!formId || !companyId) {
      return NextResponse.json(
        { error: 'Form ID and Company ID are required' },
        { status: 400 }
      );
    }

    // Get the client record for this company
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('company_id', companyId)
      .single();

    if (clientError || !clientData) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Verify the form exists and belongs to this company
    const { data: form, error: formError } = await supabase
      .from('form_templates')
      .select('*')
      .eq('id', formId)
      .eq('client_id', clientData.id)
      .eq('is_active', true)
      .single();

    if (formError || !form) {
      return NextResponse.json(
        { error: 'Form not found or inactive' },
        { status: 404 }
      );
    }

    // Generate survey URLs for different trigger types
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://data-analytics-gold.vercel.app';
    
    const surveyUrls = {
      // Direct form access
      direct: `${baseUrl}/forms/public/${formId}?companyId=${companyId}`,
      
      // Course-embedded survey
      course: `${baseUrl}/courses/${courseId || 'default'}/survey/${formId}?companyId=${companyId}`,
      
      // Modal popup (for JavaScript integration)
      modal: `${baseUrl}/api/surveys/modal/${formId}?companyId=${companyId}`,
      
      // Iframe embed (for course content)
      embed: `${baseUrl}/api/surveys/embed/${formId}?companyId=${companyId}`,
    };

    return NextResponse.json({
      success: true,
      form: {
        id: form.id,
        name: form.name,
        description: form.description,
        fields: form.fields,
      },
      urls: surveyUrls,
      embedCode: `
<!-- Survey Embed Code -->
<iframe 
  src="${surveyUrls.embed}" 
  width="100%" 
  height="600" 
  frameborder="0"
  style="border-radius: 8px;"
  title="${form.name}">
</iframe>
      `.trim(),
      modalCode: `
<!-- Survey Modal Trigger -->
<script>
function openSurvey() {
  const modal = document.createElement('div');
  modal.innerHTML = \`
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(0,0,0,0.5); z-index: 9999; display: flex; 
                align-items: center; justify-content: center;">
      <iframe src="${surveyUrls.modal}" 
              width="600" height="500" 
              style="border-radius: 8px; background: white;">
      </iframe>
    </div>
  \`;
  document.body.appendChild(modal);
}
</script>
<button onclick="openSurvey()">Take Survey</button>
      `.trim(),
    });

  } catch (error: any) {
    console.error('Error creating survey trigger:', error);
    return NextResponse.json(
      { error: 'Failed to create survey trigger' },
      { status: 500 }
    );
  }
}
