'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CourseSurvey from '@/components/CourseSurvey';

function CourseSurveyContent({ formId }: { formId: string }) {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId') || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] p-4">
      <div className="max-w-4xl mx-auto">
        <CourseSurvey 
          formId={formId}
          companyId={companyId || ''}
          autoShow={true}
          triggerText="📝 Course Feedback"
          triggerButtonText="Share Your Thoughts"
        />
      </div>
    </div>
  );
}

export default function CourseSurveyPage({ params }: { params: { courseId: string; formId: string } }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981]"></div>
      </div>
    }>
      <CourseSurveyContent formId={params.formId} />
    </Suspense>
  );
}
