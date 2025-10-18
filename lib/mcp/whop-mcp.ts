/**
 * Whop MCP (Model Context Protocol) Integration
 * Provides enhanced Whop API tools and context
 */

import { whopSdk } from '@/lib/whop-sdk';

export interface WhopMCPTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  handler: (params: any) => Promise<any>;
}

export interface WhopMCPContext {
  companyId?: string;
  userId?: string;
  appId?: string;
  permissions?: string[];
}

export class WhopMCPServer {
  private context: WhopMCPContext = {};

  constructor(context?: WhopMCPContext) {
    if (context) {
      this.context = context;
    }
  }

  /**
   * Set the current context for MCP operations
   */
  setContext(context: WhopMCPContext) {
    this.context = { ...this.context, ...context };
  }

  /**
   * Get available Whop MCP tools
   */
  getTools(): WhopMCPTool[] {
    return [
      {
        name: 'whop_get_company_info',
        description: 'Get detailed information about a Whop company',
        parameters: {
          type: 'object',
          properties: {
            companyId: {
              type: 'string',
              description: 'The company ID to get information for'
            }
          },
          required: ['companyId']
        },
        handler: this.getCompanyInfo.bind(this)
      },
      {
        name: 'whop_get_memberships',
        description: 'Get memberships for a company',
        parameters: {
          type: 'object',
          properties: {
            companyId: {
              type: 'string',
              description: 'The company ID to get memberships for'
            },
            page: {
              type: 'number',
              description: 'Page number for pagination',
              default: 1
            },
            per_page: {
              type: 'number',
              description: 'Number of items per page',
              default: 50
            }
          },
          required: ['companyId']
        },
        handler: this.getMemberships.bind(this)
      },
      {
        name: 'whop_get_company_analytics',
        description: 'Get analytics data for a company',
        parameters: {
          type: 'object',
          properties: {
            companyId: {
              type: 'string',
              description: 'The company ID to get analytics for'
            },
            dateRange: {
              type: 'string',
              description: 'Date range for analytics (7d, 30d, 90d)',
              default: '30d'
            }
          },
          required: ['companyId']
        },
        handler: this.getCompanyAnalytics.bind(this)
      },
      {
        name: 'whop_create_webhook',
        description: 'Create a webhook for a company',
        parameters: {
          type: 'object',
          properties: {
            companyId: {
              type: 'string',
              description: 'The company ID to create webhook for'
            },
            url: {
              type: 'string',
              description: 'Webhook URL'
            },
            events: {
              type: 'array',
              description: 'Events to subscribe to',
              items: { type: 'string' }
            }
          },
          required: ['companyId', 'url', 'events']
        },
        handler: this.createWebhook.bind(this)
      },
      {
        name: 'whop_get_user_context',
        description: 'Get current user context and permissions',
        parameters: {
          type: 'object',
          properties: {}
        },
        handler: this.getUserContext.bind(this)
      }
    ];
  }

  /**
   * Execute a Whop MCP tool
   */
  async executeTool(toolName: string, parameters: any): Promise<any> {
    const tools = this.getTools();
    const tool = tools.find(t => t.name === toolName);
    
    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }

    return await tool.handler(parameters);
  }

  // Tool implementations
  private async getCompanyInfo(params: { companyId: string }) {
    try {
      // Use Whop SDK to get company information
      const companySdk = whopSdk.withCompany(params.companyId);
      
      // Fetch company data using Whop API
      const response = await fetch(
        `https://api.whop.com/api/v5/companies/${params.companyId}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const companyData = await response.json();
      
      return {
        success: true,
        data: companyData
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async getMemberships(params: { companyId: string; page?: number; per_page?: number }) {
    try {
      const page = params.page || 1;
      const perPage = params.per_page || 50;
      
      // Use direct API call to get memberships
      const response = await fetch(
        `https://api.whop.com/api/v2/memberships?company_id=${params.companyId}&page=${page}&per=${perPage}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: {
          memberships: data.data || [],
          pagination: {
            page,
            per_page: perPage,
            total: data.total || 0
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async getCompanyAnalytics(params: { companyId: string; dateRange?: string }) {
    try {
      // Fetch analytics from your own API endpoint
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const timeRange = params.dateRange === '7d' ? 'week' : params.dateRange === '90d' ? 'quarter' : 'month';
      
      const response = await fetch(
        `${baseUrl}/api/analytics/metrics?companyId=${params.companyId}&timeRange=${timeRange}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`);
      }

      const analyticsData = await response.json();
      
      return {
        success: true,
        data: {
          companyId: params.companyId,
          dateRange: params.dateRange || '30d',
          metrics: analyticsData,
          generated_at: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async createWebhook(params: { companyId: string; url: string; events: string[] }) {
    try {
      // Create webhook using Whop SDK
      const response = await fetch(
        'https://api.whop.com/api/v5/webhooks',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.WHOP_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: params.url,
            events: params.events,
            enabled: true,
            api_version: 'v5'
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const webhookData = await response.json();
      
      return {
        success: true,
        data: webhookData
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async getUserContext() {
    return {
      success: true,
      data: {
        ...this.context,
        tools_available: this.getTools().map(t => t.name),
        generated_at: new Date().toISOString()
      }
    };
  }
}

// Export singleton instance
export const whopMCP = new WhopMCPServer();
