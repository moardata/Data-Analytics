'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, CheckCircle, BookOpen, X } from 'lucide-react';
import { DataForm } from '@/components/DataForm';
import { triggerConfetti } from '@/components/SurveyCompletionTracker';

interface StudentSurveysInterfaceProps {
  companyId: string;
}

export default function StudentSurveysInterface({ companyId }: StudentSurveysInterfaceProps) {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSurvey, setSelectedSurvey] = useState<any | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [completedSurveys, setCompletedSurveys] = useState<string[]>([]);

  useEffect(() => {
    fetchSurveys();
    fetchCompletedSurveys();
  }, [companyId]);

  const fetchCompletedSurveys = async () => {
    try {
      // Get whopUserId from localStorage (set during form submission)
      const whopUserId = localStorage.getItem('whop_user_id');
      
      if (!whopUserId) {
        console.log('No whopUserId found - student hasn\'t submitted any surveys yet');
        return;
      }

      const response = await fetch(`/api/forms/completion?companyId=${companyId}&whopUserId=${whopUserId}`);
      if (response.ok) {
        const data = await response.json();
        setCompletedSurveys(data.completedFormIds || []);
        console.log('Completed surveys:', data.completedFormIds);
      }
    } catch (error) {
      console.error('Error fetching completed surveys:', error);
    }
  };

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!companyId) {
        console.warn('⚠️ No company ID provided');
        setSurveys([]);
        return;
      }

      // Fetch surveys from the student surveys API
      const response = await fetch(`/api/student/surveys?companyId=${companyId}&userId=student_${Date.now()}`);
      
      if (!response.ok) {
        console.error('Failed to fetch surveys:', response.statusText);
        setError('Failed to load surveys');
        return;
      }

      const data = await response.json();
      setSurveys(data.surveys || []);
    } catch (error) {
      console.error('Error fetching surveys:', error);
      setError('Failed to load surveys');
    } finally {
      setLoading(false);
    }
  };

  const handleTakeSurvey = (survey: any) => {
    // Show survey inline instead of redirecting
    setSelectedSurvey(survey);
    setSubmitted(false);
  };

  const handleFormSubmit = async (responses: Record<string, any>) => {
    try {
      // Get or create persistent user ID
      let whopUserId = localStorage.getItem('whop_user_id');
      if (!whopUserId) {
        whopUserId = 'student_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('whop_user_id', whopUserId);
      }

      const submissionData = {
        formId: selectedSurvey.id,
        entityId: whopUserId,
        companyId: companyId,
        responses,
      };

      console.log('📝 [StudentSurveysInterface] Submitting form:', {
        formId: selectedSurvey.id,
        entityId: submissionData.entityId,
        companyId: companyId,
        responsesCount: Object.keys(responses).length,
        responses: responses
      });

      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      console.log('📊 [StudentSurveysInterface] Submission response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ [StudentSurveysInterface] Submission successful:', result);
        
        // 🎉 TRIGGER CONFETTI!
        triggerConfetti();
        
        // Mark survey as completed
        setCompletedSurveys([...completedSurveys, selectedSurvey.id]);
        
        // Show submitted state
        setSubmitted(true);
        
        // Refresh surveys and completions list
        fetchSurveys();
        setTimeout(() => fetchCompletedSurveys(), 500);
      } else {
        const errorData = await response.json();
        console.error('❌ [StudentSurveysInterface] Submission failed:', errorData);
        alert(`Failed to submit survey: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ [StudentSurveysInterface] Error submitting form:', error);
      alert('Failed to submit survey. Please try again.');
    }
  };

  const handleCloseForm = () => {
    setSelectedSurvey(null);
    setSubmitted(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#A1A1AA]">Loading surveys...</p>
        </div>
      </div>
    );
  }

  // Show form inline if survey is selected
  if (selectedSurvey) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f]">
        <div className="bg-[#111111] border-b border-[#1a1a1a] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#F8FAFC]">{selectedSurvey.name}</h1>
              <p className="text-[#A1A1AA]">Complete this survey</p>
            </div>
            <Button 
              onClick={handleCloseForm}
              variant="outline"
              className="bg-transparent hover:bg-[#1a1a1a] text-[#A1A1AA] hover:text-white border border-[#1a1a1a] hover:border-[#10B981]/30"
            >
              <X className="h-4 w-4 mr-2" />
              Back to Surveys
            </Button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="max-w-3xl mx-auto">
            {submitted ? (
              <Card className="border border-[#1a1a1a] bg-[#0f0f0f] shadow-lg">
                <CardContent className="py-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#F8FAFC] mb-2">
                    Thank You!
                  </h3>
                  <p className="text-[#A1A1AA] mb-6">
                    Your survey has been submitted successfully.
                  </p>
                  <Button 
                    onClick={handleCloseForm}
                    className="bg-[#10B981] hover:bg-[#0E9F71] text-white"
                  >
                    Back to Surveys
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-[#1a1a1a] bg-[#0f0f0f] shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-[#F8FAFC]">
                    {selectedSurvey.name}
                  </CardTitle>
                  <p className="text-[#A1A1AA]">
                    {selectedSurvey.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <DataForm
                    formId={selectedSurvey.id}
                    fields={selectedSurvey.fields}
                    onSubmit={handleFormSubmit}
                    title=""
                    description=""
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  const totalSurveys = surveys.length;
  const completedCount = completedSurveys.length;
  const completionPercentage = totalSurveys > 0 ? Math.round((completedCount / totalSurveys) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f]">
      <div className="bg-[#111111] border-b border-[#1a1a1a] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#F8FAFC]">Student Surveys</h1>
            <p className="text-[#A1A1AA]">Complete your assigned surveys</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#A1A1AA]">Student View</span>
            <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-6">
            {/* Completion Progress Bar */}
            {totalSurveys > 0 && (
              <Card className="border border-[#1a1a1a] bg-[#0f0f0f] shadow-lg">
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

            {/* Welcome Message */}
            <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border border-[#1a1a1a] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-[#F8FAFC] mb-2">
                Welcome, Student! 👋
              </h2>
              <p className="text-[#A1A1AA]">
                You have access to complete surveys assigned by your community.
              </p>
            </div>
            
            {/* Available Surveys */}
            <div className="bg-[#1a1a1a] border border-[#1a1a1a] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4">Available Surveys</h3>
              
              {error && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-red-500" />
                  </div>
                  <p className="text-red-400 mb-4">{error}</p>
                  <Button 
                    onClick={fetchSurveys}
                    className="bg-[#10B981] hover:bg-[#0E9F71] text-white"
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {!error && surveys.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#10B981]/20 flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-[#10B981]" />
                  </div>
                  <p className="text-[#A1A1AA] mb-4">No surveys available at the moment</p>
                  <p className="text-sm text-[#A1A1AA]">
                    Your community owner will assign surveys for you to complete.
                  </p>
                </div>
              )}

              {!error && surveys.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {surveys.map((survey) => {
                    const isCompleted = completedSurveys.includes(survey.id);
                    return (
                    <Card key={survey.id} className={`border shadow-lg hover:shadow-xl transition-all duration-300 group ${
                      isCompleted 
                        ? 'border-[#10B981] bg-[#10B981]/5' 
                        : 'border-[#1a1a1a] bg-[#0f0f0f] hover:border-[#10B981]/30'
                    }`}>
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                              isCompleted 
                                ? 'bg-[#10B981] text-white' 
                                : 'bg-[#0B2C24] text-[#10B981] border border-[#17493A]'
                            }`}>
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : (
                                <FileText className="h-5 w-5" />
                              )}
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-lg text-[#F8FAFC] group-hover:text-[#10B981] transition-colors">
                                {survey.name}
                              </CardTitle>
                              <p className="text-sm text-[#A1A1AA] group-hover:text-[#F8FAFC] transition-colors">
                                {survey.description}
                              </p>
                            </div>
                          </div>
                          {isCompleted && (
                            <Badge className="bg-[#10B981] text-white border-0 gap-1 px-2 py-1">
                              <CheckCircle className="h-3 w-3" />
                              ✨
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {isCompleted ? (
                          <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg p-3">
                            <p className="text-sm text-[#10B981] font-medium">
                              🎉 Thank you for completing this survey!
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-[#A1A1AA] group-hover:text-[#F8FAFC] transition-colors">
                            <CheckCircle className="h-4 w-4 text-[#10B981]" />
                            <span>Ready to complete</span>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleTakeSurvey(survey)}
                            disabled={isCompleted}
                            className={`flex-1 gap-2 font-medium py-3 px-6 rounded-lg transition-all duration-200 ${
                              isCompleted
                                ? 'bg-[#6B7280] hover:bg-[#6B7280] text-white opacity-60 cursor-not-allowed'
                                : 'bg-[#10B981] hover:bg-[#0E9F71] text-white hover:shadow-lg hover:shadow-[#10B981]/25'
                            }`}
                          >
                            <FileText className="h-5 w-5" />
                            {isCompleted ? 'Already Completed' : 'Take Survey'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )})}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
