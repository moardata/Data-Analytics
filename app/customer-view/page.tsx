/**
 * Customer View Page
 * Shows limited information for non-admin users
 */

'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Eye, CheckCircle } from 'lucide-react';
import { DataForm } from '@/components/DataForm';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function CustomerViewContent() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');
  
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState<any[]>([]);
  const [selectedForm, setSelectedForm] = useState<any | null>(null);

  useEffect(() => {
    fetchForms();
  }, [companyId]);

  const fetchForms = async () => {
    try {
      setLoading(true);
      
      if (!supabase) {
        console.warn('⚠️ Supabase not configured. Forms feature disabled.');
        setForms([]);
        return;
      }

      // First get the client record for this company
      const { data: clientData } = await supabase
        .from('clients')
        .select('id')
        .eq('company_id', companyId)
        .single();

      if (!clientData) {
        console.log('No client found for company:', companyId);
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
    } finally {
      setLoading(false);
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
        companyId: companyId,
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
            ← Back to Surveys
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <div className="text-[#D1D5DB] text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981] mx-auto mb-4"></div>
          <p>Loading your surveys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1115] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#E5E7EB] mb-2">
            Welcome to CreatorIQ
          </h1>
          <p className="text-[#9AA4B2]">
            Complete surveys to share your feedback and help improve the experience.
          </p>
        </div>

        {/* Surveys Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#E5E7EB]">Available Surveys</h2>
            <div className="text-[#9AA4B2] text-sm">
              {forms.length} survey{forms.length !== 1 ? 's' : ''} available
            </div>
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
                          window.open(`/forms/public/${form.id}?companyId=${companyId}`, '_blank');
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

        {/* Contact Admin Card */}
        <div className="bg-[#171A1F] border border-[#2A2F36] rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-[#E5E7EB] mb-4">
            Need Full Access?
          </h2>
          <div className="space-y-3">
            <div className="text-[#D1D5DB]">
              Contact your company administrator to request access to:
            </div>
            <ul className="text-[#9AA4B2] text-sm space-y-1 ml-4">
              <li>• Detailed analytics dashboard</li>
              <li>• Student engagement metrics</li>
              <li>• Revenue tracking</li>
              <li>• AI-powered insights</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomerViewPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c]">
        <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CustomerViewContent />
    </Suspense>
  );
}
