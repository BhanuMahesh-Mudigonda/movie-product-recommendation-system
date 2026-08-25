import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import './ErrorBoundary.css';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("==========================================");
    console.error("CRITICAL REACT COMPONENT ERROR CAUGHT:");
    console.error("Error Message:", error?.message || error);
    console.error("Stack Trace:", error?.stack);
    console.error("Component Stack:", errorInfo?.componentStack);
    console.error("==========================================");
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-card">
            <div className="error-icon-wrapper">
              <AlertTriangle size={36} className="error-icon" />
            </div>
            <h2>Something went wrong</h2>
            <p className="error-message">
              We encountered an unexpected issue while loading this section.
            </p>
            {this.state.error && (
              <pre style={{
                background: '#111625',
                color: '#ff6b6b',
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'left',
                fontSize: '12px',
                maxWidth: '100%',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                margin: '16px 0',
                border: '1px solid rgba(255,107,107,0.3)'
              }}>
                <strong>Error: {this.state.error.message || String(this.state.error)}</strong>
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            )}
            <div className="error-actions">
              <button className="error-btn primary" onClick={this.handleRetry}>
                <RefreshCw size={16} /> Try Again
              </button>
              {this.props.onGoHome && (
                <button className="error-btn secondary" onClick={() => {
                  this.setState({ hasError: false, error: null });
                  this.props.onGoHome();
                }}>
                  <Home size={16} /> Return to Home
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
