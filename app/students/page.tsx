/**
 * Students Page - Dark Emerald Theme
 * View and manage your students
 */

'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';
import { Users, Mail, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';

function StudentsContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('companyId') || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
  
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, [clientId]);

  const fetchStudents = async () => {
    try {
      const { data } = await supabase
        .from('entities')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

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
            Students
          </h1>
          <p className="text-xl font-bold text-[#9AA4B2]">
            {students.length} total students in your community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student, index) => (
            <div key={student.id}>
              <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-[#0B2C24] flex items-center justify-center text-[#10B981] text-xl font-bold border border-[#17493A]">
                      {student.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg text-[#E5E7EB]">{student.name || 'Unknown'}</CardTitle>
                      {student.metadata?.course && (
                        <Badge variant="secondary" className="mt-1">
                          {student.metadata.course}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {student.email && (
                      <div className="flex items-center gap-2 text-[#D1D5DB]">
                        <Mail className="h-4 w-4" />
                        <span className="font-bold">{student.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[#D1D5DB]">
                      <Calendar className="h-4 w-4" />
                      <span className="font-bold">
                        Joined {new Date(student.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {student.metadata?.progress && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm font-bold mb-1">
                          <span className="text-[#D1D5DB]">Progress</span>
                          <span className="text-[#10B981] font-black">{student.metadata.progress}%</span>
                        </div>
                        <div className="w-full bg-[#22262C] rounded-full h-2">
                          <div
                            className="bg-[#10B981] h-2 rounded-full transition-all"
                            style={{ width: `${student.metadata.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {students.length === 0 && (
          <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
            <CardContent className="py-16 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-[#2A2F36]" />
              <h3 className="text-2xl font-black text-[#E5E7EB] mb-2">
                No students yet
              </h3>
              <p className="text-lg font-bold text-[#9AA4B2]">
                Students will appear here when they join your courses
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function StudentsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c]">
        <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <StudentsContent />
    </Suspense>
  );
}
