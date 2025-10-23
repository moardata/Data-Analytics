/**
 * Surveys Section - Comprehensive Survey Management
 * View, customize, schedule, and export survey data with clean UI
 */

'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';
import { Plus, FileText, Eye, CheckCircle, Share2, Copy, BookOpen, Code, Download, Settings, BarChart3, Clock, Users, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import FormBuilderEnhanced from '@/components/FormBuilderEnhanced';
import SurveyForm from '@/components/SurveyForm';
import { DataForm, FormField } from '@/components/DataForm';
import EmbedCodeGenerator from '@/components/EmbedCodeGenerator';
import { supabase } from '@/lib/supabase';
import { WhopClientAuth } from '@/components/WhopClientAuth';
import { fixFormFieldIds } from '@/lib/utils/formHelpers';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

function FormsContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('companyId') || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
  
  const [forms, setForms] = useState<any[]>([]);
  const [selectedForm, setSelectedForm] = useState<any | null>(null);
  const [editingForm, setEditingForm] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'surveys' | 'builder' | 'submissions' | 'analytics' | 'export'>('surveys');
  const [userRole, setUserRole] = useState<'owner' | 'student' | 'loading'>('loading');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);

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
      // For owners, show all forms regardless of active status
      // For students, only show active forms
      const { data } = await supabase
        .from('form_templates')
        .select('*')
        .eq('client_id', clientData.id)
        .order('created_at', { ascending: false });
      
      // Fix duplicate field IDs in all forms
      const formsWithFixedIds = (data || []).map(fixFormFieldIds);
      setForms(formsWithFixedIds);
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

  const calculateAnalytics = () => {
    if (submissions.length === 0 || forms.length === 0) {
      setAnalytics(null);
      return;
    }

    // Calculate stats per form
    const formStats = forms.map(form => {
      const formSubs = submissions.filter(sub => sub.form_template_id === form.id);
      return {
        formName: form.name,
        responseCount: formSubs.length
      };
    });

    // Calculate timeline data (responses per day for last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const timelineData = last7Days.map(day => ({
      date: new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      responses: submissions.filter(sub => 
        sub.submitted_at?.startsWith(day)
      ).length
    }));

    // Calculate question analytics
    const questionAnalytics: any[] = [];
    forms.forEach(form => {
      const formSubs = submissions.filter(sub => sub.form_template_id === form.id);
      
      form.fields?.forEach((field: any) => {
        const fieldResponses = formSubs
          .map(sub => sub.responses?.[field.label])
          .filter(val => val !== undefined && val !== null && val !== '');

        if (fieldResponses.length === 0) return;

        if (field.type === 'rating' || field.type === 'number') {
          // Calculate average for numeric fields
          const avg = fieldResponses.reduce((sum, val) => sum + Number(val), 0) / fieldResponses.length;
          questionAnalytics.push({
            formName: form.name,
            question: field.label,
            type: field.type,
            average: avg.toFixed(2),
            responseCount: fieldResponses.length
          });
        } else if (field.type === 'radio' || field.type === 'select') {
          // Calculate distribution for choice fields
          const distribution: Record<string, number> = {};
          fieldResponses.forEach(val => {
            const key = String(val);
            distribution[key] = (distribution[key] || 0) + 1;
          });
          questionAnalytics.push({
            formName: form.name,
            question: field.label,
            type: field.type,
            distribution: Object.entries(distribution).map(([name, value]) => ({ name, value })),
            responseCount: fieldResponses.length
          });
        }
      });
    });

    setAnalytics({
      totalResponses: submissions.length,
      formStats,
      timelineData,
      questionAnalytics
    });
  };

  useEffect(() => {
    if (activeTab === 'analytics') {
      calculateAnalytics();
    }
  }, [activeTab, submissions, forms]);

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
            className="mb-6 gap-2 text-lg bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white border border-[#1a1a1a]"
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
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f] p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#F8FAFC] mb-2">
              Available Surveys
            </h1>
            <p className="text-[#A1A1AA]">
              Complete surveys to share your feedback and help improve the experience.
            </p>
          </div>

          {forms.length === 0 ? (
            <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-2xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#0B2C24] flex items-center justify-center">
                <FileText className="h-8 w-8 text-[#A1A1AA]" />
              </div>
              <h3 className="text-lg font-semibold text-[#F8FAFC] mb-2">
                No Surveys Available
              </h3>
              <p className="text-[#A1A1AA] text-sm">
                There are currently no surveys available. Check back later!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forms.map((form) => (
                <Card key={form.id} className="border border-[#1a1a1a] bg-[#0f0f0f] shadow-lg hover:shadow-xl hover:shadow-[#10B981]/10 transition-all duration-300 hover:border-[#10B981]/30 group">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-[#F8FAFC] flex items-center gap-2 group-hover:text-[#10B981] transition-colors">
                      <FileText className="h-5 w-5 text-[#10B981]" />
                      {form.name}
                    </CardTitle>
                    <CardDescription className="text-[#A1A1AA] group-hover:text-[#F8FAFC] transition-colors">
                      {form.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-[#A1A1AA] group-hover:text-[#F8FAFC] transition-colors">
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
                        className="w-full gap-2 bg-transparent hover:bg-[#0B2C24] text-[#A1A1AA] hover:text-white border border-[#3A4047] hover:border-[#10B981]/30 transition-all duration-200"
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
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black text-[#F8FAFC] mb-2">
              Surveys Section
            </h1>
            <p className="text-xl font-bold text-[#A1A1AA]">
              View, customize, schedule, and export survey data with seamless precision
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-[#0B2C24] text-[#10B981] border-[#17493A] px-3 py-1">
              <Users className="h-3 w-3 mr-1" />
              {forms.length} Active Surveys
            </Badge>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-[#1a1a1a]">
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
                onClick={() => {
                  // Clear editing form when clicking Builder tab from another tab (to create new form)
                  if (tab.id === 'builder' && activeTab !== 'builder') {
                    setEditingForm(null);
                  }
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-[#10B981] text-[#10B981] bg-[#0B2C24]/30'
                    : 'border-transparent text-[#A1A1AA] hover:text-[#F8FAFC] hover:bg-[#1a1a1a]/50'
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
              <Card className="border border-[#1a1a1a] bg-[#0f0f0f] shadow-lg">
                <CardContent className="py-16 text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-[#2A2F36]" />
                  <h3 className="text-2xl font-black text-[#F8FAFC] mb-2">
                    No forms yet
                  </h3>
                  <p className="text-lg text-[#A1A1AA] mb-6">
                    Create your first form to start collecting student feedback
                  </p>
                  <Button 
                    onClick={() => setActiveTab('builder')}
                    className="gap-2 bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white border border-[#1a1a1a]"
                  >
                    <Plus className="h-5 w-5" />
                    Create Your First Form
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forms
                  .filter(form => userRole === 'owner' || form.is_active)
                  .map((form) => (
                  <Card key={form.id} className="border border-[#1a1a1a] bg-[#0f0f0f] shadow-lg hover:shadow-xl hover:shadow-[#10B981]/10 transition-all duration-300 hover:border-[#10B981]/30 group">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-[#F8FAFC] flex items-center gap-2 group-hover:text-[#10B981] transition-colors">
                        <FileText className="h-5 w-5 text-[#10B981]" />
                        {form.name}
                      </CardTitle>
                      <CardDescription className="text-[#A1A1AA] group-hover:text-[#F8FAFC] transition-colors">
                        {form.description || 'No description'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-[#A1A1AA] group-hover:text-[#F8FAFC] transition-colors">
                        <CheckCircle className="h-4 w-4 text-[#10B981]" />
                        {form.fields?.length || 0} fields
                        {userRole === 'owner' && (
                          <Badge className={`ml-2 ${form.is_active ? 'bg-[#10B981] text-white' : 'bg-[#6B7280] text-white'}`}>
                            {form.is_active ? 'Published' : 'Draft'}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-2">
                        {/* Admin Action Buttons */}
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => setSelectedForm(form)}
                          className="flex-1 gap-2 bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white border border-[#1a1a1a]"
                        >
                          <Eye className="h-4 w-4" />
                            Preview
                          </Button>
                          <Button 
                            onClick={() => {
                              setEditingForm(form);
                              setActiveTab('builder');
                            }}
                            className="flex-1 gap-2 bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white border border-[#1a1a1a]"
                          >
                            <Settings className="h-4 w-4" />
                            Manage
                          </Button>
                        </div>
                        
                        {/* Publish to Students Button */}
                        <Button 
                          onClick={async () => {
                            try {
                              const newStatus = !form.is_active;
                              
                              // Make API call to update the form status
                              const response = await fetch('/api/forms/toggle-status', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  formId: form.id,
                                  companyId: clientId,
                                  isActive: newStatus
                                })
                              });
                              
                              if (response.ok) {
                                // Update the form in the local state
                                setForms(forms.map(f => 
                                  f.id === form.id 
                                    ? { ...f, is_active: newStatus }
                                    : f
                                ));
                                alert(`Survey ${newStatus ? 'published' : 'unpublished'} to students!`);
                              } else {
                                alert('Failed to update survey status. Please try again.');
                              }
                            } catch (error) {
                              console.error('Error updating form status:', error);
                              alert('Failed to update survey status. Please try again.');
                            }
                          }}
                          className="w-full gap-2 bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white border border-[#1a1a1a] font-medium py-3 px-6 rounded-lg transition-all duration-200"
                        >
                          <FileText className="h-5 w-5" />
                          {form.is_active ? 'Unpublish from Students' : 'Publish to Students'}
                        </Button>
                        
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
            <FormBuilderEnhanced 
              existingForm={editingForm}
              onSaveComplete={() => {
                // Refresh forms list and go back to surveys tab
                fetchForms();
                setEditingForm(null);
                setActiveTab('surveys');
              }}
            />
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="space-y-6">
            {submissions.length === 0 ? (
              <Card className="border border-[#1a1a1a] bg-[#0f0f0f] shadow-lg">
                <CardContent className="py-16 text-center">
                  <Users className="h-16 w-16 text-[#A1A1AA] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-[#F8FAFC] mb-2">
                    No Submissions Yet
                  </h3>
                  <p className="text-[#A1A1AA] mb-6">
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
                  <h3 className="text-xl font-semibold text-[#F8FAFC]">
                    Form Submissions ({submissions.length})
                  </h3>
                  <Badge className="bg-[#10B981] text-white border-0">
                    <Users className="h-3 w-3 mr-1" />
                    {submissions.length} Total
                  </Badge>
                </div>

                <div className="space-y-3">
                  {submissions.map((submission) => (
                    <Card key={submission.id} className="border border-[#1a1a1a] bg-[#0f0f0f] hover:border-[#10B981]/30 transition-colors">
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
                              <CardTitle className="text-[#F8FAFC] text-lg">
                                {submission.entities?.name || 'Anonymous User'}
                              </CardTitle>
                              <CardDescription className="text-[#A1A1AA]">
                                {submission.form_templates?.name || 'Unknown Form'}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm text-[#A1A1AA]">
                                {new Date(submission.submitted_at).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-[#A1A1AA]">
                                {new Date(submission.submitted_at).toLocaleTimeString()}
                              </div>
                            </div>
                            <div className="text-[#A1A1AA]">
                              {selectedSubmission?.id === submission.id ? '▼' : '▶'}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      {selectedSubmission?.id === submission.id && (
                        <CardContent className="pt-0">
                          <div className="border-t border-[#2A2F36] pt-4">
                            <h4 className="text-sm font-semibold text-[#F8FAFC] mb-3">Submission Details:</h4>
                            <div className="space-y-3">
                              {Object.entries(submission.responses || {}).map(([fieldName, value]) => (
                                <div key={fieldName} className="bg-[#0B2C24] rounded-lg p-3">
                                  <div className="text-sm font-medium text-[#10B981] mb-1">
                                    {fieldName}
                                  </div>
                                  <div className="text-[#F8FAFC]">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 pt-3 border-t border-[#2A2F36] text-xs text-[#A1A1AA]">
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
          <div className="space-y-6">
            {!analytics || analytics.totalResponses === 0 ? (
              <Card className="border border-[#1a1a1a] bg-[#0f0f0f] shadow-lg">
                <CardContent className="py-16 text-center">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-[#2A2F36]" />
                  <h3 className="text-2xl font-black text-[#F8FAFC] mb-2">
                    No Analytics Data Yet
                  </h3>
                  <p className="text-lg text-[#A1A1AA] mb-6">
                    Analytics will appear here once you start receiving form responses
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
              <>
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border border-[#1a1a1a] bg-[#0f0f0f] shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-[#A1A1AA]">Total Responses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-black text-[#10B981]">
                        {analytics.totalResponses}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-[#1a1a1a] bg-[#0f0f0f] shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-[#A1A1AA]">Active Surveys</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-black text-[#10B981]">
                        {forms.filter(f => f.is_active).length}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-[#1a1a1a] bg-[#0f0f0f] shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-[#A1A1AA]">Avg Response Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-black text-[#10B981]">
                        {analytics.formStats.length > 0 
                          ? Math.round(analytics.totalResponses / analytics.formStats.length)
                          : 0}
                      </div>
                      <div className="text-xs text-[#A1A1AA] mt-1">per survey</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Response Timeline */}
                <Card className="border border-[#1a1a1a] bg-[#0f0f0f] shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-[#F8FAFC]">Response Timeline (Last 7 Days)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analytics.timelineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                        <XAxis dataKey="date" stroke="#A1A1AA" />
                        <YAxis stroke="#A1A1AA" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#0f0f0f', 
                            border: '1px solid #1a1a1a',
                            borderRadius: '8px'
                          }}
                          labelStyle={{ color: '#F8FAFC' }}
                          itemStyle={{ color: '#10B981' }}
                        />
                        <Line type="monotone" dataKey="responses" stroke="#10B981" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Responses per Form */}
                <Card className="border border-[#1a1a1a] bg-[#0f0f0f] shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-[#F8FAFC]">Responses per Survey</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.formStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                        <XAxis dataKey="formName" stroke="#A1A1AA" />
                        <YAxis stroke="#A1A1AA" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#0f0f0f', 
                            border: '1px solid #1a1a1a',
                            borderRadius: '8px'
                          }}
                          labelStyle={{ color: '#F8FAFC' }}
                          itemStyle={{ color: '#10B981' }}
                        />
                        <Bar dataKey="responseCount" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Question-level Analytics */}
                {analytics.questionAnalytics.length > 0 && (
                  <Card className="border border-[#1a1a1a] bg-[#0f0f0f] shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-[#F8FAFC]">Question Analytics</CardTitle>
                      <CardDescription className="text-[#A1A1AA]">
                        Detailed breakdown of responses by question
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {analytics.questionAnalytics.map((qa: any, idx: number) => (
                        <div key={idx} className="border-b border-[#1a1a1a] pb-6 last:border-0">
                          <div className="mb-4">
                            <div className="text-sm font-medium text-[#10B981] mb-1">{qa.formName}</div>
                            <div className="text-lg font-semibold text-[#F8FAFC]">{qa.question}</div>
                            <div className="text-sm text-[#A1A1AA]">
                              {qa.responseCount} responses
                            </div>
                          </div>

                          {qa.type === 'rating' || qa.type === 'number' ? (
                            <div className="bg-[#0B2C24] rounded-lg p-4">
                              <div className="text-3xl font-black text-[#10B981]">
                                {qa.average}
                              </div>
                              <div className="text-sm text-[#A1A1AA] mt-1">Average Rating</div>
                            </div>
                          ) : qa.distribution ? (
                            <ResponsiveContainer width="100%" height={250}>
                              <PieChart>
                                <Pie
                                  data={qa.distribution}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={80}
                                  label={(entry) => `${entry.name}: ${entry.value}`}
                                >
                                  {qa.distribution.map((_: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#0f0f0f', 
                                    border: '1px solid #1a1a1a',
                                    borderRadius: '8px'
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          ) : null}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'export' && (
          <div>
            <Card className="border border-[#1a1a1a] bg-[#0f0f0f] shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#F8FAFC] flex items-center gap-2">
                  <Download className="h-5 w-5 text-[#10B981]" />
                  Export Survey Data
                </CardTitle>
                <CardDescription className="text-[#A1A1AA]">
                  Download collected survey responses in various formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      className="gap-2 bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white border border-[#1a1a1a] h-12"
                      onClick={() => {
                        // Export survey templates as CSV
                        window.open(`/api/export/csv?type=surveys&companyId=${clientId}`, '_blank');
                      }}
                    >
                      <Download className="h-4 w-4" />
                      Export Templates (CSV)
                    </Button>
                    <Button 
                      className="gap-2 bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white border border-[#1a1a1a] h-12"
                      onClick={() => {
                        // Export survey responses as CSV
                        window.open(`/api/export/csv?type=survey_responses&companyId=${clientId}`, '_blank');
                      }}
                    >
                      <Download className="h-4 w-4" />
                      Export Responses (CSV)
                    </Button>
                    <Button 
                      className="gap-2 bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white border border-[#1a1a1a] h-12"
                      onClick={() => {
                        // Export analytics report as PDF
                        window.open(`/api/export/pdf?companyId=${clientId}`, '_blank');
                      }}
                    >
                      <Download className="h-4 w-4" />
                      Analytics Report (PDF)
                    </Button>
                  </div>
                  <div className="text-center py-4">
                    <p className="text-[#A1A1AA]">
                      Export all collected survey data over time into organized files
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Inline Form Preview Modal */}
      {selectedForm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#1a1a1a]">
              <h3 className="text-lg font-semibold text-[#F8FAFC]">
                {selectedForm.name} - Preview
              </h3>
              <Button
                onClick={() => setSelectedForm(null)}
                variant="ghost"
                size="sm"
                className="text-[#A1A1AA] hover:text-[#F8FAFC]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="mb-4">
                <p className="text-[#A1A1AA] text-sm">
                  {selectedForm.description || 'No description provided'}
                </p>
                <p className="text-[#A1A1AA] text-xs mt-1">
                  {selectedForm.fields?.length || 0} fields
                </p>
              </div>
              <DataForm
                formId={selectedForm.id}
                fields={selectedForm.fields}
                onSubmit={() => {
                  alert('This is a preview - form submission is disabled');
                }}
                title=""
                description=""
              />
            </div>
          </div>
        </div>
      )}
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
