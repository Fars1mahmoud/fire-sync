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
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CRITICAL UNCAUGHT REACT ERROR:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    localStorage.removeItem('fire_intel_user');
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#061320',
            color: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: '680px',
              width: '100%',
              background: 'rgba(15, 30, 48, 0.95)',
              border: '1px solid #ef4444',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '32px' }}>🚨</span>
              <div>
                <h2 style={{ margin: 0, color: '#ef4444', fontSize: '20px' }}>
                  حدث خطأ أثناء تحميل لوحة القيادة
                </h2>
                <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
                  Dashboard Interface Encountered a Runtime Error
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#091522',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '16px',
                color: '#fca5a5',
                fontSize: '12px',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                maxHeight: '220px',
                overflowY: 'auto',
                marginBottom: '20px',
              }}
            >
              <strong>{this.state.error?.name}: </strong>
              {this.state.error?.message}
              {this.state.errorInfo?.componentStack && (
                <div style={{ marginTop: '10px', color: '#64748b' }}>
                  {this.state.errorInfo.componentStack}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  background: '#0284c7',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 18px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                🔄 إعادة المحاولة (Reload)
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '6px',
                  padding: '10px 18px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                🚪 إعادة تعيين الجلسة والعودة للرئيسية
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
