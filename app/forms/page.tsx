/**
 * Surveys Section - Comprehensive Survey Management
 * View, customize, schedule, and export survey data with clean UI
 */

'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';
import { Plus, FileText, Eye, CheckCircle, Share2, Copy, BookOpen, Code, Download, Settings, BarChart3, Clock, Users, X, Trash2 } from 'lucide-react';
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
import { triggerConfetti } from '@/components/SurveyCompletionTracker';
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
  const [completedForms, setCompletedForms] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    fetchForms();
    checkUserRole();
  }, [clientId]);

  useEffect(() => {
    if (activeTab === 'submissions') {
      fetchSubmissions();
    }
  }, [activeTab, clientId]);

  useEffect(() => {
    if (userRole === 'student') {
      fetchCompletedForms();
    }
  }, [userRole, clientId]);

  const fetchCompletedForms = async () => {
    try {
      // Get whopUserId from localStorage (set during form submission)
      const whopUserId = localStorage.getItem('whop_user_id');
      
      if (!whopUserId) {
        console.log('No whopUserId found - student hasn\'t submitted any forms yet');
        return;
      }

      const response = await fetch(`/api/forms/completion?companyId=${clientId}&whopUserId=${whopUserId}`);
      if (response.ok) {
        const data = await response.json();
        setCompletedForms(data.completedFormIds || []);
        console.log('Completed forms:', data.completedFormIds);
      }
    } catch (error) {
      console.error('Error fetching completed forms:', error);
    }
  };

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

  const deleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this survey? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/forms/delete?formId=${formId}&companyId=${clientId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setForms(forms.filter(f => f.id !== formId));
        alert('Survey deleted successfully!');
      } else {
        alert('Failed to delete survey. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('Failed to delete survey. Please try again.');
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
    console.log('📊 [Analytics] Calculate called:', {
      submissionsCount: submissions.length,
      formsCount: forms.length,
      firstSubmission: submissions[0],
      firstForm: forms[0]
    });

    if (submissions.length === 0 || forms.length === 0) {
      console.log('📊 [Analytics] No data - setting analytics to null');
      setAnalytics(null);
      return;
    }

    // Calculate stats per form
    const formStats = forms.map(form => {
      const formSubs = submissions.filter(sub => sub.form_id === form.id);
      console.log(`📊 [Analytics] Form "${form.name}" (${form.id}):`, {
        matchingSubmissions: formSubs.length,
        totalSubmissions: submissions.length
      });
      return {
        formName: form.name,
        responseCount: formSubs.length
      };
    });

    // Calculate timeline data (responses over last 30 days for better visibility)
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    const timelineData = last30Days.map(day => {
      const dayStart = new Date(day);
      const dayEnd = new Date(day);
      dayEnd.setDate(dayEnd.getDate() + 1);
      
      const count = submissions.filter(sub => {
        if (!sub.submitted_at) return false;
        const subDate = new Date(sub.submitted_at);
        return subDate >= dayStart && subDate < dayEnd;
      }).length;
      
      return {
        date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        responses: count
      };
    }).filter(d => d.responses > 0); // Only show days with responses for cleaner chart

    // Calculate question analytics
    const questionAnalytics: any[] = [];
    forms.forEach(form => {
      const formSubs = submissions.filter(sub => sub.form_id === form.id);
      
      if (formSubs.length === 0) return;
      
      form.fields?.forEach((field: any) => {
        // Try to match field by label or id
        const fieldResponses = formSubs
          .map(sub => {
            // Try multiple keys: field.label, field.id, or clean label
            const response = sub.responses?.[field.label] 
              || sub.responses?.[field.id]
              || sub.responses?.[field.label?.toLowerCase()];
            return response;
          })
          .filter(val => val !== undefined && val !== null && val !== '');

        if (fieldResponses.length === 0) return;

        if (field.type === 'rating' || field.type === 'number') {
          // Calculate average for numeric fields
          const numericResponses = fieldResponses.filter(val => !isNaN(Number(val)));
          if (numericResponses.length === 0) return;
          
          const avg = numericResponses.reduce((sum, val) => sum + Number(val), 0) / numericResponses.length;
          const min = Math.min(...numericResponses.map(v => Number(v)));
          const max = Math.max(...numericResponses.map(v => Number(v)));
          
          questionAnalytics.push({
            formName: form.name,
            question: field.label,
            type: field.type,
            average: avg.toFixed(2),
            min,
            max,
            responseCount: numericResponses.length
          });
        } else if (field.type === 'radio' || field.type === 'select' || field.type === 'checkbox') {
          // Calculate distribution for choice fields
          const distribution: Record<string, number> = {};
          fieldResponses.forEach(val => {
            // Handle both single values and arrays (for checkbox)
            const values = Array.isArray(val) ? val : [val];
            values.forEach(v => {
              const key = String(v);
              distribution[key] = (distribution[key] || 0) + 1;
            });
          });
          
          questionAnalytics.push({
            formName: form.name,
            question: field.label,
            type: field.type,
            distribution: Object.entries(distribution)
              .map(([name, value]) => ({ name, value }))
              .sort((a, b) => b.value - a.value), // Sort by count descending
            responseCount: fieldResponses.length
          });
        } else if (field.type === 'long_text' || field.type === 'short_text') {
          // Show sample responses for text fields
          const sampleResponses = fieldResponses.slice(0, 5).map(r => String(r));
          questionAnalytics.push({
            formName: form.name,
            question: field.label,
            type: field.type,
            sampleResponses,
            responseCount: fieldResponses.length,
            avgLength: Math.round(fieldResponses.reduce((sum, val) => sum + String(val).length, 0) / fieldResponses.length)
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
    // Get or create persistent user ID
    let whopUserId = localStorage.getItem('whop_user_id');
    if (!whopUserId) {
      whopUserId = 'student_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('whop_user_id', whopUserId);
    }

    const response = await fetch('/api/forms/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formId: selectedForm.id,
        entityId: whopUserId,
        companyId: clientId,
        responses,
      }),
    });

    if (response.ok) {
      // 🎉 Trigger confetti celebration!
      triggerConfetti();
      
      // Add to completed forms immediately
      setCompletedForms([...completedForms, selectedForm.id]);
      
      // Show success message with a delay to let confetti start
      setTimeout(() => {
        alert('Survey submitted successfully! Thank you for your feedback! 🎉');
        setSelectedForm(null);
      }, 500);
      
      // Refresh completed forms list
      if (userRole === 'student') {
        setTimeout(() => fetchCompletedForms(), 1000);
      }
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
    const totalSurveys = forms.length;
    const completedCount = completedForms.length;
    const completionPercentage = totalSurveys > 0 ? Math.round((completedCount / totalSurveys) * 100) : 0;

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

          {/* Completion Progress Bar */}
          {totalSurveys > 0 && (
            <Card className="border border-[#1a1a1a] bg-[#0f0f0f] shadow-lg mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      completedCount === totalSurveys 
                        ? 'bg-[#10B981] shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                        : 'bg-[#10B981]/20'
                    }`}>
                      {completedCount === totalSurveys ? (
                        <CheckCircle className="h-6 w-6 text-white" />
                      ) : (
                        <FileText className="h-6 w-6 text-[#10B981]" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#F8FAFC]">Your Progress</h3>
                      <p className="text-sm text-[#A1A1AA]">
                        {completedCount === totalSurveys 
                          ? '🎉 All surveys completed!' 
                          : `${completedCount} of ${totalSurveys} surveys completed`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-[#10B981]">
                      {completionPercentage}%
                    </div>
                    <div className="text-xs text-[#A1A1AA]">Complete</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="relative w-full h-3 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#10B981] to-[#0E9F71] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${completionPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>

                {/* Completion Message */}
                {completedCount === totalSurveys && totalSurveys > 0 && (
                  <div className="mt-4 bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-4 text-center">
                    <p className="text-[#10B981] font-bold text-lg">
                      🎊 Amazing! You've completed all available surveys! 🎊
                    </p>
                    <p className="text-[#A1A1AA] text-sm mt-1">
                      Thank you for your valuable feedback!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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
              {forms.map((form) => {
                const isCompleted = completedForms.includes(form.id);
                return (
                <Card key={form.id} className={`border shadow-lg hover:shadow-xl transition-all duration-300 group ${
                  isCompleted 
                    ? 'border-[#10B981] bg-[#10B981]/5' 
                    : 'border-[#1a1a1a] bg-[#0f0f0f] hover:border-[#10B981]/30'
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-[#F8FAFC] flex items-center gap-2 group-hover:text-[#10B981] transition-colors">
                        <FileText className="h-5 w-5 text-[#10B981]" />
                        {form.name}
                      </CardTitle>
                      {isCompleted && (
                        <Badge className="bg-[#10B981] text-white border-0 gap-1 px-2 py-1">
                          <CheckCircle className="h-3 w-3" />
                          Completed ✨
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-[#A1A1AA] group-hover:text-[#F8FAFC] transition-colors">
                      {form.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-[#A1A1AA] group-hover:text-[#F8FAFC] transition-colors">
                      <CheckCircle className="h-4 w-4 text-[#10B981]" />
                      {form.fields?.length || 0} fields
                    </div>
                    
                    {isCompleted && (
                      <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-3">
                        <p className="text-sm text-[#10B981] font-medium">
                          🎉 Thank you for completing this survey!
                        </p>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      {/* Submit Survey Button */}
                      <Button 
                        onClick={() => setSelectedForm(form)}
                        disabled={isCompleted}
                        className={`w-full gap-2 font-medium py-3 px-6 rounded-lg transition-all duration-200 ${
                          isCompleted
                            ? 'bg-[#6B7280] hover:bg-[#6B7280] text-white opacity-60 cursor-not-allowed'
                            : 'bg-[#10B981] hover:bg-[#0E9F71] text-white hover:shadow-lg hover:shadow-[#10B981]/25'
                        }`}
                      >
                        <FileText className="h-5 w-5" />
                        {isCompleted ? 'Already Completed' : 'Submit Survey'}
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
              )})}
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
              {forms.filter(f => f.is_active).length} Active Surveys
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
                          <Button 
                            onClick={() => deleteForm(form.id)}
                            className="gap-2 bg-[#7f1d1d] hover:bg-[#991b1b] text-white border border-[#991b1b]"
                            title="Delete Survey"
                          >
                            <Trash2 className="h-4 w-4" />
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
              companyId={clientId || undefined}
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
                    <CardTitle className="text-[#F8FAFC]">Response Timeline (Last 30 Days)</CardTitle>
                    <CardDescription className="text-[#A1A1AA]">
                      Showing only days with submissions
                    </CardDescription>
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
                            <div className="space-y-4">
                              <div className="grid grid-cols-3 gap-4">
                                <div className="bg-[#0B2C24] rounded-lg p-4 text-center">
                                  <div className="text-2xl font-black text-[#10B981]">{qa.average}</div>
                                  <div className="text-xs text-[#A1A1AA] mt-1">Average</div>
                                </div>
                                <div className="bg-[#1a1a1a] rounded-lg p-4 text-center">
                                  <div className="text-2xl font-black text-[#3B82F6]">{qa.min}</div>
                                  <div className="text-xs text-[#A1A1AA] mt-1">Minimum</div>
                                </div>
                                <div className="bg-[#1a1a1a] rounded-lg p-4 text-center">
                                  <div className="text-2xl font-black text-[#F59E0B]">{qa.max}</div>
                                  <div className="text-xs text-[#A1A1AA] mt-1">Maximum</div>
                                </div>
                              </div>
                            </div>
                          ) : qa.type === 'long_text' || qa.type === 'short_text' ? (
                            <div className="space-y-3">
                              <div className="bg-[#1a1a1a] rounded-lg p-3 text-sm">
                                <span className="text-[#10B981] font-medium">Average length:</span> 
                                <span className="text-[#F8FAFC] ml-2">{qa.avgLength} characters</span>
                              </div>
                              <div className="space-y-2">
                                <div className="text-sm font-medium text-[#A1A1AA]">Sample responses:</div>
                                {qa.sampleResponses?.map((response: string, i: number) => (
                                  <div key={i} className="bg-[#0B2C24]/30 border border-[#10B981]/20 rounded-lg p-3 text-sm text-[#F8FAFC]">
                                    "{response}"
                                  </div>
                                ))}
                                {qa.responseCount > 5 && (
                                  <div className="text-xs text-[#A1A1AA] italic">
                                    + {qa.responseCount - 5} more responses
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : qa.distribution ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                              <div className="space-y-2">
                                {qa.distribution.map((item: any, i: number) => (
                                  <div key={i} className="flex items-center justify-between bg-[#1a1a1a] rounded-lg p-3">
                                    <span className="text-[#F8FAFC] font-medium">{item.name}</span>
                                    <div className="flex items-center gap-3">
                                      <div className="h-2 bg-[#0a0a0a] rounded-full w-24">
                                        <div 
                                          className="h-2 bg-[#10B981] rounded-full"
                                          style={{ width: `${(item.value / qa.responseCount) * 100}%` }}
                                        />
                                      </div>
                                      <span className="text-[#10B981] font-bold text-lg min-w-[3ch] text-right">
                                        {item.value}
                                      </span>
                                      <span className="text-[#A1A1AA] text-sm min-w-[4ch] text-right">
                                        {Math.round((item.value / qa.responseCount) * 100)}%
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
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
