'use client';

import { useEffect, useState } from 'react';

export default function OpenAIKeyDebugPage() {
  const [keyInfo, setKeyInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/debug/check-openai-key')
      .then(r => r.json())
      .then(data => {
        setKeyInfo(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching key info:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">OpenAI Key Debug</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🔍 OpenAI API Key Debug</h1>
        
        {keyInfo ? (
          <div className="space-y-4">
            {/* Status Badge */}
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <h2 className="text-lg font-semibold mb-4">Status</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-2xl ${keyInfo.isCorrectKey ? 'text-green-500' : 'text-red-500'}`}>
                    {keyInfo.isCorrectKey ? '✅' : '❌'}
                  </span>
                  <span className="text-xl">
                    {keyInfo.isCorrectKey ? 'Correct Key Loaded' : 'Wrong Key or Missing'}
                  </span>
                </div>
              </div>
            </div>

            {/* Key Details */}
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <h2 className="text-lg font-semibold mb-4">Key Details</h2>
              <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Has Key:</span>
                  <span className={keyInfo.hasKey ? 'text-green-400' : 'text-red-400'}>
                    {keyInfo.hasKey ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Key Length:</span>
                  <span className="text-white">{keyInfo.keyLength}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Key Prefix:</span>
                  <span className="text-white">{keyInfo.keyPrefix}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Key Suffix:</span>
                  <span className={keyInfo.isCorrectKey ? 'text-green-400' : 'text-red-400'}>
                    {keyInfo.keySuffix}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Expected Suffix:</span>
                  <span className="text-gray-300">{keyInfo.expectedSuffix}</span>
                </div>
              </div>
            </div>

            {/* Diagnosis */}
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <h2 className="text-lg font-semibold mb-4">Diagnosis</h2>
              <div className="space-y-3">
                {keyInfo.isCorrectKey ? (
                  <div className="text-green-400">
                    ✅ OpenAI API key is correctly configured!
                    <br />
                    <span className="text-gray-400 text-sm">
                      AI insights generation should work.
                    </span>
                  </div>
                ) : keyInfo.isOldKey ? (
                  <div className="text-red-400">
                    ❌ Deployment is using the OLD API key (ending in ...uJ8A)
                    <br />
                    <br />
                    <span className="text-gray-300 text-sm">
                      <strong>Fix:</strong>
                      <br />
                      1. Go to Vercel Dashboard → Project Settings → Environment Variables
                      <br />
                      2. Update OPENAI_API_KEY to end with ...O1oHb2bKkA
                      <br />
                      3. Save and redeploy
                      <br />
                      4. Wait 2-3 minutes
                      <br />
                      5. Refresh this page
                    </span>
                  </div>
                ) : !keyInfo.hasKey ? (
                  <div className="text-red-400">
                    ❌ No OpenAI API key found
                    <br />
                    <br />
                    <span className="text-gray-300 text-sm">
                      <strong>Fix:</strong>
                      <br />
                      1. Go to Vercel Dashboard → Project Settings → Environment Variables
                      <br />
                      2. Add OPENAI_API_KEY with your API key
                      <br />
                      3. Check "Production" environment
                      <br />
                      4. Save and redeploy
                    </span>
                  </div>
                ) : (
                  <div className="text-yellow-400">
                    ⚠️ Key exists but doesn't match expected format
                    <br />
                    <span className="text-gray-400 text-sm">
                      Current: {keyInfo.keySuffix}
                      <br />
                      Expected: {keyInfo.expectedSuffix}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Environment Info */}
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <h2 className="text-lg font-semibold mb-4">Environment Info</h2>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Environment:</span>
                  <span className="text-white">{keyInfo.environment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Timestamp:</span>
                  <span className="text-white">{new Date(keyInfo.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              🔄 Refresh Check
            </button>
          </div>
        ) : (
          <div className="bg-red-900/20 border border-red-800 p-6 rounded-lg">
            <p className="text-red-400">Failed to load key information</p>
          </div>
        )}
      </div>
    </div>
  );
}

