import React from 'react'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import { AuthProvider, useAuth } from './context/AuthContext'

function AppContent() {
  const { user, isAuthenticated, isLoading, authStatus } = useAuth()
  
  console.log('📊 Auth state:', { user: !!user, isAuthenticated, isLoading, authStatus })

  // Show loading spinner while checking authentication
  if (isLoading) {
    console.log('⏳ Showing loading screen...')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div 
          className="fixed inset-0 -z-10" 
          style={{
            background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab, #667eea, #764ba2)',
            backgroundSize: '400% 400%',
            animation: 'gradientMove 15s ease infinite'
          }}
        ></div>
        <div className="text-center text-white">
          <div className="text-6xl mb-4 animate-bounce">🌈</div>
          <div className="text-2xl font-bold mb-2">MoodFlow</div>
          <div className="text-white/80">Loading...</div>
        </div>
      </div>
    )
  }

  // Show verification page if user needs to confirm email
  if (authStatus === 'needsConfirmation') {
    return <VerifyEmailPage />
  }

  return (
    <div className="font-sans">
      {isAuthenticated ? (
        <DashboardPage user={user} />
      ) : (
        <LoginPage />
      )}
    </div>
  )
}

function App() {
  return <AppContent />
}

export default App
