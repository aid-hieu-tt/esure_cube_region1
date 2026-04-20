import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
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
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#ffebee', color: '#c62828', fontFamily: 'monospace', minHeight: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
          <h1 style={{ marginTop: 0 }}>Crashed (Lỗi trắng xoá)</h1>
          <p>Please send this stack trace to the assistant:</p>
          <div style={{ background: '#fff', padding: '15px', border: '1px solid #ef5350', overflow: 'auto', flex: 1, whiteSpace: 'pre-wrap' }}>
            <h2>{this.state.error?.toString()}</h2>
            <br />
            {this.state.errorInfo?.componentStack}
          </div>
          <button 
            style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
            onClick={() => window.location.reload()}
          >
            Reload / Refresh
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
