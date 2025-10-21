/**
 * Surveys Section - Comprehensive Survey Management
 * View, customize, schedule, and export survey data with clean UI
 */

'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';
import { Plus, FileText, Eye, CheckCircle, Share2, Copy, BookOpen, Code, Calendar, Download, Settings, BarChart3, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import FormBuilderEnhanced from '@/components/FormBuilderEnhanced';
import SurveyForm from '@/components/SurveyForm';
import { DataForm, FormField } from '@/components/DataForm';
import FormDeliverySettings from '@/components/FormDeliverySettings';
import EmbedCodeGenerator from '@/components/EmbedCodeGenerator';
import { supabase } from '@/lib/supabase';

function FormsContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('companyId') || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
  
  const [forms, setForms] = useState<any[]>([]);
  const [selectedForm, setSelectedForm] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'surveys' | 'builder' | 'embed' | 'schedule' | 'analytics' | 'export'>('surveys');

  useEffect(() => {
    fetchForms();
  }, [clientId]);

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

  const handleFormSubmit = async (responses: Record<string, any>) => {
    const demoEntityId = '650e8400-e29b-41d4-a716-446655440001';

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
            { id: 'embed', label: 'Embed Code', icon: Code, description: 'Get code for Whop courses' },
            { id: 'schedule', label: 'Schedule', icon: Calendar, description: 'Set timing & automation' },
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
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => setSelectedForm(form)}
                            className="flex-1 gap-2 bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]"
                          >
                            <Eye className="h-4 w-4" />
                            View Form
                          </Button>
                          <Button 
                            onClick={() => {
                              const publicUrl = `${window.location.origin}/forms/public/${form.id}?companyId=${clientId}`;
                              navigator.clipboard.writeText(publicUrl);
                              alert('Public form link copied to clipboard!');
                            }}
                            className="gap-2 bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]"
                          >
                            <Share2 className="h-4 w-4" />
                            Share
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={async () => {
                              try {
                                const response = await fetch('/api/surveys/trigger', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    formId: form.id,
                                    companyId: clientId,
                                    triggerType: 'course'
                                  })
                                });
                                const data = await response.json();
                                
                                if (data.success) {
                                  navigator.clipboard.writeText(data.embedCode);
                                  alert('Course embed code copied to clipboard!');
                                }
                              } catch (error) {
                                console.error('Error getting embed code:', error);
                                alert('Failed to get embed code');
                              }
                            }}
                            size="sm"
                            className="flex-1 gap-2 bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]"
                          >
                            <BookOpen className="h-4 w-4" />
                            Course Embed
                          </Button>
                          <Button 
                            onClick={async () => {
                              try {
                                const response = await fetch('/api/surveys/trigger', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    formId: form.id,
                                    companyId: clientId,
                                    triggerType: 'modal'
                                  })
                                });
                                const data = await response.json();
                                
                                if (data.success) {
                                  navigator.clipboard.writeText(data.modalCode);
                                  alert('Modal popup code copied to clipboard!');
                                }
                              } catch (error) {
                                console.error('Error getting modal code:', error);
                                alert('Failed to get modal code');
                              }
                            }}
                            size="sm"
                            className="flex-1 gap-2 bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]"
                          >
                            <Code className="h-4 w-4" />
                            Popup Code
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

        {activeTab === 'embed' && (
          <div className="space-y-6">
            {forms.length === 0 ? (
              <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
                <CardContent className="py-16 text-center">
                  <Code className="h-16 w-16 text-[#9AA4B2] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-[#E1E4EA] mb-2">
                    No Surveys Yet
                  </h3>
                  <p className="text-[#9AA4B2] mb-6">
                    Create a survey first to get embed codes for your Whop courses
                  </p>
                  <Button
                    onClick={() => setActiveTab('builder')}
                    className="bg-[#10B981] hover:bg-[#0E9F71] text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Survey
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="bg-[#0B2C24] border border-[#17493A] rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-[#10B981] mb-2 flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    How to Embed Surveys in Whop Courses
                  </h3>
                  <p className="text-[#9AA4B2] text-sm mb-3">
                    Get embed codes for your surveys below. Paste the code into your Whop course lesson content to show surveys directly to students.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[#9AA4B2]">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-[#10B981]" />
                      <span>Works in any Whop course/experience</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-[#10B981]" />
                      <span>Automatically tracks responses</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-[#10B981]" />
                      <span>Beautiful, responsive design</span>
                    </div>
                  </div>
                </div>

                {forms.map((form) => (
                  <div key={form.id} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[#E1E4EA]">{form.name}</h3>
                        <p className="text-sm text-[#9AA4B2]">{form.description || 'No description'}</p>
                      </div>
                      <Badge className="bg-[#0B2C24] text-[#10B981] border-[#17493A]">
                        {form.fields?.length || 0} questions
                      </Badge>
                    </div>
                    <EmbedCodeGenerator
                      formId={form.id}
                      companyId={clientId || ''}
                      formName={form.name}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-6">
            {forms.length === 0 ? (
              <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
                <CardContent className="py-16 text-center">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-[#2A2F36]" />
                  <h3 className="text-2xl font-black text-[#E1E4EA] mb-2">
                    No surveys to schedule
                  </h3>
                  <p className="text-lg text-[#9AA4B2] mb-6">
                    Create a survey first to set up delivery scheduling
                  </p>
                  <Button 
                    onClick={() => setActiveTab('builder')}
                    className="gap-2 bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]"
                  >
                    <Plus className="h-5 w-5" />
                    Create Survey
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#E1E4EA] mb-2">
                    Survey Delivery Settings
                  </h2>
                  <p className="text-[#9AA4B2]">
                    Configure how and when surveys are delivered to students
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {forms.map((form) => (
                    <div key={form.id} className="space-y-4">
                      <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-[#E1E4EA] text-sm flex items-center gap-2">
                            <FileText className="h-4 w-4 text-[#10B981]" />
                            {form.name}
                          </CardTitle>
                          <p className="text-xs text-[#9AA4B2]">{form.description}</p>
                        </CardHeader>
                        <CardContent>
                          <FormDeliverySettings
                            formId={form.id}
                            companyId={clientId || ''}
                            onSettingsChange={(settings) => {
                              console.log('Delivery settings updated:', settings);
                              // TODO: Save settings to database
                            }}
                          />
                        </CardContent>
                      </Card>
                    </div>
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
