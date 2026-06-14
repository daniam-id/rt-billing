'use client';

import { Component, ReactNode } from 'react';
import { Button } from './ui';

interface State {
  err: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { err: null };

  static getDerivedStateFromError(err: Error): State {
    return { err };
  }

  componentDidCatch(err: Error) {
    // eslint-disable-next-line no-console
    console.error('UI error boundary:', err);
  }

  reset = () => this.setState({ err: null });

  render() {
    if (this.state.err) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md bg-canvas border border-border rounded-md p-6 text-center">
            <h1 className="text-base font-semibold text-text-primary mb-1">Something went wrong</h1>
            <p className="text-xs text-text-secondary mb-4 font-mono break-words">
              {this.state.err.message}
            </p>
            <Button variant="primary" onClick={this.reset}>Try again</Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
