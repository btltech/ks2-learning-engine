import React, { ErrorInfo, ReactNode } from 'react';
import { createAppError, reportError, ErrorCategory, AppError } from '../services/errorHandlingService';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: AppError) => void;
  showRetry?: boolean;
  context?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: AppError | null;
  errorCount: number;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: ErrorBoundaryProps;
  declare state: ErrorBoundaryState;
  declare setState: React.Component<ErrorBoundaryProps, ErrorBoundaryState>['setState'];
  
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorCount: 0,
    };
  }

  public static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const appError = createAppError(error, {
      componentStack: errorInfo.componentStack,
      context: this.props.context,
    });
    
    this.setState(prev => ({
      ...prev,
      error: appError,
      errorCount: prev.errorCount + 1,
    }));
    
    reportError(appError);
    this.props.onError?.(appError);
  }

  private handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorCount: this.state.errorCount,
    });
  };

  private handleGoHome = (): void => {
    window.location.href = '/';
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorCount } = this.state;
      const showRetry = this.props.showRetry !== false && error?.recoverable;
      const tooManyErrors = errorCount > 3;

      return (
        <div className="min-h-[300px] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 text-center">
            {/* Error Icon */}
            <div className="mb-4">
              {error?.category === ErrorCategory.Network ? (
                <div className="text-6xl">📡</div>
              ) : error?.category === ErrorCategory.AI ? (
                <div className="text-6xl">🤖</div>
              ) : (
                <div className="text-6xl">😕</div>
              )}
            </div>

            {/* Error Message */}
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {tooManyErrors ? "This keeps happening..." : "Oops! Something went wrong"}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {error?.userMessage || "We're sorry, but something unexpected happened."}
            </p>

            {/* Helpful Tips */}
            {error?.category === ErrorCategory.Network && (
              <div className="bg-blue-50 rounded-lg p-3 mb-4 text-left">
                <p className="text-sm text-blue-700 font-medium mb-2">💡 Things to try:</p>
                <ul className="text-sm text-blue-600 list-disc list-inside space-y-1">
                  <li>Check your internet connection</li>
                  <li>Wait a moment and try again</li>
                  <li>Refresh the page</li>
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {showRetry && !tooManyErrors && (
                <button
                  onClick={this.handleRetry}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Try Again
                </button>
              )}
              
              <button
                onClick={this.handleGoHome}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
              >
                Go Home
              </button>
            </div>

            {/* Error Details (Development only) */}
            {import.meta.env.DEV && error && (
              <details className="mt-6 text-left">
                <summary className="text-xs text-gray-400 cursor-pointer">
                  Technical Details
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify({
                    code: error.code,
                    category: error.category,
                    message: error.message,
                    timestamp: new Date(error.timestamp).toISOString(),
                  }, null, 2)}
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

// Lightweight error boundary for specific sections
interface SectionErrorBoundaryProps {
  children: ReactNode;
  sectionName: string;
}

interface SectionErrorBoundaryState {
  hasError: boolean;
}

export class SectionErrorBoundary extends React.Component<SectionErrorBoundaryProps, SectionErrorBoundaryState> {
  declare props: SectionErrorBoundaryProps;
  declare state: SectionErrorBoundaryState;
  declare setState: React.Component<SectionErrorBoundaryProps, SectionErrorBoundaryState>['setState'];
  
  constructor(props: SectionErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): SectionErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`Error in ${this.props.sectionName}:`, error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 text-sm">
            ⚠️ This section couldn't load. 
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="ml-2 text-yellow-600 underline"
            >
              Try again
            </button>
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
