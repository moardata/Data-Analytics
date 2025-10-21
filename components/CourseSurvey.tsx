'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, CheckCircle } from 'lucide-react';
import { DataForm } from '@/components/DataForm';

interface CourseSurveyProps {
  formId: string;
  companyId: string;
  triggerText?: string;
  triggerButtonText?: string;
  autoShow?: boolean;
  delay?: number; // Auto-show after X seconds
}

export function CourseSurvey({ 
  formId, 
  companyId,
  triggerText = "📝 Quick Feedback",
  triggerButtonText = "Take Survey",
  autoShow = false,
  delay = 5000
}: CourseSurveyProps) {
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(autoShow);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchForm();
    
    if (autoShow && delay > 0) {
      const timer = setTimeout(() => {
        setShowForm(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [formId, companyId, autoShow, delay]);

  const fetchForm = async () => {
    try {
      setLoading(true);
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
          entityId: `course_${Date.now()}`,
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
      <Card className="border border-[#2A2F36] bg-[#171A1F]">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#10B981]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!form) {
    return null;
  }

  if (submitted) {
    return (
      <Card className="border border-[#2A2F36] bg-[#0B2C24]">
        <CardContent className="p-4 text-center">
          <CheckCircle className="h-8 w-8 text-[#10B981] mx-auto mb-2" />
          <p className="text-[#E1E4EA] font-semibold">Thank you for your feedback!</p>
        </CardContent>
      </Card>
    );
  }

  if (!showForm) {
    return (
      <Card className="border border-[#2A2F36] bg-[#171A1F] hover:bg-[#1A1E25] transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-[#10B981]" />
              <div>
                <p className="text-[#E1E4EA] font-semibold">{triggerText}</p>
                <p className="text-sm text-[#9AA4B2]">{form.name}</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]"
            >
              {triggerButtonText}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-[#2A2F36] bg-[#171A1F]">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-[#E1E4EA] flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[#10B981]" />
          {form.name}
        </CardTitle>
        {form.description && (
          <p className="text-sm text-[#9AA4B2]">{form.description}</p>
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
  );
}
