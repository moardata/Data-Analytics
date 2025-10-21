'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, Users, CheckCircle, ExternalLink } from 'lucide-react';

function StudentSurveysContent() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');
  const userId = searchParams.get('userId') || 'student_' + Math.random().toString(36).substr(2, 9);
  
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudentSurveys();
  }, [companyId, userId]);

  const fetchStudentSurveys = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // This would call your API to get surveys available to this student
      const response = await fetch(`/api/student/surveys?companyId=${companyId}&userId=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setSurveys(data.surveys || []);
      } else {
        setError(data.error || 'Failed to load surveys');
      }
    } catch (error) {
      console.error('Error fetching student surveys:', error);
      setError('Failed to load surveys');
    } finally {
      setLoading(false);
    }
  };

  const handleTakeSurvey = (surveyId: string) => {
    // Open survey in student view (no admin controls)
    window.open(`/surveys/${surveyId}?companyId=${companyId}&userId=${userId}&view=form`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] flex items-center justify-center p-4">
        <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg max-w-2xl w-full">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#9AA4B2] text-lg">Loading your surveys...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] flex items-center justify-center p-4">
        <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg max-w-2xl w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h3 className="text-xl font-semibold text-[#E1E4EA] mb-2">Unable to Load Surveys</h3>
            <p className="text-[#9AA4B2]">{error}</p>
            <Button 
              onClick={fetchStudentSurveys}
              className="mt-4 bg-[#10B981] hover:bg-[#0E9F71] text-white"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#E1E4EA] mb-2">
            Course Surveys
          </h1>
          <p className="text-[#9AA4B2] text-lg">
            Complete the surveys below to help improve your learning experience
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#0B2C24]">
                  <FileText className="h-5 w-5 text-[#10B981]" />
                </div>
                <div>
                  <p className="text-sm text-[#9AA4B2]">Available</p>
                  <p className="text-xl font-bold text-[#E1E4EA]">{surveys.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#0B2C24]">
                  <CheckCircle className="h-5 w-5 text-[#10B981]" />
                </div>
                <div>
                  <p className="text-sm text-[#9AA4B2]">Completed</p>
                  <p className="text-xl font-bold text-[#E1E4EA]">
                    {surveys.filter(s => s.completed).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#0B2C24]">
                  <Clock className="h-5 w-5 text-[#10B981]" />
                </div>
                <div>
                  <p className="text-sm text-[#9AA4B2]">Pending</p>
                  <p className="text-xl font-bold text-[#E1E4EA]">
                    {surveys.filter(s => !s.completed).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Surveys List */}
        {surveys.length === 0 ? (
          <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-[#0B2C24] flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-[#9AA4B2]" />
              </div>
              <h3 className="text-xl font-semibold text-[#E1E4EA] mb-2">
                No Surveys Available
              </h3>
              <p className="text-[#9AA4B2] mb-4">
                There are no surveys available for you to complete at this time.
              </p>
              <p className="text-sm text-[#9AA4B2]">
                Check back later or contact your instructor if you believe this is an error.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {surveys.map((survey) => (
              <Card 
                key={survey.id} 
                className={`border transition-all duration-200 ${
                  survey.completed
                    ? 'border-[#10B981] bg-[#0B2C24]'
                    : 'border-[#2A2F36] bg-[#171A1F]'
                } shadow-lg`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-[#E1E4EA] mb-2">
                        {survey.name}
                      </CardTitle>
                      {survey.description && (
                        <p className="text-sm text-[#9AA4B2] mb-3">
                          {survey.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-[#9AA4B2]">
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <span>{survey.fields?.length || 0} questions</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{survey.estimatedTime || '5'} min</span>
                        </div>
                        {survey.deadline && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Due: {new Date(survey.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {survey.completed ? (
                        <Badge className="bg-[#10B981] text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      ) : (
                        <Badge className="bg-[#0B2C24] text-[#10B981] border border-[#17493A]">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-[#9AA4B2]">
                      {survey.completed ? (
                        <span>✅ Submitted on {new Date(survey.completedAt).toLocaleDateString()}</span>
                      ) : (
                        <span>📝 Ready to complete</span>
                      )}
                    </div>
                    <Button
                      onClick={() => handleTakeSurvey(survey.id)}
                      className={`gap-2 ${
                        survey.completed
                          ? 'bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]'
                          : 'bg-[#10B981] hover:bg-[#0E9F71] text-white'
                      }`}
                    >
                      <ExternalLink className="h-4 w-4" />
                      {survey.completed ? 'View Again' : 'Take Survey'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-[#9AA4B2]">
          <p>Your responses help improve the course experience for everyone.</p>
          <p>All surveys are anonymous and confidential.</p>
        </div>
      </div>
    </div>
  );
}

export default function StudentSurveysPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <StudentSurveysContent />
    </Suspense>
  );
}
