'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Play, CheckCircle, Clock, Users, Star } from 'lucide-react';
import StudentFormDelivery from '@/components/StudentFormDelivery';

function CourseContent({ courseId }: { courseId: string }) {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId') || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentModule, setCurrentModule] = useState(0);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [showSurvey, setShowSurvey] = useState(false);
  const [activeFormId, setActiveFormId] = useState<string | null>(null);

  useEffect(() => {
    fetchCourse();
    fetchActiveForm();
  }, [courseId, companyId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      // Mock course data - in real implementation, this would fetch from your API
      const mockCourse = {
        id: courseId,
        name: "Advanced Data Analytics",
        description: "Master the fundamentals of data analytics and visualization",
        instructor: "Dr. Sarah Johnson",
        duration: "8 weeks",
        modules: [
          {
            id: "module-1",
            title: "Introduction to Data Analytics",
            description: "Learn the basics of data analysis and its applications",
            duration: "45 min",
            completed: false
          },
          {
            id: "module-2", 
            title: "Data Collection and Cleaning",
            description: "Understand how to collect and prepare data for analysis",
            duration: "60 min",
            completed: false
          },
          {
            id: "module-3",
            title: "Statistical Analysis",
            description: "Apply statistical methods to analyze data patterns",
            duration: "75 min",
            completed: false
          },
          {
            id: "module-4",
            title: "Data Visualization",
            description: "Create compelling visualizations to communicate insights",
            duration: "90 min",
            completed: false
          }
        ]
      };
      
      setCourse(mockCourse);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveForm = async () => {
    try {
      console.log('Fetching active form for company:', companyId, 'course:', courseId);
      const response = await fetch(`/api/forms/active?companyId=${companyId}&courseId=${courseId}`);
      const data = await response.json();
      
      console.log('Active form response:', data);
      
      if (response.ok && data.form) {
        console.log('Setting active form ID:', data.form.id);
        setActiveFormId(data.form.id);
      } else {
        console.log('No active form found');
      }
    } catch (error) {
      console.error('Error fetching active form:', error);
    }
  };

  const handleModuleComplete = (moduleIndex: number) => {
    setCompletedModules(prev => [...prev, moduleIndex]);
    
    // Check if this is the last module or if we should show survey
    if (moduleIndex === course.modules.length - 1 || moduleIndex === 1) {
      console.log('Module completed, showing survey in 2 seconds...');
      // Show survey after completing module 2 or the last module
      setTimeout(() => {
        console.log('Setting showSurvey to true');
        setShowSurvey(true);
      }, 2000); // 2 second delay
    }
  };

  const handleSurveyComplete = () => {
    setShowSurvey(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#9AA4B2]">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#E1E4EA] mb-2">Course Not Found</h2>
          <p className="text-[#9AA4B2]">This course doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Course Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-[#9AA4B2]">
            <BookOpen className="h-4 w-4" />
            <span>Course</span>
          </div>
          <h1 className="text-4xl font-black text-[#E1E4EA]">{course.name}</h1>
          <p className="text-xl text-[#9AA4B2]">{course.description}</p>
          
          <div className="flex items-center gap-6 text-sm text-[#9AA4B2]">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Instructor: {course.instructor}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{course.duration}</span>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#E1E4EA] flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-[#10B981]" />
              Course Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[#E1E4EA]">Overall Progress</span>
                <span className="text-[#10B981] font-semibold">
                  {Math.round((completedModules.length / course.modules.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-[#2A2F36] rounded-full h-2">
                <div 
                  className="bg-[#10B981] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedModules.length / course.modules.length) * 100}%` }}
                />
              </div>
              <div className="flex items-center gap-4 text-sm text-[#9AA4B2]">
                <span>{completedModules.length} of {course.modules.length} modules completed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Modules */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-[#E1E4EA]">Course Modules</h2>
          <div className="space-y-3">
            {course.modules.map((module: any, index: number) => (
              <Card 
                key={module.id} 
                className={`border transition-all duration-200 ${
                  completedModules.includes(index)
                    ? 'border-[#10B981] bg-[#0B2C24]'
                    : 'border-[#2A2F36] bg-[#171A1F]'
                } shadow-lg`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        completedModules.includes(index)
                          ? 'bg-[#10B981] text-white'
                          : 'bg-[#2A2F36] text-[#9AA4B2]'
                      }`}>
                        {completedModules.includes(index) ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-bold">{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#E1E4EA]">{module.title}</h3>
                        <p className="text-sm text-[#9AA4B2]">{module.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-[#9AA4B2]">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{module.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {completedModules.includes(index) ? (
                        <Badge className="bg-[#10B981] text-white">
                          Completed
                        </Badge>
                      ) : (
                        <Button
                          onClick={() => handleModuleComplete(index)}
                          className="gap-2 bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]"
                          size="sm"
                        >
                          <Play className="h-4 w-4" />
                          Start Module
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Survey Delivery */}
        {showSurvey && (
          <StudentFormDelivery
            formId={activeFormId || 'test-form-id'}
            companyId={companyId || 'test-company'}
            courseId={courseId}
            autoShow={true}
            delay={1000}
            frequency="once"
            allowSkip={true}
            title="Course Feedback"
            description="Help us improve this course by sharing your thoughts"
          />
        )}
        
        {/* Debug Info */}
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-xs">
          <div className="font-bold mb-2">🔍 Debug Panel</div>
          <div>showSurvey: <span className={showSurvey ? 'text-green-400' : 'text-red-400'}>{showSurvey.toString()}</span></div>
          <div>activeFormId: <span className={activeFormId ? 'text-green-400' : 'text-red-400'}>{activeFormId || 'null'}</span></div>
          <div>companyId: <span className={companyId ? 'text-green-400' : 'text-red-400'}>{companyId || 'null'}</span></div>
          <div>courseId: {courseId}</div>
          <div>completedModules: [{completedModules.join(', ')}]</div>
          <div className="mt-2">
            <button 
              onClick={() => {
                console.log('Manual survey trigger');
                setShowSurvey(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
            >
              Force Show Survey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CourseContent courseId={courseId} />
    </Suspense>
  );
}
