import { NextRequest, NextResponse } from 'next/server';
import { whopMCP } from '@/lib/mcp/whop-mcp';

/**
 * Whop MCP API Endpoint
 * Provides access to Whop MCP tools and context
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'tools':
        return NextResponse.json({
          success: true,
          tools: whopMCP.getTools().map(tool => ({
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters
          }))
        });

      case 'context':
        return NextResponse.json({
          success: true,
          context: await whopMCP.executeTool('whop_get_user_context', {})
        });

      default:
        return NextResponse.json({
          success: true,
          message: 'Whop MCP Server is running',
          available_actions: ['tools', 'context', 'execute'],
          usage: {
            tools: '/api/mcp/whop?action=tools',
            context: '/api/mcp/whop?action=context',
            execute: 'POST /api/mcp/whop with { "tool": "tool_name", "parameters": {...} }'
          }
        });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tool, parameters, context } = body;

    if (!tool) {
      return NextResponse.json({
        success: false,
        error: 'Tool name is required'
      }, { status: 400 });
    }

    // Set context if provided
    if (context) {
      whopMCP.setContext(context);
    }

    // Execute the tool
    const result = await whopMCP.executeTool(tool, parameters || {});

    return NextResponse.json({
      success: true,
      tool,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
