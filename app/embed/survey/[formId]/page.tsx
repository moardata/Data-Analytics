'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataForm } from '@/components/DataForm';
import { CheckCircle, Loader2 } from 'lucide-react';

function EmbedSurveyContent({ formId }: { formId: string }) {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');
  const lessonId = searchParams.get('lessonId');
  const courseId = searchParams.get('courseId');
  
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchForm();
  }, [formId, companyId]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching embed form:', formId, 'for company:', companyId);
      
      // Try to fetch the real form first
      const response = await fetch(`/api/forms/public?formId=${formId}&companyId=${companyId}`);
      const data = await response.json();

      if (response.ok && data.form) {
        console.log('Real form found:', data.form);
        setForm(data.form);
      } else {
        console.log('No real form found, trying test form...');
        // Fallback to test form
        const testResponse = await fetch('/api/forms/test');
        const testData = await testResponse.json();
        
        if (testResponse.ok && testData.form) {
          console.log('Using test form:', testData.form);
          setForm(testData.form);
        } else {
          setError('Survey not found');
        }
      }
    } catch (error) {
      console.error('Error fetching form:', error);
      setError('Failed to load survey');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (responses: Record<string, any>) => {
    try {
      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: formId,
          entityId: `embed_${lessonId || courseId || Date.now()}`,
          companyId: companyId,
          responses,
          metadata: {
            source: 'whop_embed',
            lessonId,
            courseId,
            embedded: true
          }
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        
        // Post message to parent window (if embedded in iframe)
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'survey_submitted',
            formId,
            lessonId,
            courseId
          }, '*');
        }
      } else {
        alert('Failed to submit survey. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit survey. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] flex items-center justify-center p-4">
        <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg max-w-2xl w-full">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 text-[#10B981] animate-spin mx-auto mb-4" />
            <p className="text-[#9AA4B2] text-lg">Loading survey...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] flex items-center justify-center p-4">
        <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg max-w-2xl w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h3 className="text-xl font-semibold text-[#E1E4EA] mb-2">Survey Not Available</h3>
            <p className="text-[#9AA4B2]">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] flex items-center justify-center p-4">
        <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg max-w-2xl w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#0B2C24] flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-[#10B981]" />
            </div>
            <h3 className="text-2xl font-bold text-[#E1E4EA] mb-3">
              Thank You!
            </h3>
            <p className="text-[#9AA4B2] text-lg mb-2">
              Your feedback has been submitted successfully.
            </p>
            <p className="text-[#9AA4B2] text-sm">
              You can now continue with the course.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] flex items-center justify-center p-4">
        <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg max-w-2xl w-full">
          <CardContent className="p-8 text-center">
            <p className="text-[#9AA4B2]">Survey not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-xl">
          <CardHeader className="border-b border-[#2A2F36] pb-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#0B2C24] flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold text-[#E1E4EA] mb-2">
                {form.name}
              </CardTitle>
              {form.description && (
                <p className="text-[#9AA4B2] text-base md:text-lg">
                  {form.description}
                </p>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <DataForm
              formId={form.id}
              fields={form.fields}
              onSubmit={handleSubmit}
              title=""
              description=""
            />
          </CardContent>
        </Card>
        
        {/* Branding */}
        <div className="text-center mt-6 text-sm text-[#9AA4B2]">
          Powered by your analytics platform
        </div>
      </div>
    </div>
  );
}

export default async function EmbedSurveyPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <EmbedSurveyContent formId={formId} />
    </Suspense>
  );
}
