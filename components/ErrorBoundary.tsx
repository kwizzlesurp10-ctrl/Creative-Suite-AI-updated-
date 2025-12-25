import React, { Component, ReactNode } from 'react';
import Card from './Card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component to catch and display React errors gracefully.
 * Prevents the entire app from crashing when a component error occurs.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0d0c1c] text-[#e0e0ff] font-sans p-8">
          <Card>
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-[#ff00ff]">Oops! Something went wrong</h1>
              <p className="text-[#a09cc9]">
                We encountered an unexpected error. Please refresh the page to try again.
              </p>
              {this.state.error && (
                <details className="mt-4 text-left bg-[#0d0c1c]/50 p-4 rounded-lg">
                  <summary className="cursor-pointer text-[#00ff00] hover:text-[#99ff99]">
                    Error Details
                  </summary>
                  <pre className="mt-2 text-sm text-[#f8bbd0] overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-[#ff00ff] hover:bg-[#e600e6] text-[#0d0c1c] font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
