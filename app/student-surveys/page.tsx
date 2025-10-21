'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Eye, CheckCircle, Users } from 'lucide-react';
import { DataForm } from '@/components/DataForm';

export const dynamic = 'force-dynamic';

function StudentSurveysContent() {
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
      
      if (!companyId) {
        console.warn('⚠️ No company ID provided');
        setForms([]);
        return;
      }

      // Fetch active forms from the API
      const response = await fetch(`/api/forms/active?companyId=${companyId}`);
      
      if (!response.ok) {
        console.error('Failed to fetch forms:', response.statusText);
        setForms([]);
        return;
      }

      const data = await response.json();
      setForms(data.forms || []);
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
      // Refresh the forms list
      fetchForms();
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
          
          <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-[#E1E4EA] flex items-center gap-2">
                <FileText className="h-6 w-6 text-[#10B981]" />
                {selectedForm.name}
              </CardTitle>
              <CardDescription className="text-[#9AA4B2]">
                Complete this survey to help improve our community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataForm
                formId={selectedForm.id}
                fields={selectedForm.fields}
                onSubmit={handleFormSubmit}
                title=""
                description=""
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c]">
        <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-5xl font-black text-[#E5E7EB] mb-2">
            Student Surveys
          </h1>
          <p className="text-xl font-bold text-[#9AA4B2]">
            Complete your assigned surveys
          </p>
        </div>

        {/* Welcome Message */}
        <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
          <CardContent className="py-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#0B2C24] flex items-center justify-center text-[#10B981] text-xl font-bold border border-[#17493A]">
                👋
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#E1E4EA]">Welcome, Student!</h3>
                <p className="text-[#9AA4B2]">You have access to complete surveys assigned by your community.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Surveys */}
        <div>
          <h2 className="text-2xl font-bold text-[#E1E4EA] mb-6">Available Surveys</h2>
          
          {forms.length === 0 ? (
            <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
              <CardContent className="py-16 text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#0B2C24] flex items-center justify-center border border-[#17493A]">
                  <FileText className="h-12 w-12 text-[#10B981]" />
                </div>
                <h3 className="text-2xl font-bold text-[#E1E4EA] mb-2">
                  No surveys available at the moment
                </h3>
                <p className="text-lg text-[#9AA4B2] mb-6">
                  Your community owner will assign surveys for you to complete.
                </p>
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Refresh Surveys
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forms.map((form) => (
                <Card key={form.id} className="border border-[#2A2F36] bg-[#171A1F] shadow-lg hover:shadow-xl hover:shadow-[#10B981]/10 transition-all duration-300 hover:border-[#10B981]/30 group">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-[#0B2C24] flex items-center justify-center text-[#10B981] text-lg font-bold border border-[#17493A]">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg text-[#E1E4EA] group-hover:text-[#10B981] transition-colors">
                          {form.name}
                        </CardTitle>
                        <CardDescription className="text-[#9AA4B2]">
                          {form.description || 'Complete this survey to help improve our community'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-[#9AA4B2]">
                      <CheckCircle className="h-4 w-4 text-[#10B981]" />
                      <span>Ready to complete</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => setSelectedForm(form)}
                        className="flex-1 gap-2 bg-[#10B981] hover:bg-[#0E9F71] text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#10B981]/25"
                      >
                        <FileText className="h-5 w-5" />
                        Submit Survey
                      </Button>
                      <Button 
                        onClick={() => { window.open(`/forms/public/${form.id}?companyId=${companyId}`, '_blank'); }}
                        variant="outline"
                        className="bg-transparent hover:bg-[#0B2C24] text-[#9AA4B2] hover:text-white border border-[#3A4047] hover:border-[#10B981]/30 transition-all duration-200"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentSurveysPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c]">
        <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <StudentSurveysContent />
    </Suspense>
  );
}
