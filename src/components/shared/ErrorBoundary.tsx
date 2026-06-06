// src/components/shared/ErrorBoundary.tsx
// React error boundary component with a fallback UI and retry button.

import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    // Update state so the next render shows the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log the error to an error reporting service here.
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  handleRetry = () => {
    // Reset error state and attempt to re-render children.
    this.setState({ hasError: false });
  };

  render() {
    const { hasError } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Default fallback UI if none provided.
      const defaultFallback = (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <h2 className="text-2xl font-semibold mb-2">Something went wrong.</h2>
          <p className="mb-4 text-muted-foreground">
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={this.handleRetry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
          >
            Retry
          </button>
        </div>
      );
      return fallback ?? defaultFallback;
    }

    // When no error, render children as usual.
    return children;
  }
}
