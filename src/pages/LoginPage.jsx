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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', position: 'relative', overflow: 'hidden'}}>
      {/* Animated moving background */}
      <div 
        className="absolute inset-0" 
        style={{
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab, #667eea, #764ba2)',
          backgroundSize: '400% 400%',
          animation: 'gradientMove 15s ease infinite'
        }}
      ></div>
      <div 
        className="absolute inset-0" 
        style={{
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(0,0,0,0.1), transparent, rgba(255,255,255,0.05))',
          backgroundSize: '200% 200%',
          animation: 'shimmer 8s ease-in-out infinite reverse'
        }}
      ></div>

      {/* Floating animated orbs */}
      <div 
        className="absolute top-20 left-20 w-32 h-32 bg-purple-400/30 rounded-full blur-xl" 
        style={{
          position: 'absolute', 
          top: '5rem', 
          left: '5rem', 
          width: '8rem', 
          height: '8rem', 
          backgroundColor: 'rgba(196 181 253 / 0.4)', 
          borderRadius: '50%', 
          filter: 'blur(40px)',
          animation: 'floatOrb1 20s ease-in-out infinite'
        }}
      ></div>
      <div 
        className="absolute bottom-20 right-20 w-40 h-40 bg-pink-400/30 rounded-full blur-xl" 
        style={{
          position: 'absolute', 
          bottom: '5rem', 
          right: '5rem', 
          width: '10rem', 
          height: '10rem', 
          backgroundColor: 'rgba(244 114 182 / 0.4)', 
          borderRadius: '50%', 
          filter: 'blur(40px)',
          animation: 'floatOrb2 25s ease-in-out infinite reverse'
        }}
      ></div>
      <div 
        className="absolute top-1/2 right-1/4 w-24 h-24 bg-cyan-400/30 rounded-full blur-xl" 
        style={{
          position: 'absolute', 
          top: '50%', 
          right: '25%', 
          width: '6rem', 
          height: '6rem', 
          backgroundColor: 'rgba(34 211 238 / 0.4)', 
          borderRadius: '50%', 
          filter: 'blur(40px)',
          animation: 'floatOrb3 18s ease-in-out infinite'
        }}
      ></div>

      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 sm:p-10 w-full max-w-md border border-white/20 shadow-2xl relative z-10" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(16px)', borderRadius: '1.5rem', padding: '2rem', width: '100%', maxWidth: '28rem', border: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative', zIndex: 10}}>
        <div className="text-center mb-10" style={{textAlign: 'center', marginBottom: '2.5rem'}}>
          <div 
            className="text-5xl mb-4 cursor-pointer hover:scale-110 transition-transform duration-300" 
            style={{fontSize: '3rem', marginBottom: '1rem'}}
            onClick={handleLogoClick}
            title={isAuthenticated ? 'Go to Dashboard' : 'Go to Home'}
          >
            🌈
          </div>
          <h1 
            className="text-4xl sm:text-5xl font-bold text-white mb-3 cursor-pointer hover:opacity-80 transition-opacity duration-300" 
            style={{fontSize: '2.25rem', fontWeight: 'bold', color: 'white', marginBottom: '0.75rem'}}
            onClick={handleLogoClick}
            title={isAuthenticated ? 'Go to Dashboard' : 'Go to Home'}
          >
            MoodFlow
          </h1>
          <p className="text-white/80 text-lg" style={{color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.125rem'}}>Track your emotional journey</p>
          <div className="mt-4">
            <button 
              onClick={() => navigate('/')} 
              className="text-white/60 hover:text-white text-sm transition-colors duration-300 bg-transparent border-none cursor-pointer"
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