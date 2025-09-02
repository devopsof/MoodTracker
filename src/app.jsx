import React, { useState, useEffect } from 'react'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import { loadUser, saveUser, clearUser } from './utils/localStorage'

function App() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on app startup
  useEffect(() => {
    const savedUser = loadUser()
    if (savedUser) {
      setUser(savedUser)
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    saveUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
    clearUser()
  }

  // Show loading spinner while checking for saved user
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

  return (
    <div className="font-sans">
      {user ? (
        <DashboardPage user={user} onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  )
}

export default App
