'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataForm } from './DataForm';
import { X, Clock, Users, Settings, CheckCircle } from 'lucide-react';

interface StudentFormDeliveryProps {
  formId: string;
  companyId: string;
  courseId?: string;
  autoShow?: boolean;
  delay?: number;
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
  allowSkip?: boolean;
  title?: string;
  description?: string;
}

export default function StudentFormDelivery({
  formId,
  companyId,
  courseId,
  autoShow = true,
  delay = 3000,
  frequency = 'once',
  allowSkip = true,
  title = "Course Feedback",
  description = "Help us improve by sharing your thoughts"
}: StudentFormDeliveryProps) {
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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
      console.log('Fetching form:', formId, 'for company:', companyId);
      
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
          console.error('Failed to fetch test form:', testData.error);
        }
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
          entityId: `student_${courseId || 'course'}_${Date.now()}`,
          companyId: companyId,
          responses,
          metadata: {
            courseId,
            frequency,
            deliveryMethod: 'student_delivery'
          }
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        // Store completion in localStorage to respect frequency settings
        const completionKey = `form_completed_${formId}_${courseId}`;
        localStorage.setItem(completionKey, JSON.stringify({
          completed: true,
          timestamp: Date.now(),
          frequency
        }));
      } else {
        alert('Failed to submit form. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    }
  };

  const handleSkip = () => {
    setSkipped(true);
    // Store skip preference
    const skipKey = `form_skipped_${formId}_${courseId}`;
    localStorage.setItem(skipKey, JSON.stringify({
      skipped: true,
      timestamp: Date.now()
    }));
  };

  const handleClose = () => {
    setShowForm(false);
  };

  // Check if form should be shown based on frequency settings
  const shouldShowForm = () => {
    if (!autoShow) return false;
    
    const completionKey = `form_completed_${formId}_${courseId}`;
    const skipKey = `form_skipped_${formId}_${courseId}`;
    
    const completed = localStorage.getItem(completionKey);
    const skipped = localStorage.getItem(skipKey);
    
    if (completed && frequency === 'once') return false;
    if (skipped && !allowSkip) return false;
    
    // Check frequency-based logic
    if (completed) {
      const data = JSON.parse(completed);
      const now = Date.now();
      const timeDiff = now - data.timestamp;
      
      switch (frequency) {
        case 'daily':
          return timeDiff > 24 * 60 * 60 * 1000; // 24 hours
        case 'weekly':
          return timeDiff > 7 * 24 * 60 * 60 * 1000; // 7 days
        case 'monthly':
          return timeDiff > 30 * 24 * 60 * 60 * 1000; // 30 days
        default:
          return false;
      }
    }
    
    return true;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="w-8 h-8 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#9AA4B2]">Loading survey...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!showForm) {
    return null;
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#0B2C24] flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-[#10B981]" />
            </div>
            <h3 className="text-lg font-semibold text-[#E1E4EA] mb-2">
              Thank You!
            </h3>
            <p className="text-[#9AA4B2] mb-4">
              Your feedback has been submitted successfully.
            </p>
            <Button
              onClick={handleClose}
              className="w-full bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]"
            >
              Continue to Course
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (skipped) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg max-w-md w-full">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-[#E1E4EA] mb-2">
              Survey Skipped
            </h3>
            <p className="text-[#9AA4B2] mb-4">
              You can always provide feedback later if you change your mind.
            </p>
            <Button
              onClick={handleClose}
              className="w-full bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]"
            >
              Continue to Course
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-[#E1E4EA] flex items-center gap-2">
              <Users className="h-5 w-5 text-[#10B981]" />
              {title}
            </CardTitle>
            <p className="text-sm text-[#9AA4B2] mt-1">
              {description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="ghost"
              size="sm"
              className="text-[#9AA4B2] hover:text-[#E1E4EA]"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="text-[#9AA4B2] hover:text-[#E1E4EA]"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {showSettings && (
            <div className="p-4 bg-[#0B2C24] border border-[#17493A] rounded-lg">
              <h4 className="text-sm font-semibold text-[#E1E4EA] mb-2">Survey Settings</h4>
              <div className="space-y-2 text-xs text-[#9AA4B2]">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Frequency: {frequency}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  Participation: {allowSkip ? 'Optional' : 'Required'}
                </div>
              </div>
            </div>
          )}

          {form ? (
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

          {allowSkip && (
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSkip}
                variant="outline"
                className="flex-1 border-[#2A2F36] text-[#9AA4B2] hover:bg-[#2A2F36]"
              >
                Skip Survey
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
