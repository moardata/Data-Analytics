/**
 * Surveys Section - Comprehensive Survey Management
 * View, customize, schedule, and export survey data with clean UI
 */

'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';
import { Plus, FileText, Eye, CheckCircle, Share2, Copy, BookOpen, Code, Download, Settings, BarChart3, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import FormBuilderEnhanced from '@/components/FormBuilderEnhanced';
import SurveyForm from '@/components/SurveyForm';
import { DataForm, FormField } from '@/components/DataForm';
import EmbedCodeGenerator from '@/components/EmbedCodeGenerator';
import { supabase } from '@/lib/supabase';
import { WhopClientAuth } from '@/components/WhopClientAuth';

function FormsContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('companyId') || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
  
  const [forms, setForms] = useState<any[]>([]);
  const [selectedForm, setSelectedForm] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'surveys' | 'builder' | 'submissions' | 'analytics' | 'export'>('surveys');
  const [userRole, setUserRole] = useState<'owner' | 'student' | 'loading'>('loading');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);

  useEffect(() => {
    fetchForms();
    checkUserRole();
  }, [clientId]);

  useEffect(() => {
    if (activeTab === 'submissions') {
      fetchSubmissions();
    }
  }, [activeTab, clientId]);

  const checkUserRole = async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const companyId = params.get('companyId') || 
                       window.location.pathname.split('/').find(part => part.startsWith('biz_'));

      if (!companyId) {
        setUserRole('student');
        return;
      }

      const response = await fetch(`/api/auth/check-owner?companyId=${companyId}`);
      const data = await response.json();
      
      if (data.isOwner) {
        setUserRole('owner');
      } else {
        setUserRole('student');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      setUserRole('student'); // Default to student on error
    }
  };

  const fetchForms = async () => {
    try {
      // Check if Supabase is configured
      if (!supabase) {
        console.warn('⚠️ Supabase not configured. Forms feature disabled.');
        setForms([]);
        return;
      }

      // First get the client record for this company
      const { data: clientData } = await supabase
        .from('clients')
        .select('id')
        .eq('company_id', clientId)
        .single();

      if (!clientData) {
        console.log('No client found for company:', clientId);
        setForms([]);
        return;
      }

      // Now query form templates with the actual client UUID
      const { data } = await supabase
        .from('form_templates')
        .select('*')
        .eq('client_id', clientData.id)
        .eq('is_active', true);
      
      setForms(data || []);
    } catch (error) {
      console.error('Error fetching forms:', error);
      setForms([]);
    }
  };

  const fetchSubmissions = async () => {
    try {
      if (!supabase) {
        console.warn('⚠️ Supabase not configured. Submissions feature disabled.');
        setSubmissions([]);
        return;
      }

      // First get the client record for this company
      const { data: clientData } = await supabase
        .from('clients')
        .select('id')
        .eq('company_id', clientId)
        .single();

      if (!clientData) {
        console.log('No client found for company:', clientId);
        setSubmissions([]);
        return;
      }

      // Fetch all form submissions for this client
      const { data } = await supabase
        .from('form_submissions')
        .select(`
          *,
          form_templates!inner(name, description),
          entities!inner(whop_user_id, name)
        `)
        .eq('client_id', clientData.id)
        .order('submitted_at', { ascending: false });
      
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setSubmissions([]);
    }
  };

  const handleFormSubmit = async (responses: Record<string, any>) => {
    const demoEntityId = 'student_' + Date.now();

    const response = await fetch('/api/forms/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formId: selectedForm.id,
        entityId: demoEntityId,
        companyId: clientId,
        responses,
      }),
    });

    if (response.ok) {
      setSelectedForm(null);
      alert('Survey submitted successfully! Thank you for your feedback.');
    } else {
      alert('Failed to submit survey. Please try again.');
    }
  };

  if (selectedForm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] p-8">
        <div className="max-w-3xl mx-auto">
          <Button 
            onClick={() => setSelectedForm(null)}
            className="mb-6 gap-2 text-lg bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]"
          >
            ← Back to Forms
          </Button>
          <DataForm
            formId={selectedForm.id}
            fields={selectedForm.fields}
            onSubmit={handleFormSubmit}
            title={selectedForm.name}
            description={selectedForm.description}
          />
        </div>
      </div>
    );
  }

  // Show loading state
  if (userRole === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] flex items-center justify-center">
        <div className="text-[#D1D5DB] text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981] mx-auto mb-4"></div>
          <p>Loading your surveys...</p>
        </div>
      </div>
    );
  }

  // Student Interface
  if (userRole === 'student') {
    return (
      <div className="min-h-screen bg-[#0f1115] p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#E5E7EB] mb-2">
              Available Surveys
            </h1>
            <p className="text-[#9AA4B2]">
              Complete surveys to share your feedback and help improve the experience.
            </p>
          </div>

          {forms.length === 0 ? (
            <div className="bg-[#171A1F] border border-[#2A2F36] rounded-2xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#0B2C24] flex items-center justify-center">
                <FileText className="h-8 w-8 text-[#9AA4B2]" />
              </div>
              <h3 className="text-lg font-semibold text-[#E5E7EB] mb-2">
                No Surveys Available
              </h3>
              <p className="text-[#9AA4B2] text-sm">
                There are currently no surveys available. Check back later!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forms.map((form) => (
                <Card key={form.id} className="border border-[#2A2F36] bg-[#171A1F] shadow-lg hover:shadow-xl hover:shadow-[#10B981]/10 transition-all duration-300 hover:border-[#10B981]/30 group">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-[#E1E4EA] flex items-center gap-2 group-hover:text-[#10B981] transition-colors">
                      <FileText className="h-5 w-5 text-[#10B981]" />
                      {form.name}
                    </CardTitle>
                    <CardDescription className="text-[#9AA4B2] group-hover:text-[#E1E4EA] transition-colors">
                      {form.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-[#9AA4B2] group-hover:text-[#E1E4EA] transition-colors">
                      <CheckCircle className="h-4 w-4 text-[#10B981]" />
                      {form.fields?.length || 0} fields
                    </div>
                    
                    <div className="space-y-3">
                      {/* Submit Survey Button */}
                      <Button 
                        onClick={() => setSelectedForm(form)}
                        className="w-full gap-2 bg-[#10B981] hover:bg-[#0E9F71] text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#10B981]/25"
                      >
                        <FileText className="h-5 w-5" />
                        Submit Survey
                      </Button>
                      
                      {/* Preview Button */}
                      <Button 
                        onClick={() => {
                          window.open(`/forms/public/${form.id}?companyId=${clientId}`, '_blank');
                        }}
                        variant="outline"
                        className="w-full gap-2 bg-transparent hover:bg-[#0B2C24] text-[#9AA4B2] hover:text-white border border-[#3A4047] hover:border-[#10B981]/30 transition-all duration-200"
                      >
                        <Eye className="h-4 w-4" />
                        Preview Form
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black text-[#E5E7EB] mb-2">
              Surveys Section
            </h1>
            <p className="text-xl font-bold text-[#9AA4B2]">
              View, customize, schedule, and export survey data with seamless precision
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => window.open('/courses/test-course', '_blank')}
              className="gap-2 bg-[#10B981] hover:bg-[#0E9F71] text-white"
            >
              <BookOpen className="h-4 w-4" />
              Test Survey
            </Button>
            <Button
              onClick={() => window.open(`/student/surveys?companyId=${clientId}`, '_blank')}
              className="gap-2 bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]"
            >
              <Users className="h-4 w-4" />
              Student View
            </Button>
            <Badge className="bg-[#0B2C24] text-[#10B981] border-[#17493A] px-3 py-1">
              <Users className="h-3 w-3 mr-1" />
              {forms.length} Active Surveys
            </Badge>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-[#2A2F36]">
          {[
            { id: 'surveys', label: 'My Surveys', icon: FileText, description: 'View pre-saved surveys' },
            { id: 'builder', label: 'Customize', icon: Settings, description: 'Edit survey content' },
            { id: 'submissions', label: 'Submissions', icon: Users, description: 'View form submissions' },
            { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'View response data' },
            { id: 'export', label: 'Export Data', icon: Download, description: 'Download collected data' }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-[#10B981] text-[#10B981] bg-[#0B2C24]/20'
                    : 'border-transparent text-[#9AA4B2] hover:text-[#E1E4EA] hover:bg-[#2A2F36]/20'
                }`}
                title={tab.description}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'surveys' && (
          <div>
            {forms.length === 0 ? (
              <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
                <CardContent className="py-16 text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-[#2A2F36]" />
                  <h3 className="text-2xl font-black text-[#E1E4EA] mb-2">
                    No forms yet
                  </h3>
                  <p className="text-lg text-[#9AA4B2] mb-6">
                    Create your first form to start collecting student feedback
                  </p>
                  <Button 
                    onClick={() => setActiveTab('builder')}
                    className="gap-2 bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]"
                  >
                    <Plus className="h-5 w-5" />
                    Create Your First Form
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forms.map((form) => (
                  <Card key={form.id} className="border border-[#2A2F36] bg-[#171A1F] shadow-lg hover:shadow-xl hover:shadow-[#10B981]/10 transition-all duration-300 hover:border-[#10B981]/30 group">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-[#E1E4EA] flex items-center gap-2 group-hover:text-[#10B981] transition-colors">
                        <FileText className="h-5 w-5 text-[#10B981]" />
                        {form.name}
                      </CardTitle>
                      <CardDescription className="text-[#9AA4B2] group-hover:text-[#E1E4EA] transition-colors">
                        {form.description || 'No description'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-[#9AA4B2] group-hover:text-[#E1E4EA] transition-colors">
                        <CheckCircle className="h-4 w-4 text-[#10B981]" />
                        {form.fields?.length || 0} fields
                      </div>
                      <div className="space-y-2">
                        {/* Admin Action Buttons */}
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => {
                              window.open(`/forms/public/${form.id}?companyId=${clientId}`, '_blank');
                            }}
                            className="flex-1 gap-2 bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]"
                          >
                            <Eye className="h-4 w-4" />
                            Preview
                          </Button>
                          <Button 
                            onClick={() => {
                              window.open(`/surveys/${form.id}?companyId=${clientId}&view=admin`, '_blank');
                            }}
                            className="flex-1 gap-2 bg-[#10B981] hover:bg-[#0E9F71] text-white"
                          >
                            <Settings className="h-4 w-4" />
                            Manage
                          </Button>
                        </div>
                        
                        {/* Publish to Students Button */}
                        <Button 
                          onClick={() => {
                            // Toggle the survey's active status
                            const newStatus = !form.is_active;
                            // Here you would typically make an API call to update the form status
                            alert(`Survey ${newStatus ? 'published' : 'unpublished'} to students!`);
                          }}
                          className={`w-full gap-2 font-medium py-3 px-6 rounded-lg transition-all duration-200 ${
                            form.is_active 
                              ? 'bg-[#10B981] hover:bg-[#0E9F71] text-white hover:shadow-lg hover:shadow-[#10B981]/25' 
                              : 'bg-[#2A2F36] hover:bg-[#3A4047] text-[#9AA4B2] hover:text-white border border-[#3A4047]'
                          }`}
                        >
                          <FileText className="h-5 w-5" />
                          {form.is_active ? 'Published to Students' : 'Publish to Students'}
                        </Button>
                        
                        {/* Additional Admin Actions */}
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => {
                              const publicUrl = `${window.location.origin}/forms/public/${form.id}?companyId=${clientId}`;
                              navigator.clipboard.writeText(publicUrl);
                              alert('Public form link copied to clipboard!');
                            }}
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-2 bg-transparent hover:bg-[#0B2C24] text-[#9AA4B2] hover:text-white border border-[#3A4047] hover:border-[#10B981]/30"
                          >
                            <Share2 className="h-4 w-4" />
                            Share
                          </Button>
                          <Button 
                            onClick={() => {
                              // Navigate to analytics for this form
                              window.open(`/analytics?formId=${form.id}&companyId=${clientId}`, '_blank');
                            }}
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-2 bg-transparent hover:bg-[#0B2C24] text-[#9AA4B2] hover:text-white border border-[#3A4047] hover:border-[#10B981]/30"
                          >
                            <BarChart3 className="h-4 w-4" />
                            Analytics
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'builder' && (
          <div>
            <FormBuilderEnhanced />
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="space-y-6">
            {submissions.length === 0 ? (
              <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
                <CardContent className="py-16 text-center">
                  <Users className="h-16 w-16 text-[#9AA4B2] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-[#E1E4EA] mb-2">
                    No Submissions Yet
                  </h3>
                  <p className="text-[#9AA4B2] mb-6">
                    Form submissions will appear here once students start filling out your surveys
                  </p>
                  <Button
                    onClick={() => setActiveTab('surveys')}
                    className="bg-[#10B981] hover:bg-[#0E9F71] text-white"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Surveys
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-[#E1E4EA]">
                    Form Submissions ({submissions.length})
                  </h3>
                  <Badge className="bg-[#10B981] text-white border-0">
                    <Users className="h-3 w-3 mr-1" />
                    {submissions.length} Total
                  </Badge>
                </div>

                <div className="space-y-3">
                  {submissions.map((submission) => (
                    <Card key={submission.id} className="border border-[#2A2F36] bg-[#171A1F] hover:border-[#10B981]/30 transition-colors">
                      <CardHeader 
                        className="pb-3 cursor-pointer"
                        onClick={() => setSelectedSubmission(selectedSubmission?.id === submission.id ? null : submission)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#10B981]/20 flex items-center justify-center">
                              <Users className="h-5 w-5 text-[#10B981]" />
                            </div>
                            <div>
                              <CardTitle className="text-[#E1E4EA] text-lg">
                                {submission.entities?.name || 'Anonymous User'}
                              </CardTitle>
                              <CardDescription className="text-[#9AA4B2]">
                                {submission.form_templates?.name || 'Unknown Form'}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm text-[#9AA4B2]">
                                {new Date(submission.submitted_at).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-[#9AA4B2]">
                                {new Date(submission.submitted_at).toLocaleTimeString()}
                              </div>
                            </div>
                            <div className="text-[#9AA4B2]">
                              {selectedSubmission?.id === submission.id ? '▼' : '▶'}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      {selectedSubmission?.id === submission.id && (
                        <CardContent className="pt-0">
                          <div className="border-t border-[#2A2F36] pt-4">
                            <h4 className="text-sm font-semibold text-[#E1E4EA] mb-3">Submission Details:</h4>
                            <div className="space-y-3">
                              {Object.entries(submission.responses || {}).map(([fieldName, value]) => (
                                <div key={fieldName} className="bg-[#0B2C24] rounded-lg p-3">
                                  <div className="text-sm font-medium text-[#10B981] mb-1">
                                    {fieldName}
                                  </div>
                                  <div className="text-[#E1E4EA]">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 pt-3 border-t border-[#2A2F36] text-xs text-[#9AA4B2]">
                              Submission ID: {submission.id}
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#E1E4EA] flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#10B981]" />
                  Survey Analytics
                </CardTitle>
                <CardDescription className="text-[#9AA4B2]">
                  View response data and insights from your surveys
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-[#2A2F36]" />
                  <h3 className="text-2xl font-black text-[#E1E4EA] mb-2">
                    Analytics Dashboard
                  </h3>
                  <p className="text-lg text-[#9AA4B2] mb-6">
                    Detailed analytics and insights will be available soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'export' && (
          <div>
            <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#E1E4EA] flex items-center gap-2">
                  <Download className="h-5 w-5 text-[#10B981]" />
                  Export Survey Data
                </CardTitle>
                <CardDescription className="text-[#9AA4B2]">
                  Download collected survey responses in various formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      className="gap-2 bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A] h-12"
                      onClick={() => {
                        // TODO: Implement CSV export
                        alert('CSV export feature coming soon!');
                      }}
                    >
                      <Download className="h-4 w-4" />
                      Export as CSV
                    </Button>
                    <Button 
                      className="gap-2 bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A] h-12"
                      onClick={() => {
                        // TODO: Implement PDF export
                        alert('PDF export feature coming soon!');
                      }}
                    >
                      <Download className="h-4 w-4" />
                      Export as PDF
                    </Button>
                  </div>
                  <div className="text-center py-4">
                    <p className="text-[#9AA4B2]">
                      Export all collected survey data over time into organized files
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FormsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c]">
        <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <FormsContent />
    </Suspense>
  );
}
