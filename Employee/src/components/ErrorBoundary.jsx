import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Portal Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[300px] flex-col items-center justify-center p-6 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-200">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Something went wrong</h2>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            {this.state.error?.message || 'An unexpected error occurred while loading this page.'}
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#40108c] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#320d6f]"
          >
            <RotateCcw size={16} />
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
