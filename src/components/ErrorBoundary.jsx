import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ React Error Boundary caught an error:', error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab, #667eea, #764ba2)', backgroundSize: '400% 400%', animation: 'gradientMove 15s ease infinite' }}>
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-2xl border border-white/20 shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">⚠️</div>
              <h1 className="text-3xl font-bold text-white mb-3">Something went wrong</h1>
              <p className="text-white/80">The app encountered an unexpected error.</p>
            </div>
            
            <div className="bg-white/5 rounded-2xl p-4 mb-6">
              <h3 className="text-white font-medium mb-2">Error Details:</h3>
              <pre className="text-white/70 text-sm overflow-auto">
                {this.state.error && this.state.error.toString()}
              </pre>
            </div>
            
            <div className="text-center">
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-3 rounded-2xl bg-white/20 text-white hover:bg-white/30 transition-all duration-300 font-medium"
              >
                Reload Page
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-white/60 text-sm">
                Check the browser console for more details
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
