'use client';
import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[School Tycoon] Error caught by boundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      localStorage.removeItem('school-tycoon-storage');
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div style={{
          minHeight: '100vh',
          background: '#050508',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'JetBrains Mono', monospace",
          padding: '1rem',
        }}>
          {/* Terminal-style error display */}
          <div style={{
            background: '#0a0a10',
            border: '1px solid #ff4444',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 0 20px rgba(255, 68, 68, 0.15), 0 0 60px rgba(255, 68, 68, 0.05)',
          }}>
            {/* Title bar with dots */}
            <div style={{
              background: '#111118',
              padding: '10px 14px',
              borderBottom: '1px solid #1e1e2e',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ color: '#ff4444', fontSize: '14px' }}>●</span>
              <span style={{ color: '#ffcc00', fontSize: '14px' }}>●</span>
              <span style={{ color: '#00ff88', fontSize: '14px' }}>●</span>
              <span style={{ color: '#666', fontSize: '11px', marginLeft: '8px' }}>error.log</span>
            </div>
            {/* Content */}
            <div style={{ padding: '20px' }}>
              <pre style={{
                color: '#ff4444',
                fontSize: '11px',
                lineHeight: '1.4',
                marginBottom: '16px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}>{`
 ╔══════════════════════════════════╗
 ║  ⚠ SYSTEM ERROR DETECTED        ║
 ╠══════════════════════════════════╣
 ║  Algo salio mal en la simulacion ║
 ╚══════════════════════════════════╝`}</pre>

              <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>
                {this.state.error?.message || 'Error desconocido'}
              </p>

              <div style={{
                background: '#0d0d0d',
                border: '1px solid #1e1e2e',
                borderRadius: '6px',
                padding: '10px',
                marginBottom: '20px',
                maxHeight: '100px',
                overflow: 'auto',
              }}>
                <code style={{ color: '#555', fontSize: '10px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {this.state.error?.stack?.slice(0, 500)}
                </code>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={this.handleReload} style={{
                  flex: 1,
                  background: 'rgba(0, 255, 136, 0.15)',
                  color: '#00ff88',
                  border: '1px solid rgba(0, 255, 136, 0.3)',
                  borderRadius: '8px',
                  padding: '10px',
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}>
                  🔄 Recargar
                </button>
                <button onClick={this.handleReset} style={{
                  flex: 1,
                  background: 'rgba(255, 68, 68, 0.1)',
                  color: '#ff4444',
                  border: '1px solid rgba(255, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '10px',
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}>
                  🗑️ Borrar Datos
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
