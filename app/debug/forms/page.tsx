'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, RefreshCw, Database, CheckCircle, XCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

function DebugFormsContent() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');
  
  const [loading, setLoading] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (companyId) {
      fetchDebugData();
    }
  }, [companyId]);

  const fetchDebugData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch data directly from the student surveys API
      const response = await fetch(`/api/student/surveys?companyId=${companyId}&userId=debug_user`);
      const data = await response.json();

      if (response.ok) {
        // Create debug data structure
        setDebugData({
          companyId,
          clientId: 'debug_client',
          allForms: data.surveys || [],
          activeForms: data.surveys || [],
          totalForms: data.surveys?.length || 0,
          activeFormsCount: data.surveys?.length || 0
        });
      } else {
        setError(data.error || 'Failed to fetch debug data');
      }
    } catch (error) {
      console.error('Error fetching debug data:', error);
      setError('Failed to fetch debug data');
    } finally {
      setLoading(false);
    }
  };

  if (!companyId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
            <CardContent className="py-16 text-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-[#E1E4EA] mb-2">
                Company ID Required
              </h3>
              <p className="text-[#9AA4B2]">
                Please add ?companyId=YOUR_COMPANY_ID to the URL
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c] p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-[#E5E7EB] mb-2">
            Debug Forms Database
          </h1>
          <p className="text-xl text-[#9AA4B2]">
            Debugging form storage and retrieval for company: {companyId}
          </p>
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={fetchDebugData}
            disabled={loading}
            className="gap-2 bg-[#10B981] hover:bg-[#0E9F71] text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Debug Data
          </Button>
        </div>

        {error && (
          <Card className="border border-red-500 bg-red-900/20 shadow-lg">
            <CardContent className="py-6">
              <div className="flex items-center gap-3">
                <XCircle className="h-6 w-6 text-red-500" />
                <div>
                  <h3 className="text-lg font-semibold text-red-400">Error</h3>
                  <p className="text-red-300">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {debugData && (
          <div className="space-y-6">
            {/* Database Connection Status */}
            <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#E1E4EA] flex items-center gap-2">
                  <Database className="h-5 w-5 text-[#10B981]" />
                  Database Connection Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-[#E1E4EA]">Connected to Supabase</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-[#E1E4EA]">Client Found: {debugData.clientId}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Forms Summary */}
            <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#E1E4EA] flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#10B981]" />
                  Forms Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#10B981]">{debugData.totalForms}</div>
                    <div className="text-[#9AA4B2]">Total Forms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500">{debugData.activeFormsCount}</div>
                    <div className="text-[#9AA4B2]">Active Forms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-500">{debugData.totalForms - debugData.activeFormsCount}</div>
                    <div className="text-[#9AA4B2]">Draft Forms</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* All Forms List */}
            <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#E1E4EA]">All Forms in Database</CardTitle>
              </CardHeader>
              <CardContent>
                {debugData.allForms.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 text-[#2A2F36] mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-[#E1E4EA] mb-2">No Forms Found</h3>
                    <p className="text-[#9AA4B2]">No forms have been created for this company yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {debugData.allForms.map((form: any) => (
                      <div key={form.id} className="flex items-center justify-between p-4 bg-[#0B2C24] rounded-lg border border-[#17493A]">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-[#10B981]" />
                          <div>
                            <div className="font-semibold text-[#E1E4EA]">{form.name}</div>
                            <div className="text-sm text-[#9AA4B2]">ID: {form.id}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={form.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}>
                            {form.is_active ? 'Published' : 'Draft'}
                          </Badge>
                          <div className="text-xs text-[#9AA4B2]">
                            {new Date(form.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Forms List */}
            <Card className="border border-[#2A2F36] bg-[#171A1F] shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#E1E4EA]">Active Forms (Should Show to Students)</CardTitle>
              </CardHeader>
              <CardContent>
                {debugData.activeForms.length === 0 ? (
                  <div className="text-center py-8">
                    <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-[#E1E4EA] mb-2">No Active Forms</h3>
                    <p className="text-[#9AA4B2]">This is why students see "No surveys available".</p>
                    <p className="text-[#9AA4B2] mt-2">Publish some forms to make them visible to students.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {debugData.activeForms.map((form: any) => (
                      <div key={form.id} className="flex items-center justify-between p-4 bg-green-900/20 rounded-lg border border-green-500/30">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <div>
                            <div className="font-semibold text-[#E1E4EA]">{form.name}</div>
                            <div className="text-sm text-[#9AA4B2]">ID: {form.id}</div>
                          </div>
                        </div>
                        <Badge className="bg-green-500 text-white">
                          Published
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DebugFormsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0d0f12] to-[#14171c]">
        <div className="w-16 h-16 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DebugFormsContent />
    </Suspense>
  );
}
