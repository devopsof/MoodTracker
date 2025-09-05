import React from 'react';
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoginForm from '../components/LoginForm'

function LoginPage({ onLogin }) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  
  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard')
    } else {
      navigate('/') // Go back to landing page
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">

      {/* Floating animated orbs */}
      <div 
        className="absolute top-20 left-20 w-32 h-32 theme-orb-1 rounded-full blur-xl" 
        style={{
          animation: 'floatOrb1 20s ease-in-out infinite'
        }}
      ></div>
      <div 
        className="absolute bottom-20 right-20 w-40 h-40 theme-orb-2 rounded-full blur-xl" 
        style={{
          animation: 'floatOrb2 25s ease-in-out infinite reverse'
        }}
      ></div>
      <div 
        className="absolute top-1/2 right-1/4 w-24 h-24 theme-orb-3 rounded-full blur-xl" 
        style={{
          animation: 'floatOrb3 18s ease-in-out infinite'
        }}
      ></div>

      <div className="bg-theme-glass rounded-3xl p-8 sm:p-10 w-full max-w-md border border-theme-glass shadow-2xl relative z-10">
        <div className="text-center mb-10">
          <div 
            className="text-5xl mb-4 cursor-pointer hover:scale-110 transition-transform duration-300" 
            onClick={handleLogoClick}
            title={isAuthenticated ? 'Go to Dashboard' : 'Go to Home'}
          >
            🌈
          </div>
          <h1 
            className="text-4xl sm:text-5xl font-bold text-theme-primary mb-3 cursor-pointer hover:opacity-80 transition-opacity duration-300" 
            onClick={handleLogoClick}
            title={isAuthenticated ? 'Go to Dashboard' : 'Go to Home'}
          >
            MoodFlow
          </h1>
          <p className="text-theme-secondary text-lg">Track your emotional journey</p>
          <div className="mt-4">
            <button 
              onClick={() => navigate('/')} 
              className="text-theme-tertiary hover:text-theme-primary text-sm transition-colors duration-300 bg-transparent border-none cursor-pointer"
            >
              ← Back to Home
            </button>
          </div>
        </div>

        <LoginForm onLogin={onLogin} />
      </div>
    </div>
  )
}

export default LoginPage