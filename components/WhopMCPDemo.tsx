'use client';

import { useState, useEffect } from 'react';
import { useWhopMCP } from '@/lib/hooks/useWhopMCP';

/**
 * Demo component showing Whop MCP tools in action
 */
export function WhopMCPDemo() {
  const {
    loading,
    error,
    tools,
    loadTools,
    getCompanyInfo,
    getMemberships,
    getCompanyAnalytics,
    getContext,
    clearError
  } = useWhopMCP();

  const [companyId, setCompanyId] = useState('test_company');
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    loadTools();
  }, [loadTools]);

  const handleGetCompanyInfo = async () => {
    const result = await getCompanyInfo(companyId);
    setResult(result);
  };

  const handleGetMemberships = async () => {
    const result = await getMemberships(companyId, 1, 10);
    setResult(result);
  };

  const handleGetAnalytics = async () => {
    const result = await getCompanyAnalytics(companyId, '30d');
    setResult(result);
  };

  const handleGetContext = async () => {
    const result = await getContext();
    setResult(result);
  };

  return (
    <div className="p-6 bg-[#1E2228] rounded-lg border border-[#2A2F36]">
      <h2 className="text-xl font-semibold text-white mb-4">Whop MCP Tools Demo</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 text-red-400 rounded">
          {error}
          <button 
            onClick={clearError}
            className="ml-2 text-red-300 hover:text-red-200"
          >
            ×
          </button>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm text-[#9AA4B2] mb-2">
          Company ID:
        </label>
        <input
          type="text"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          className="w-full px-3 py-2 bg-[#0F1319] border border-[#2A2F36] rounded text-white"
          placeholder="Enter company ID"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={handleGetCompanyInfo}
          disabled={loading}
          className="px-4 py-2 bg-[#10B981] text-white rounded hover:bg-[#0E3A2F] disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Get Company Info'}
        </button>

        <button
          onClick={handleGetMemberships}
          disabled={loading}
          className="px-4 py-2 bg-[#10B981] text-white rounded hover:bg-[#0E3A2F] disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Get Memberships'}
        </button>

        <button
          onClick={handleGetAnalytics}
          disabled={loading}
          className="px-4 py-2 bg-[#10B981] text-white rounded hover:bg-[#0E3A2F] disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Get Analytics'}
        </button>

        <button
          onClick={handleGetContext}
          disabled={loading}
          className="px-4 py-2 bg-[#10B981] text-white rounded hover:bg-[#0E3A2F] disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Get Context'}
        </button>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-medium text-white mb-2">Available Tools:</h3>
        <div className="space-y-2">
          {tools.map((tool) => (
            <div key={tool.name} className="p-3 bg-[#0F1319] rounded border border-[#2A2F36]">
              <div className="font-medium text-[#10B981]">{tool.name}</div>
              <div className="text-sm text-[#9AA4B2]">{tool.description}</div>
            </div>
          ))}
        </div>
      </div>

      {result && (
        <div className="mt-4">
          <h3 className="text-lg font-medium text-white mb-2">Result:</h3>
          <pre className="bg-[#0F1319] p-4 rounded border border-[#2A2F36] text-sm text-[#D1D5DB] overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
