import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // If it's a WebAssembly error, just log it and continue
    if (error.message && error.message.includes('WebAssembly')) {
      console.warn('WebAssembly error suppressed:', error.message);
      // Reset the error state to allow the app to continue
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Check if it's a WebAssembly error
      if (this.state.error.message && this.state.error.message.includes('WebAssembly')) {
        // Don't show error UI for WebAssembly errors, just render children
        return this.props.children;
      }
      
      // For other errors, show error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h2>
            <p className="text-gray-600 text-sm mb-4">
              {this.state.error.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
