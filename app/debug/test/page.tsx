'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function DebugTestPage() {
  const [checks, setChecks] = useState({
    windowAvailable: false,
    whopHeaders: false,
    apiReachable: false,
    companyId: '',
    errorMessage: '',
  });

  useEffect(() => {
    async function runDiagnostics() {
      const results: any = {
        windowAvailable: typeof window !== 'undefined',
        companyId: '',
        errorMessage: '',
      };

      // Check for company ID
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        results.companyId = params.get('companyId') || 'Not found in URL';
      }

      // Test API endpoint
      try {
        const response = await fetch('/api/debug/headers');
        results.apiReachable = response.ok;
        
        if (response.ok) {
          const data = await response.json();
          results.whopHeaders = !!data.headers;
        }
      } catch (error: any) {
        results.errorMessage = error?.message || 'Unknown error';
      }

      setChecks(results);
    }

    runDiagnostics();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#F8FAFC] mb-2">
          🔍 Diagnostic Test Page
        </h1>
        <p className="text-[#A1A1AA] mb-8">
          This page tests if the app is working correctly
        </p>

        <div className="space-y-4">
          {/* Window Check */}
          <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#F8FAFC]">
                {checks.windowAvailable ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Browser Environment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#A1A1AA]">
                {checks.windowAvailable
                  ? '✅ Window object is available'
                  : '❌ Window object is not available (SSR issue)'}
              </p>
            </CardContent>
          </Card>

          {/* Company ID Check */}
          <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#F8FAFC]">
                {checks.companyId && checks.companyId !== 'Not found in URL' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
                Company ID
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#A1A1AA]">
                <strong>Company ID:</strong> {checks.companyId || 'Not detected'}
              </p>
              <p className="text-xs text-[#A1A1AA] mt-2">
                Expected format: biz_xxxxxxxxxxxxx
              </p>
            </CardContent>
          </Card>

          {/* API Check */}
          <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#F8FAFC]">
                {checks.apiReachable ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                API Endpoints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#A1A1AA]">
                {checks.apiReachable
                  ? '✅ API is reachable'
                  : '❌ API is not reachable'}
              </p>
              {checks.errorMessage && (
                <p className="text-red-400 text-sm mt-2">
                  Error: {checks.errorMessage}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Whop Headers Check */}
          <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#F8FAFC]">
                {checks.whopHeaders ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Whop Headers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#A1A1AA]">
                {checks.whopHeaders
                  ? '✅ Whop headers detected'
                  : '❌ Whop headers not detected (may be running locally)'}
              </p>
            </CardContent>
          </Card>

          {/* Overall Status */}
          <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
            <CardHeader>
              <CardTitle className="text-[#F8FAFC]">Overall Status</CardTitle>
            </CardHeader>
            <CardContent>
              {checks.windowAvailable && checks.apiReachable ? (
                <div className="text-green-400">
                  ✅ App appears to be working correctly!
                </div>
              ) : (
                <div className="text-red-400">
                  ❌ Some issues detected - check above for details
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="border border-[#1a1a1a] bg-[#0f0f0f]">
            <CardHeader>
              <CardTitle className="text-[#F8FAFC]">How to Access App</CardTitle>
            </CardHeader>
            <CardContent className="text-[#A1A1AA] space-y-2">
              <p>To access the app as an admin/owner:</p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Make sure you have a company ID (format: biz_xxxxx)</li>
                <li>Access the app with: <code className="bg-[#0a0a0a] px-2 py-1 rounded text-green-400">/?companyId=YOUR_COMPANY_ID</code></li>
                <li>Or go directly to analytics: <code className="bg-[#0a0a0a] px-2 py-1 rounded text-green-400">/analytics?companyId=YOUR_COMPANY_ID</code></li>
              </ol>
              <p className="mt-4">To test student view:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Use a different Whop user account (not the company owner)</li>
                <li>Access with the same company ID parameter</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

