'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataForm } from '@/components/DataForm';
import { Loader2 } from 'lucide-react';

interface FormTemplate {
  id: string;
  name: string;
  description?: string;
  fields: any[];
  is_active: boolean;
}

function PublicFormContent({ formId }: { formId: string }) {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');
  
  const [form, setForm] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchForm();
  }, [formId, companyId]);

  const fetchForm = async () => {
    try {
      if (!companyId) {
        console.error('Company ID is required');
        return;
      }

      const response = await fetch(`/api/forms/public?formId=${formId}&companyId=${companyId}`);
      const data = await response.json();

      if (response.ok) {
        setForm(data.form);
      } else {
        console.error('Failed to fetch form:', data.error);
      }
    } catch (error) {
      console.error('Error fetching form:', error);
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
          entityId: `public_${Date.now()}`, // Generate temporary entity ID
          companyId: companyId,
          responses,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert('Failed to submit form. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#10B981]" />
          <p className="text-[#9AA4B2]">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] flex items-center justify-center">
        <Card className="max-w-md w-full border border-[#2A2F36] bg-[#171A1F]">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-[#E1E4EA] mb-2">Form Not Found</h2>
            <p className="text-[#9AA4B2]">This form may have been removed or is no longer available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] flex items-center justify-center">
        <Card className="max-w-md w-full border border-[#2A2F36] bg-[#171A1F]">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#0B2C24] flex items-center justify-center">
              <svg className="w-8 h-8 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#E1E4EA] mb-2">Thank You!</h2>
            <p className="text-[#9AA4B2]">Your response has been submitted successfully.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] p-8">
      <div className="max-w-3xl mx-auto">
        <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-[#E1E4EA]">
              {form.name}
            </CardTitle>
            {form.description && (
              <p className="text-[#9AA4B2] mt-2">{form.description}</p>
            )}
          </CardHeader>
          <CardContent>
            <DataForm
              formId={form.id}
              fields={form.fields}
              onSubmit={handleSubmit}
              title=""
              description=""
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PublicFormPage({ params }: { params: { formId: string } }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#10B981]" />
      </div>
    }>
      <PublicFormContent formId={params.formId} />
    </Suspense>
  );
}
