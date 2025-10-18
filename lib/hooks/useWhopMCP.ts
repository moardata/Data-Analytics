import { useState, useCallback } from 'react';

interface WhopMCPTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

interface WhopMCPResult {
  success: boolean;
  tool?: string;
  result?: any;
  error?: string;
  timestamp?: string;
}

interface WhopMCPContext {
  companyId?: string;
  userId?: string;
  appId?: string;
  permissions?: string[];
}

/**
 * Hook to use Whop MCP tools in React components
 */
export function useWhopMCP() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tools, setTools] = useState<WhopMCPTool[]>([]);

  // Load available tools
  const loadTools = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/mcp/whop?action=tools');
      const data = await response.json();

      if (data.success) {
        setTools(data.tools);
      } else {
        setError(data.error || 'Failed to load tools');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tools');
    } finally {
      setLoading(false);
    }
  }, []);

  // Execute a tool
  const executeTool = useCallback(async (
    toolName: string, 
    parameters: Record<string, any> = {},
    context?: WhopMCPContext
  ): Promise<WhopMCPResult> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/mcp/whop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool: toolName,
          parameters,
          context
        })
      });

      const data = await response.json();

      if (data.success) {
        return data;
      } else {
        const errorMsg = data.error || 'Tool execution failed';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Tool execution failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user context
  const getContext = useCallback(async (): Promise<WhopMCPResult> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/mcp/whop?action=context');
      const data = await response.json();

      if (data.success) {
        return data;
      } else {
        const errorMsg = data.error || 'Failed to get context';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get context';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Convenience methods for common operations
  const getCompanyInfo = useCallback(async (companyId: string) => {
    return executeTool('whop_get_company_info', { companyId });
  }, [executeTool]);

  const getMemberships = useCallback(async (companyId: string, page = 1, perPage = 50) => {
    return executeTool('whop_get_memberships', { 
      companyId, 
      page, 
      per_page: perPage 
    });
  }, [executeTool]);

  const getCompanyAnalytics = useCallback(async (companyId: string, dateRange = '30d') => {
    return executeTool('whop_get_company_analytics', { 
      companyId, 
      dateRange 
    });
  }, [executeTool]);

  const createWebhook = useCallback(async (companyId: string, url: string, events: string[]) => {
    return executeTool('whop_create_webhook', { 
      companyId, 
      url, 
      events 
    });
  }, [executeTool]);

  return {
    // State
    loading,
    error,
    tools,
    
    // Actions
    loadTools,
    executeTool,
    getContext,
    
    // Convenience methods
    getCompanyInfo,
    getMemberships,
    getCompanyAnalytics,
    createWebhook,
    
    // Utilities
    clearError: () => setError(null)
  };
}
