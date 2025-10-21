'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Eye, CheckCircle, BookOpen } from 'lucide-react';

interface StudentSurveysInterfaceProps {
  companyId: string;
}

export default function StudentSurveysInterface({ companyId }: StudentSurveysInterfaceProps) {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSurveys();
  }, [companyId]);

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

  const handleTakeSurvey = (surveyId: string) => {
    // Open survey in student view
    window.open(`/surveys/${surveyId}?companyId=${companyId}&userId=student_${Date.now()}&view=form`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#9AA4B2]">Loading surveys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c]">
      <div className="bg-[#12151A] border-b border-[#2A2F36] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#E1E4EA]">Student Surveys</h1>
            <p className="text-[#9AA4B2]">Complete your assigned surveys</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#9AA4B2]">Student View</span>
            <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-6">
            {/* Welcome Message */}
            <div className="bg-gradient-to-r from-[#1A1E25] to-[#20242B] border border-[#2A2F36] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-[#E1E4EA] mb-2">
                Welcome, Student! 👋
              </h2>
              <p className="text-[#D1D5DB]">
                You have access to complete surveys assigned by your community.
              </p>
            </div>
            
            {/* Available Surveys */}
            <div className="bg-[#1A1E25] border border-[#2A2F36] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#E1E4EA] mb-4">Available Surveys</h3>
              
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
                  <p className="text-[#9AA4B2] mb-4">No surveys available at the moment</p>
                  <p className="text-sm text-[#6B7280]">
                    Your community owner will assign surveys for you to complete.
                  </p>
                </div>
              )}

              {!error && surveys.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {surveys.map((survey) => (
                    <Card key={survey.id} className="border border-[#2A2F36] bg-[#171A1F] shadow-lg hover:shadow-xl hover:shadow-[#10B981]/10 transition-all duration-300 hover:border-[#10B981]/30 group">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-[#0B2C24] flex items-center justify-center text-[#10B981] text-lg font-bold border border-[#17493A]">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg text-[#E1E4EA] group-hover:text-[#10B981] transition-colors">
                              {survey.name}
                            </CardTitle>
                            <p className="text-sm text-[#9AA4B2] group-hover:text-[#E1E4EA] transition-colors">
                              {survey.description}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-[#9AA4B2] group-hover:text-[#E1E4EA] transition-colors">
                          <CheckCircle className="h-4 w-4 text-[#10B981]" />
                          <span>Ready to complete</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleTakeSurvey(survey.id)}
                            className="flex-1 gap-2 bg-[#10B981] hover:bg-[#0E9F71] text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#10B981]/25"
                          >
                            <FileText className="h-5 w-5" />
                            Take Survey
                          </Button>
                          <Button 
                            onClick={() => window.open(`/surveys/${survey.id}?companyId=${companyId}&userId=student_${Date.now()}&view=form`, '_blank')}
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
      </div>
    </div>
  );
}
