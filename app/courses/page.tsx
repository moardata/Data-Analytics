/**
 * Courses Analytics Page
 * Displays course overview, enrollment stats, and completion rates
 */

'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, TrendingUp, CheckCircle, BarChart3, RefreshCw } from 'lucide-react';

export const dynamic = 'force-dynamic';

function CoursesContent() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId') || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
  
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, [companyId]);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/courses/sync?companyId=${companyId}`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch courses: ${res.statusText}`);
      }

      const data = await res.json();
      setCourses(data.courses || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err instanceof Error ? err.message : 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncCourses = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`/api/courses/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to sync courses');
      }

      const data = await res.json();
      alert(`✅ Synced ${data.syncedCourses} courses and ${data.syncedLessons} lessons!`);
      
      // Refresh the list
      fetchCourses();
    } catch (err) {
      console.error('Error syncing courses:', err);
      alert('❌ Failed to sync courses. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-2">Error</div>
          <div className="text-[#9AA4B2] text-sm mb-6">{error}</div>
          <Button onClick={fetchCourses} className="bg-[#0B2C24] hover:bg-[#0E3A2F]">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const totalEnrollments = courses.reduce((sum, c) => sum + (c.enrollments?.[0]?.count || 0), 0);
  const totalLessons = courses.reduce((sum, c) => sum + (c.lessons?.[0]?.count || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black text-[#E5E7EB] mb-2">
              Course Analytics
            </h1>
            <p className="text-xl font-bold text-[#9AA4B2]">
              Track course performance and student progress
            </p>
          </div>
          <Button
            onClick={handleSyncCourses}
            disabled={syncing}
            className="gap-2 bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Courses'}
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-[#0B2C24]">
                  <BookOpen className="h-6 w-6 text-[#10B981]" />
                </div>
                <div>
                  <div className="text-3xl font-black text-[#E5E7EB]">{courses.length}</div>
                  <div className="text-sm text-[#9AA4B2]">Total Courses</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-[#0B2C24]">
                  <Users className="h-6 w-6 text-[#10B981]" />
                </div>
                <div>
                  <div className="text-3xl font-black text-[#E5E7EB]">{totalEnrollments}</div>
                  <div className="text-sm text-[#9AA4B2]">Total Enrollments</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-[#0B2C24]">
                  <BarChart3 className="h-6 w-6 text-[#10B981]" />
                </div>
                <div>
                  <div className="text-3xl font-black text-[#E5E7EB]">{totalLessons}</div>
                  <div className="text-sm text-[#9AA4B2]">Total Lessons</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-[#0B2C24]">
                  <TrendingUp className="h-6 w-6 text-[#10B981]" />
                </div>
                <div>
                  <div className="text-3xl font-black text-[#E5E7EB]">
                    {courses.length > 0 ? (totalEnrollments / courses.length).toFixed(1) : '0'}
                  </div>
                  <div className="text-sm text-[#9AA4B2]">Avg per Course</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses List */}
        {courses.length === 0 ? (
          <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
            <CardContent className="py-16 text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-[#2A2F36]" />
              <h3 className="text-2xl font-black text-[#E1E4EA] mb-2">
                No courses yet
              </h3>
              <p className="text-lg text-[#9AA4B2] mb-6">
                Sync your courses from Whop to start tracking analytics
              </p>
              <Button 
                onClick={handleSyncCourses}
                disabled={syncing}
                className="gap-2 bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]"
              >
                <RefreshCw className={`h-5 w-5 ${syncing ? 'animate-spin' : ''}`} />
                Sync Your Courses
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="border border-[#2A2F36] bg-[#171A1F] shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  {course.thumbnail_url && (
                    <img 
                      src={course.thumbnail_url} 
                      alt={course.title}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  )}
                  <CardTitle className="text-[#E1E4EA] flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-[#10B981]" />
                    {course.title}
                  </CardTitle>
                  {course.description && (
                    <CardDescription className="text-[#9AA4B2] line-clamp-2">
                      {course.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#9AA4B2]">Lessons:</span>
                    <span className="text-[#E1E4EA] font-bold">{course.lessons?.[0]?.count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#9AA4B2]">Enrollments:</span>
                    <span className="text-[#E1E4EA] font-bold">{course.enrollments?.[0]?.count || 0}</span>
                  </div>
                  {course.instructor_name && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#9AA4B2]">Instructor:</span>
                      <span className="text-[#E1E4EA] font-bold">{course.instructor_name}</span>
                    </div>
                  )}
                  <div className="pt-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                      course.is_published 
                        ? 'bg-[#0B2C24] text-[#10B981] border border-[#17493A]'
                        : 'bg-[#2A2F36] text-[#9AA4B2]'
                    }`}>
                      {course.is_published ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          Published
                        </>
                      ) : (
                        'Draft'
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c]">
        <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CoursesContent />
    </Suspense>
  );
}

