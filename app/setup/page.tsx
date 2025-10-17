/**
 * Setup Page - Creates client record for new companies
 */

'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function SetupPage() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId') || 'biz_3GYHNPbGkZCEky';
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const setupClient = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/setup/client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId,
          companyName: `Test Company ${companyId}`,
          companyEmail: `test@${companyId}.com`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Setup failed');
      }

      setMessage(`✅ ${data.message}. Client ID: ${data.clientId}`);
      
      // Redirect to analytics after successful setup
      setTimeout(() => {
        window.location.href = `/analytics?companyId=${companyId}`;
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 bg-[#16191F] border-[#2A2F36]">
        <CardContent className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              Initial Setup
            </h1>
            <p className="text-[#9AA4B2] mb-6">
              Setting up your analytics dashboard for company:
              <br />
              <code className="text-emerald-400 bg-[#0B2C24] px-2 py-1 rounded text-sm">
                {companyId}
              </code>
            </p>

            {message && (
              <div className="mb-4 p-3 bg-emerald-900/30 border border-emerald-600 rounded text-emerald-300 text-sm">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-600 rounded text-red-300 text-sm">
                ❌ {error}
              </div>
            )}

            <Button
              onClick={setupClient}
              disabled={loading}
              className="w-full bg-emerald-700/40 hover:bg-emerald-700 border-emerald-600 text-white"
            >
              {loading ? 'Setting up...' : 'Initialize Dashboard'}
            </Button>

            <p className="text-[#9AA4B2] text-xs mt-4">
              This creates your company's analytics profile and prepares the dashboard.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
