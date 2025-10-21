'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataForm } from '@/components/DataForm';
import { CheckCircle, Loader2, Eye, Settings, BarChart3, Download, Users, Clock } from 'lucide-react';

function SurveyContent({ formId }: { formId: string }) {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');
  const viewType = searchParams.get('view') || 'form'; // 'form' or 'admin'
  
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  useEffect(() => {
    fetchForm();
    if (viewType === 'admin') {
      fetchSubmissions();
    }
  }, [formId, companyId, viewType]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching survey:', formId, 'for company:', companyId);
      
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

  const fetchSubmissions = async () => {
    try {
      setSubmissionsLoading(true);
      // TODO: Implement submissions API
      // For now, show mock data
      setSubmissions([
        {
          id: '1',
          submittedAt: new Date().toISOString(),
          responses: { rating: 5, feedback: 'Great course!' },
          studentId: 'student_123'
        },
        {
          id: '2', 
          submittedAt: new Date(Date.now() - 86400000).toISOString(),
          responses: { rating: 4, feedback: 'Very helpful' },
          studentId: 'student_456'
        }
      ]);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleSubmit = async (responses: Record<string, any>) => {
    try {
      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: formId,
          entityId: `survey_${Date.now()}`,
          companyId: companyId,
          responses,
          metadata: {
            source: 'whop_survey',
            embedded: false
          }
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert('Failed to submit survey. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit survey. Please try again.');
    }
  };

  const handleViewToggle = (newView: 'form' | 'admin') => {
    const url = new URL(window.location.href);
    url.searchParams.set('view', newView);
    window.location.href = url.toString();
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with View Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#E1E4EA]">{form.name}</h1>
            <p className="text-[#9AA4B2]">{form.description || 'Course feedback survey'}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleViewToggle('form')}
              variant={viewType === 'form' ? 'default' : 'outline'}
              className={viewType === 'form' 
                ? 'bg-[#10B981] hover:bg-[#0E9F71] text-white' 
                : 'bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]'
              }
            >
              <Eye className="h-4 w-4 mr-2" />
              Form
            </Button>
            <Button
              onClick={() => handleViewToggle('admin')}
              variant={viewType === 'admin' ? 'default' : 'outline'}
              className={viewType === 'admin' 
                ? 'bg-[#10B981] hover:bg-[#0E9F71] text-white' 
                : 'bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]'
              }
            >
              <Settings className="h-4 w-4 mr-2" />
              Admin
            </Button>
          </div>
        </div>

        {/* Form View (Student View) */}
        {viewType === 'form' && (
          <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-xl">
            {submitted ? (
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
            ) : (
              <>
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
              </>
            )}
          </Card>
        )}

        {/* Admin View (Operator View) */}
        {viewType === 'admin' && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#0B2C24]">
                      <Users className="h-5 w-5 text-[#10B981]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#9AA4B2]">Total Responses</p>
                      <p className="text-xl font-bold text-[#E1E4EA]">{submissions.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#0B2C24]">
                      <BarChart3 className="h-5 w-5 text-[#10B981]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#9AA4B2]">Avg Rating</p>
                      <p className="text-xl font-bold text-[#E1E4EA]">4.5</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#0B2C24]">
                      <Clock className="h-5 w-5 text-[#10B981]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#9AA4B2]">Last Response</p>
                      <p className="text-sm font-bold text-[#E1E4EA]">2 hours ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Submissions List */}
            <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#E1E4EA] flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#10B981]" />
                  Recent Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {submissionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-[#10B981] animate-spin mr-2" />
                    <span className="text-[#9AA4B2]">Loading submissions...</span>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[#9AA4B2]">No submissions yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((submission) => (
                      <div key={submission.id} className="border border-[#2A2F36] rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-[#0B2C24] text-[#10B981] border-[#17493A]">
                              Response #{submission.id}
                            </Badge>
                            <span className="text-sm text-[#9AA4B2]">
                              {new Date(submission.submittedAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {Object.entries(submission.responses).map(([key, value]) => (
                            <div key={key} className="text-sm">
                              <span className="text-[#9AA4B2]">{key}:</span>
                              <span className="text-[#E1E4EA] ml-2">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button className="bg-[#10B981] hover:bg-[#0E9F71] text-white">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button className="bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]">
                <Settings className="h-4 w-4 mr-2" />
                Survey Settings
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default async function SurveyPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SurveyContent formId={formId} />
    </Suspense>
  );
}
