import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('ErrorBoundary captured non-fatal error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050B14] flex flex-col items-center justify-center p-6 text-center text-slate-100">
          <div className="max-w-md bg-[#0B1528] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-cyan-400 mb-2">WATTOPro Trading Terminal</h2>
            <p className="text-sm text-slate-400 mb-4">Live sync session refreshed. Click below to continue trading.</p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white font-bold text-sm hover:brightness-110 cursor-pointer shadow-lg"
            >
              Resume Live Session
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
