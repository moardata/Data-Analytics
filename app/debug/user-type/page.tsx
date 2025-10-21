'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Settings, Eye, ExternalLink } from 'lucide-react';

function UserTypeDebugContent() {
  const searchParams = useSearchParams();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get all URL parameters
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    // Get Whop headers (if available)
    const whopHeaders = {
      'x-whop-user-id': null,
      'x-whop-company-id': null,
      'x-whop-membership-id': null,
      'x-whop-access-token': null
    };

    // Detect user type
    const isStudent = params.userType === 'student' || 
                     (params.userId && !params.userId.startsWith('admin_') && !params.userId.startsWith('operator_')) ||
                     !params.userType;
    
    const userInfo = {
      urlParams: params,
      whopHeaders,
      detectedType: isStudent ? 'student' : 'operator',
      isStudent,
      isOperator: !isStudent,
      redirectUrl: isStudent 
        ? `/student/surveys?companyId=${params.companyId}&userId=${params.userId}`
        : `/analytics?companyId=${params.companyId}`
    };

    setUserInfo(userInfo);
    setLoading(false);
  }, [searchParams]);

  const handleRedirect = (url: string) => {
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] flex items-center justify-center p-4">
        <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg max-w-2xl w-full">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#9AA4B2] text-lg">Analyzing user type...</p>
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
            User Type Detection Debug
          </h1>
          <p className="text-[#9AA4B2] text-lg">
            See how the system detects student vs operator access
          </p>
        </div>

        {/* Detection Results */}
        <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#E1E4EA] flex items-center gap-2">
              <Users className="h-5 w-5 text-[#10B981]" />
              Detection Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-[#E1E4EA]">Detected Type</h3>
                <Badge className={`${
                  userInfo?.isStudent 
                    ? 'bg-[#10B981] text-white' 
                    : 'bg-[#0B2C24] text-[#10B981] border border-[#17493A]'
                }`}>
                  {userInfo?.detectedType?.toUpperCase()}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-[#E1E4EA]">Redirect URL</h3>
                <p className="text-sm text-[#9AA4B2] break-all">
                  {userInfo?.redirectUrl}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-[#E1E4EA]">URL Parameters</h3>
              <div className="bg-[#0d0f12] border border-[#2A2F36] rounded-lg p-4">
                <pre className="text-sm text-[#9AA4B2] overflow-x-auto">
                  {JSON.stringify(userInfo?.urlParams, null, 2)}
                </pre>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-[#E1E4EA]">Whop Headers</h3>
              <div className="bg-[#0d0f12] border border-[#2A2F36] rounded-lg p-4">
                <pre className="text-sm text-[#9AA4B2] overflow-x-auto">
                  {JSON.stringify(userInfo?.whopHeaders, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => handleRedirect(userInfo?.redirectUrl || '/')}
            className="gap-2 bg-[#10B981] hover:bg-[#0E9F71] text-white"
          >
            <ExternalLink className="h-4 w-4" />
            Go to Detected Page
          </Button>
          
          <Button
            onClick={() => handleRedirect('/student/surveys')}
            className="gap-2 bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]"
          >
            <Users className="h-4 w-4" />
            Force Student View
          </Button>
          
          <Button
            onClick={() => handleRedirect('/analytics')}
            className="gap-2 bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]"
          >
            <Settings className="h-4 w-4" />
            Force Operator View
          </Button>
        </div>

        {/* Instructions */}
        <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#E1E4EA]">How to Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-[#E1E4EA]">Test as Student:</h4>
              <p className="text-sm text-[#9AA4B2]">
                Add <code className="bg-[#0d0f12] px-2 py-1 rounded">?userType=student</code> to your URL
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-[#E1E4EA]">Test as Operator:</h4>
              <p className="text-sm text-[#9AA4B2]">
                Add <code className="bg-[#0d0f12] px-2 py-1 rounded">?userType=operator</code> to your URL
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-[#E1E4EA]">Test with User ID:</h4>
              <p className="text-sm text-[#9AA4B2]">
                Add <code className="bg-[#0d0f12] px-2 py-1 rounded">?userId=student_123</code> or <code className="bg-[#0d0f12] px-2 py-1 rounded">?userId=admin_456</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function UserTypeDebugPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <UserTypeDebugContent />
    </Suspense>
  );
}
