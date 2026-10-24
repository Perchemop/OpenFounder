import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react';
import { BugReportModal } from './modals/BugReportModal';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isReportOpen: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, isReportOpen: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('OpenFounder ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, isReportOpen: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center space-y-4 bg-zinc-50 dark:bg-zinc-950">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {this.props.fallbackTitle || 'Something went wrong'}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
            An unexpected error occurred in this section. Your data is safe in local storage.
          </p>
          {this.state.error && (
            <pre className="text-xs font-mono text-left bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 max-w-lg overflow-auto text-zinc-600 dark:text-zinc-400">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex items-center space-x-3">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try again</span>
            </button>
            <button
              onClick={() => this.setState({ isReportOpen: true })}
              className="inline-flex items-center space-x-2 px-4 py-2 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Bug className="w-4 h-4" />
              <span>Report this crash</span>
            </button>
          </div>

          <BugReportModal
            isOpen={this.state.isReportOpen}
            onClose={() => this.setState({ isReportOpen: false })}
            input={{
              appVersion: '1.0.0',
              origin: 'error_boundary',
              summary: this.state.error
                ? `${this.state.error.name}: ${this.state.error.message}`
                : 'Unexpected error in OpenFounder',
              technicalDetail: [
                this.state.error?.stack ?? '',
                this.state.errorInfo?.componentStack ?? '',
              ]
                .filter((part) => part.trim().length > 0)
                .join('\n'),
              diagnostics: {
                'Route': typeof window === 'undefined' ? 'unknown' : window.location.pathname,
              },
            }}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
