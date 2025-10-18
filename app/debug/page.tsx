'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function DebugContent() {
  const searchParams = useSearchParams();
  const [permissionsResult, setPermissionsResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const companyId = searchParams.get('companyId') || searchParams.get('company_id');

  useEffect(() => {
    if (companyId) {
      testPermissions();
    }
  }, [companyId]);

  const testPermissions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId })
      });
      
      const data = await response.json();
      setPermissionsResult({
        status: response.status,
        data
      });
    } catch (error) {
      setPermissionsResult({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">🔍 Debug Dashboard</h1>
        
        {/* URL Info */}
        <div className="bg-[#1E2228] border border-[#2A2F36] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">URL Parameters</h2>
          <div className="space-y-2 font-mono text-sm">
            <div className="text-[#9AA4B2]">
              Full URL: <span className="text-[#10B981]">{typeof window !== 'undefined' ? window.location.href : 'Loading...'}</span>
            </div>
            <div className="text-[#9AA4B2]">
              Company ID from URL: <span className="text-[#10B981]">{companyId || '❌ NOT FOUND'}</span>
            </div>
          </div>
        </div>

        {/* Environment */}
        <div className="bg-[#1E2228] border border-[#2A2F36] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Environment</h2>
          <div className="space-y-2 font-mono text-sm">
            <div className="text-[#9AA4B2]">
              Hostname: <span className="text-[#10B981]">{typeof window !== 'undefined' ? window.location.hostname : 'Loading...'}</span>
            </div>
            <div className="text-[#9AA4B2]">
              Protocol: <span className="text-[#10B981]">{typeof window !== 'undefined' ? window.location.protocol : 'Loading...'}</span>
            </div>
            <div className="text-[#9AA4B2]">
              In iframe: <span className="text-[#10B981]">{typeof window !== 'undefined' ? (window !== window.parent ? 'YES' : 'NO') : 'Loading...'}</span>
            </div>
          </div>
        </div>

        {/* Permissions Test */}
        <div className="bg-[#1E2228] border border-[#2A2F36] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Permissions API Test</h2>
          
          {!companyId ? (
            <div className="text-yellow-400 text-sm">
              ⚠️ No company ID in URL. Add ?companyId=biz_3GYHNPbGkZCEky to test.
            </div>
          ) : loading ? (
            <div className="text-[#10B981]">Testing...</div>
          ) : permissionsResult ? (
            <div className="space-y-4">
              <div className="font-mono text-sm">
                <div className="text-[#9AA4B2] mb-2">Status: <span className={permissionsResult.status === 200 ? 'text-green-400' : 'text-red-400'}>{permissionsResult.status}</span></div>
                <pre className="bg-black/30 p-4 rounded text-[#10B981] overflow-auto max-h-96">
                  {JSON.stringify(permissionsResult, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <button 
              onClick={testPermissions}
              className="px-4 py-2 bg-[#10B981] text-white rounded hover:bg-[#0E3A2F]"
            >
              Test Permissions
            </button>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-[#1E2228] border border-[#2A2F36] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Links</h2>
          <div className="space-y-2">
            <a 
              href="/debug?companyId=biz_3GYHNPbGkZCEky"
              className="block text-[#10B981] hover:underline text-sm"
            >
              → Debug with company ID
            </a>
            <a 
              href="/analytics?companyId=biz_3GYHNPbGkZCEky&bypass=true"
              className="block text-[#10B981] hover:underline text-sm"
            >
              → Analytics with bypass mode
            </a>
            <a 
              href="/analytics?companyId=biz_3GYHNPbGkZCEky"
              className="block text-[#10B981] hover:underline text-sm"
            >
              → Analytics (normal mode)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DebugPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f1115] flex items-center justify-center text-white">Loading...</div>}>
      <DebugContent />
    </Suspense>
  );
}

