import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Sobagu ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg,#0d0614,#1a0826)', color: '#fff', padding: '2rem', textAlign: 'center',
          fontFamily: 'sans-serif',
        }}>
          <div className="glass-card" style={{ maxWidth: 450, padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(255,215,0,0.3)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌸</div>
            <h2 style={{ fontSize: '1.4rem', color: '#ffd700', marginBottom: '0.5rem' }}>Sobagu App Recovered</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              An unexpected issue occurred, but your learning data and progress are safe.
            </p>
            <button
              className="btn-primary"
              onClick={this.handleReset}
              style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 800 }}
            >
              🔄 Refresh & Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
