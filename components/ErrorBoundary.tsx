'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('❌ [ErrorBoundary] Caught error:', error);
    console.error('❌ [ErrorBoundary] Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-[#F8FAFC] mb-2">
              Something went wrong
            </h1>
            
            <p className="text-[#A1A1AA] mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="w-full bg-[#10B981] hover:bg-[#0E9F6E] text-white"
              >
                Reload Page
              </Button>
              
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
                variant="outline"
                className="w-full border-[#1a1a1a] text-[#A1A1AA] hover:bg-[#1a1a1a]"
              >
                Go to Home
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-[#A1A1AA] cursor-pointer hover:text-[#F8FAFC]">
                  Error Details (Dev Only)
                </summary>
                <pre className="mt-2 text-xs text-red-400 bg-[#0a0a0a] p-3 rounded border border-[#1a1a1a] overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

