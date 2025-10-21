'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, CheckCircle } from 'lucide-react';
import { DataForm } from '@/components/DataForm';

interface SurveyModalProps {
  formId: string;
  companyId: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export default function SurveyModal({ 
  formId, 
  companyId, 
  isOpen, 
  onClose, 
  title = "Quick Survey",
  description = "Please take a moment to share your feedback"
}: SurveyModalProps) {
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen && formId) {
      fetchForm();
    }
  }, [isOpen, formId, companyId]);

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
          entityId: `modal_${Date.now()}`,
          companyId: companyId,
          responses,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        // Auto-close after 3 seconds
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        alert('Failed to submit form. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-[#2A2F36] bg-[#171A1F] shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-bold text-[#E1E4EA]">
              {submitted ? 'Thank You!' : (form?.name || title)}
            </CardTitle>
            {!submitted && (form?.description || description) && (
              <p className="text-sm text-[#9AA4B2] mt-1">
                {form?.description || description}
              </p>
            )}
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-[#9AA4B2] hover:text-[#E1E4EA]"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981]"></div>
            </div>
          ) : submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#0B2C24] flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-[#10B981]" />
              </div>
              <h3 className="text-lg font-semibold text-[#E1E4EA] mb-2">
                Response Submitted!
              </h3>
              <p className="text-[#9AA4B2]">
                Thank you for your feedback. This window will close automatically.
              </p>
            </div>
          ) : form ? (
            <DataForm
              formId={form.id}
              fields={form.fields}
              onSubmit={handleSubmit}
              title=""
              description=""
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-[#9AA4B2]">Form not found or unavailable.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
