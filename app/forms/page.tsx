/**
 * Forms Management Page - Dark Emerald Theme
 * Create and manage custom data collection forms
 */

'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';
import { Plus, FileText, Eye, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import FormBuilderEnhanced from '@/components/FormBuilderEnhanced';
import SurveyForm from '@/components/SurveyForm';
import { DataForm, FormField } from '@/components/DataForm';
import { supabase } from '@/lib/supabase';

function FormsContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('companyId') || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
  
  const [forms, setForms] = useState<any[]>([]);
  const [selectedForm, setSelectedForm] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'forms' | 'builder' | 'survey'>('forms');

  useEffect(() => {
    fetchForms();
  }, [clientId]);

  const fetchForms = async () => {
    try {
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
              Forms Management
            </h1>
            <p className="text-xl font-bold text-[#9AA4B2]">
              Create custom forms to collect student feedback
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-[#2A2F36]">
          {[
            { id: 'forms', label: 'My Forms', icon: FileText },
            { id: 'builder', label: 'Form Builder', icon: Plus },
            { id: 'survey', label: 'Survey Demo', icon: CheckCircle }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#10B981] text-[#10B981]'
                    : 'border-transparent text-[#9AA4B2] hover:text-[#E1E4EA]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'forms' && (
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
                  <Card key={form.id} className="border border-[#2A2F36] bg-[#171A1F] shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-[#E1E4EA] flex items-center gap-2">
                        <FileText className="h-5 w-5 text-[#10B981]" />
                        {form.name}
                      </CardTitle>
                      <CardDescription className="text-[#9AA4B2]">
                        {form.description || 'No description'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-[#9AA4B2]">
                        <CheckCircle className="h-4 w-4" />
                        {form.fields?.length || 0} fields
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => setSelectedForm(form)}
                          className="flex-1 gap-2 bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]"
                        >
                          <Eye className="h-4 w-4" />
                          View Form
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
            <FormBuilderEnhanced />
          </div>
        )}

        {activeTab === 'survey' && (
          <div>
            <SurveyForm />
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
