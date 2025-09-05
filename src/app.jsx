import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import LandingPage from './pages/LandingPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import { AuthProvider, useAuth } from './context/AuthContext'

// Logout route for testing
function LogoutRoute() {
  const { signOut } = useAuth()
  
  React.useEffect(() => {
    const logout = async () => {
      try {
        await signOut()
        console.log('✅ Logged out successfully')
        window.location.href = '/' // Redirect to landing page
      } catch (error) {
        console.error('❌ Logout error:', error)
        window.location.href = '/' // Redirect anyway
      }
    }
    logout()
  }, [])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div 
        className="fixed inset-0 -z-10" 
        style={{
          background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab, #667eea, #764ba2)',
          backgroundSize: '400% 400%',
          animation: 'gradientMove 15s ease infinite'
        }}
      />
      <div className="text-center text-white">
        <div className="text-6xl mb-4 animate-spin">🌈</div>
        <div className="text-2xl font-bold mb-2">Logging out...</div>
        <div className="text-white/80">Redirecting to landing page</div>
      </div>
    </div>
  )
}

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
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
  
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AppContent() {
  const { user, isAuthenticated, isLoading, authStatus } = useAuth()
  
  console.log('📊 Auth state:', { user: !!user, isAuthenticated, isLoading, authStatus })
  console.log('🔍 Current URL:', window.location.pathname)

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
    <Router>
      <div className="font-sans">
        <AnimatePresence mode="wait">
          <Routes>
            {/* Landing page - entry point for ALL users */}
            <Route 
              path="/" 
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <LandingPage />
                </motion.div>
              } 
            />
            
            {/* Login/Signup page - redirect authenticated users to dashboard */}
            <Route 
              path="/login" 
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LoginPage />
                  </motion.div>
                )
              } 
            />
            
            {/* Dashboard - protected route for authenticated users */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <DashboardPage user={user} />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            
            {/* Landing page test route - always shows landing page */}
            <Route 
              path="/landing" 
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <LandingPage />
                </motion.div>
              } 
            />
            
            {/* Logout route for testing */}
            <Route 
              path="/logout" 
              element={<LogoutRoute />} 
            />
            
            {/* Catch all routes - redirect to landing page */}
            <Route 
              path="*" 
              element={<Navigate to="/" replace />} 
            />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  )
}

function App() {
  return <AppContent />
}

export default App
