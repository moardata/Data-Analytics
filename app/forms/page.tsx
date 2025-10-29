/**
 * Surveys Section - Comprehensive Survey Management
 * View, customize, schedule, and export survey data with clean UI
 * REQUIRES ACTIVE SUBSCRIPTION
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';
import { Plus, FileText, Eye, CheckCircle, Share2, Copy, BookOpen, Code, Download, Settings, BarChart3, Clock, Users, X, Trash2, Sparkles } from 'lucide-react';
import { LoadingScreen } from '@/components/LoadingScreen';
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
import { usePaywall } from '@/hooks/use-paywall';
import { PaywallModal } from '@/components/PaywallModal';
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
  const [activeTab, setActiveTab] = useState<'surveys' | 'builder' | 'submissions' | 'export'>('surveys');
  const [userRole, setUserRole] = useState<'owner' | 'student' | 'loading'>('loading');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [completedForms, setCompletedForms] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  
  // Add paywall hook for button-level checks
  const { hasAccess, showPaywall, setShowPaywall, requireSubscription } = usePaywall();

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
        return;
      }

      const response = await fetch(`/api/forms/completion?companyId=${clientId}&whopUserId=${whopUserId}`);
      if (response.ok) {
        const data = await response.json();
        setCompletedForms(data.completedFormIds || []);
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
    if (!requireSubscription('Delete survey')) return;
    
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

  const enrichStudents = async () => {
    setIsEnriching(true);
    try {
      const response = await fetch(`/api/admin/enrich-students?companyId=${clientId}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`✅ Successfully enriched ${data.enrichedCount} student profiles with Whop data!`);
        // Refresh submissions to show updated data
        fetchSubmissions();
      } else {
        const error = await response.json();
        alert(`⚠️ Enrichment completed with some issues: ${error.error || 'Unknown error'}`);
        // Still refresh to show any successful updates
        fetchSubmissions();
      }
    } catch (error) {
      console.error('Error enriching students:', error);
      alert('❌ Failed to enrich student data. Please try again.');
    } finally {
      setIsEnriching(false);
    }
  };


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
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f]">
        <LoadingScreen message="Loading your surveys" size="lg" />
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
                            ? 'bg-[#3F3F46] text-[#A1A1AA] opacity-60 cursor-not-allowed'
                            : 'border border-[#10B981]/30 bg-[#0B2C24] hover:bg-[#0E3A2F] text-[#10B981] hover:text-[#34D399]'
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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header - Friendly Welcome Section */}
        <div className="rounded-2xl border border-[#1a1a1a]/70 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] p-6">
          <div>
            <h2 className="text-2xl font-bold text-[#F8FAFC] mb-2">Surveys Section</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-[#F59E0B] to-[#F59E0B]/50 rounded-full mb-3"></div>
          </div>
          <p className="text-[#A1A1AA] text-sm">
            View, customize, schedule, and export survey data with seamless precision
          </p>
        </div>

        {/* Stats Cards - Bubbly and User-Friendly */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden border border-[#1a1a1a]/70 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] rounded-2xl shadow-lg hover:shadow-xl hover:shadow-purple-500/10 transition-all group">
            {/* Metallic sheen */}
            <div className="pointer-events-none absolute inset-0 opacity-30">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent" />
            </div>
            <div className="relative z-10 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center shadow-lg shadow-purple-500/10">
                  <FileText className="h-6 w-6 text-purple-400" />
                </div>
              </div>
              <p className="text-3xl font-black text-[#F8FAFC] mb-1 truncate">{forms.length}</p>
              <p className="text-sm font-medium text-[#A1A1AA] truncate">Total Surveys</p>
            </div>
          </Card>

          <Card className="relative overflow-hidden border border-[#1a1a1a]/70 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] rounded-2xl shadow-lg hover:shadow-xl hover:shadow-emerald-500/10 transition-all group">
            {/* Metallic sheen */}
            <div className="pointer-events-none absolute inset-0 opacity-30">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent" />
            </div>
            <div className="relative z-10 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                  <CheckCircle className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
              <p className="text-3xl font-black text-[#F8FAFC] mb-1 truncate">{forms.filter(f => f.is_active).length}</p>
              <p className="text-sm font-medium text-[#A1A1AA] truncate">Active</p>
            </div>
          </Card>

          <Card className="relative overflow-hidden border border-[#1a1a1a]/70 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] rounded-2xl shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all group">
            {/* Metallic sheen */}
            <div className="pointer-events-none absolute inset-0 opacity-30">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent" />
            </div>
            <div className="relative z-10 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center shadow-lg shadow-blue-500/10">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              <p className="text-3xl font-black text-[#F8FAFC] mb-1 truncate">{submissions.length}</p>
              <p className="text-sm font-medium text-[#A1A1AA] truncate">Submissions</p>
            </div>
          </Card>

          <Card className="relative overflow-hidden border border-[#1a1a1a]/70 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] rounded-2xl shadow-lg hover:shadow-xl hover:shadow-orange-500/10 transition-all group">
            {/* Metallic sheen */}
            <div className="pointer-events-none absolute inset-0 opacity-30">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent" />
            </div>
            <div className="relative z-10 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center shadow-lg shadow-orange-500/10">
                  <BarChart3 className="h-6 w-6 text-orange-400" />
                </div>
              </div>
              <p className="text-3xl font-black text-[#F8FAFC] mb-1 truncate">{forms.reduce((sum, f) => sum + (f.fields?.length || 0), 0)}</p>
              <p className="text-sm font-medium text-[#A1A1AA] truncate">Total Fields</p>
            </div>
          </Card>
        </div>

        {/* Tab Navigation - Matching Dashboard Style */}
        <div className="grid grid-cols-4 border-b border-[#1a1a1a] bg-[#0f0f0f]">
          <button
            onClick={() => setActiveTab('surveys')}
            className={`flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-all ${
              activeTab === 'surveys'
                ? 'bg-[#A855F7] text-white shadow-[0_0_20px_rgba(168,85,247,0.6)]'
                : 'text-[#A1A1AA] hover:text-[#F8FAFC]'
            }`}
          >
            <FileText className="h-4 w-4" />
            My Surveys
          </button>
          <button
            onClick={() => {
              if (!requireSubscription('Create a new survey')) return;
              setEditingForm(null);
              setActiveTab('builder');
            }}
            className={`flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-all ${
              activeTab === 'builder'
                ? 'bg-[#10B981] text-white shadow-[0_0_20px_rgba(16,185,129,0.6)]'
                : 'text-[#A1A1AA] hover:text-[#F8FAFC]'
            }`}
          >
            <Settings className="h-4 w-4" />
            Create
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-all ${
              activeTab === 'submissions'
                ? 'bg-[#3B82F6] text-white shadow-[0_0_20px_rgba(59,130,246,0.6)]'
                : 'text-[#A1A1AA] hover:text-[#F8FAFC]'
            }`}
          >
            <Users className="h-4 w-4" />
            Submissions
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-all ${
              activeTab === 'export'
                ? 'bg-[#F59E0B] text-white shadow-[0_0_20px_rgba(245,158,11,0.6)]'
                : 'text-[#A1A1AA] hover:text-[#F8FAFC]'
            }`}
          >
            <Download className="h-4 w-4" />
            Export Data
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'surveys' && (
          <div>
            {forms.length === 0 ? (
              <Card className="relative overflow-hidden border border-[#1a1a1a]/70 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] shadow-lg">
                {/* Metallic sheen overlay */}
                <div className="pointer-events-none absolute inset-0 opacity-40">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/4 via-transparent to-transparent" />
                </div>
                <CardContent className="py-16 text-center relative z-10">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/10">
                    <FileText className="h-10 w-10 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#F8FAFC] mb-2">
                    No surveys yet
                  </h3>
                  <p className="text-[#A1A1AA] mb-6 max-w-md mx-auto">
                    Create your first survey to start collecting valuable student feedback
                  </p>
                  <Button 
                    onClick={() => {
                      if (!requireSubscription('Create a survey')) return;
                      setActiveTab('builder');
                    }}
                    className="gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <Plus className="h-5 w-5" />
                    Create Your First Survey
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forms
                  .filter(form => userRole === 'owner' || form.is_active)
                  .map((form) => (
                  <Card key={form.id} className="relative overflow-hidden border border-[#1a1a1a]/70 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] shadow-lg hover:shadow-xl hover:shadow-[#10B981]/20 transition-all duration-300 hover:border-[#10B981]/50 group">
                    {/* Metallic sheen overlay */}
                    <div className="pointer-events-none absolute inset-0 opacity-40">
                      <div className="absolute inset-0 bg-gradient-to-b from-white/4 via-transparent to-transparent" />
                    </div>
                    
                    <CardHeader className="pb-3 relative z-10">
                      <CardTitle className="text-[#F8FAFC] flex items-center gap-2 group-hover:text-[#10B981] transition-colors">
                        <FileText className="h-5 w-5 text-[#10B981]" />
                        {form.name}
                      </CardTitle>
                      <CardDescription className="text-[#A1A1AA] group-hover:text-[#E2E8F0] transition-colors">
                        {form.description || 'No description'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 relative z-10">
                      <div className="flex items-center gap-2 text-sm text-[#A1A1AA] group-hover:text-[#E2E8F0] transition-colors">
                        <CheckCircle className="h-4 w-4 text-[#10B981]" />
                        {form.fields?.length || 0} fields
                        {userRole === 'owner' && (
                          <Badge className={`ml-2 ${form.is_active ? 'bg-[#0B2C24] border border-[#10B981]/40 text-[#10B981]' : 'bg-[#3F3F46] text-[#A1A1AA]'}`}>
                            {form.is_active ? 'Published' : 'Draft'}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-2">
                        {/* Admin Action Buttons */}
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => setSelectedForm(form)}
                          className="flex-1 gap-2 border border-[#1a1a1a] bg-[#0f0f0f]/80 hover:bg-[#1a1a1a] text-[#F8FAFC] hover:text-white transition-all rounded-lg"
                        >
                          <Eye className="h-4 w-4" />
                            Preview
                          </Button>
                          <Button 
                            onClick={() => {
                              if (!requireSubscription('Edit survey')) return;
                              setEditingForm(form);
                              setActiveTab('builder');
                            }}
                            className="flex-1 gap-2 border border-[#1a1a1a] bg-[#0f0f0f]/80 hover:bg-[#1a1a1a] text-[#F8FAFC] hover:text-white transition-all rounded-lg"
                          >
                            <Settings className="h-4 w-4" />
                            Manage
                          </Button>
                          <Button 
                            onClick={() => deleteForm(form.id)}
                            className="gap-2 border border-[#EF4444]/30 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] hover:text-[#FF5555] transition-all rounded-lg"
                            title="Delete Survey"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Publish to Students Button */}
                        <Button 
                          onClick={async () => {
                            if (!requireSubscription('Publish survey to students')) return;
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
                          className="w-full gap-2 border border-[#10B981]/30 bg-[#0B2C24] hover:bg-[#0E3A2F] text-[#10B981] hover:text-[#34D399] font-medium py-3 px-6 rounded-lg transition-all duration-200"
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
              requireSubscription={requireSubscription}
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
                    className="gap-2 border border-[#10B981]/30 bg-[#0B2C24] hover:bg-[#0E3A2F] text-[#10B981] hover:text-[#34D399] transition-all"
                  >
                    <FileText className="h-4 w-4" />
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
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={enrichStudents}
                      disabled={isEnriching}
                      className="border border-[#10B981]/30 bg-[#0B2C24] hover:bg-[#0E3A2F] text-[#10B981] hover:text-[#34D399] text-sm transition-all"
                      size="sm"
                    >
                      {isEnriching ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enriching...
                        </>
                      ) : (
                        <>
                          <Users className="h-4 w-4 mr-2" />
                          Sync Student Data
                        </>
                      )}
                    </Button>
                    <Badge className="bg-[#0B2C24] border border-[#10B981]/40 text-[#10B981]">
                      <Users className="h-3 w-3 mr-1" />
                      {submissions.length} Total
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  {submissions.map((submission) => {
                    // Get student avatar from metadata
                    const avatarUrl = submission.entities?.metadata?.avatar_url || 
                                     submission.entities?.metadata?.avatar ||
                                     submission.entities?.metadata?.profile_picture_url;
                    
                    return (
                    <Card key={submission.id} className="border border-[#1a1a1a] bg-[#0f0f0f] hover:border-[#10B981]/30 transition-colors">
                      <CardHeader 
                        className="pb-3 cursor-pointer"
                        onClick={() => setSelectedSubmission(selectedSubmission?.id === submission.id ? null : submission)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#10B981]/20 flex items-center justify-center overflow-hidden border border-[#10B981]/30">
                              {avatarUrl ? (
                                <img 
                                  src={avatarUrl} 
                                  alt={submission.entities?.name || 'Student'} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Users className="h-5 w-5 text-[#10B981]" />
                              )}
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
                    );
                  })}
                </div>
              </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative overflow-hidden border border-[#1a1a1a]/70 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] rounded-xl shadow-2xl shadow-[#10B981]/10 max-w-4xl w-full max-h-[90vh]">
            {/* Metallic sheen overlay */}
            <div className="pointer-events-none absolute inset-0 opacity-40">
              <div className="absolute inset-0 bg-gradient-to-b from-white/4 via-transparent to-transparent" />
            </div>
            
            {/* Header */}
            <div className="relative z-10 flex items-center justify-between p-6 border-b border-[#1a1a1a]/50">
              <div>
                <h3 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
                  <Eye className="h-5 w-5 text-[#10B981]" />
                  {selectedForm.name}
                </h3>
                <p className="text-sm text-[#A1A1AA] mt-1">Preview Mode</p>
              </div>
              <Button
                onClick={() => setSelectedForm(null)}
                variant="ghost"
                size="sm"
                className="text-[#A1A1AA] hover:text-[#F8FAFC] hover:bg-[#1a1a1a] rounded-lg transition-all"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Content */}
            <div className="relative z-10 p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <div className="mb-6 p-4 rounded-lg border border-[#10B981]/20 bg-[#0B2C24]/30">
                <p className="text-[#E2E8F0] text-sm">
                  {selectedForm.description || 'No description provided'}
                </p>
                <p className="text-[#10B981] text-xs mt-2 flex items-center gap-2">
                  <CheckCircle className="h-3 w-3" />
                  {selectedForm.fields?.length || 0} fields in this survey
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
      
      {/* Paywall Modal - triggered by button clicks */}
      <PaywallModal 
        isOpen={showPaywall} 
        onClose={() => setShowPaywall(false)}
        reason="Start your 7-day free trial to access this feature"
      />
    </div>
  );
}

export default function FormsPage() {
  return <FormsContent />;
}
