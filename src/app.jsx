import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import LandingPage from './pages/LandingPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import ThemeToggle from './components/ThemeToggle'

// Logout route for testing
function LogoutRoute() {
  const { signOut } = useAuth()
  const { isDark } = useTheme()
  
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
    <div className="font-sans relative min-h-screen">
      {/* Animated Background Layers */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: 'linear-gradient(-45deg, #dc6b47, #d1375e, #1f8bb8, #1fb894, #5a73d9, #6a4291)',
          backgroundSize: '400% 400%',
          animation: 'gradientMove 15s ease infinite',
          opacity: isDark ? 0 : 1,
          transition: 'opacity 1.5s ease-in-out'
        }}
      />
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: 'linear-gradient(-45deg, #0a0a1a, #101020, #0e1428, #0c1f35, #1a1a35, #2d1f4f)',
          backgroundSize: '400% 400%',
          animation: 'gradientMove 15s ease infinite',
          opacity: isDark ? 1 : 0,
          transition: 'opacity 1.5s ease-in-out'
        }}
      />
      
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4 animate-spin">🌈</div>
          <div className="text-2xl font-bold mb-2">Logging out...</div>
          <div className="text-white/80">Redirecting to landing page</div>
        </div>
      </div>
    </div>
  )
}

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  const { isDark } = useTheme()
  
  if (isLoading) {
    return (
      <div className="font-sans relative min-h-screen">
        {/* Animated Background Layers */}
        <div 
          className="fixed inset-0 -z-10"
          style={{
            background: 'linear-gradient(-45deg, #dc6b47, #d1375e, #1f8bb8, #1fb894, #5a73d9, #6a4291)',
            backgroundSize: '400% 400%',
            animation: 'gradientMove 15s ease infinite',
            opacity: isDark ? 0 : 1,
            transition: 'opacity 1.5s ease-in-out'
          }}
        />
        <div 
          className="fixed inset-0 -z-10"
          style={{
            background: 'linear-gradient(-45deg, #0a0a1a, #101020, #0e1428, #0c1f35, #1a1a35, #2d1f4f)',
            backgroundSize: '400% 400%',
            animation: 'gradientMove 15s ease infinite',
            opacity: isDark ? 1 : 0,
            transition: 'opacity 1.5s ease-in-out'
          }}
        />
        
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-4 animate-bounce">🌈</div>
            <div className="text-2xl font-bold mb-2">MoodFlow</div>
            <div className="text-white/80">Loading...</div>
          </div>
        </div>
      </div>
    )
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AppContent() {
  const { user, isAuthenticated, isLoading, authStatus } = useAuth()
  const { isLoaded, isDark } = useTheme()
  
  // Remove theme loading delay to prevent flashing
  // if (!isLoaded) {
  //   return loading screen
  // }
  
  console.log('📊 Auth state:', { user: !!user, isAuthenticated, isLoading, authStatus })
  console.log('🔍 Current URL:', window.location.pathname)

  // Show loading spinner while checking authentication
  if (isLoading) {
    console.log('⏳ Showing loading screen...')
    return (
      <div className="font-sans relative min-h-screen">
        {/* Animated Background Layers - Show during loading too */}
        <div 
          className="fixed inset-0 -z-10"
          style={{
            background: 'linear-gradient(-45deg, #0a0a1a, #101020, #0e1428, #0c1f35, #1a1a35, #2d1f4f)',
            backgroundSize: '400% 400%',
            animation: 'gradientMove 15s ease infinite',
            opacity: isDark ? 1 : 0,
            transition: 'opacity 1.5s ease-in-out'
          }}
        />
        <div 
          className="fixed inset-0 -z-10"
          style={{
            background: 'linear-gradient(-45deg, #0a0a1a, #101020, #0e1428, #0c1f35, #1a1a35, #2d1f4f)',
            backgroundSize: '400% 400%',
            animation: 'gradientMove 15s ease infinite',
            opacity: isDark ? 1 : 0,
            transition: 'opacity 1.5s ease-in-out'
          }}
        />
        
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-4 animate-bounce">🌈</div>
            <div className="text-2xl font-bold mb-2">MoodFlow</div>
            <div className="text-white/80">Loading...</div>
          </div>
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
      <div className="font-sans relative min-h-screen">
        {/* Animated Background Layers */}
        <div 
          className="fixed inset-0 -z-10"
          style={{
            background: 'linear-gradient(-45deg, #dc6b47, #d1375e, #1f8bb8, #1fb894, #5a73d9, #6a4291)',
            backgroundSize: '400% 400%',
            animation: 'gradientMove 15s ease infinite',
            opacity: isDark ? 0 : 1,
            transition: 'opacity 1.5s ease-in-out'
          }}
        />
        <div 
          className="fixed inset-0 -z-10"
          style={{
            background: 'linear-gradient(-45deg, #0a0a1a, #101020, #0e1428, #0c1f35, #1a1a35, #2d1f4f)',
            backgroundSize: '400% 400%',
            animation: 'gradientMove 15s ease infinite',
            opacity: isDark ? 1 : 0,
            transition: 'opacity 1.5s ease-in-out'
          }}
        />
        
        {/* Theme Toggle Button - Fixed Position */}
        <ThemeToggle className="fixed top-4 right-4 z-50" />
        
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
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
