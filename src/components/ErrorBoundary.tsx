'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0f19] text-white p-8 flex flex-col items-center justify-center">
          <div className="max-w-2xl w-full bg-[#151c2c] border border-rose-500/30 rounded-xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-rose-500 mb-4 flex items-center gap-2">
              ⚠️ Application Runtime Crash
            </h2>
            <p className="text-sm text-gray-300 mb-4 font-semibold">
              The application encountered a fatal client-side exception:
            </p>
            <div className="bg-black/40 border border-[#222c40] rounded-lg p-4 font-mono text-xs overflow-auto max-h-60 text-rose-400 mb-4">
              <p className="font-bold">{this.state.error && this.state.error.message}</p>
              <pre className="mt-2 white-space-pre-wrap">{this.state.error && this.state.error.stack}</pre>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
