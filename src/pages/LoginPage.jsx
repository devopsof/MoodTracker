import React from 'react';
import LoginForm from '../components/LoginForm'

function LoginPage({ onLogin }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="animated-gradient"></div>

      <div className="orb w-96 h-96 bg-purple-500 top-10 left-10"></div>
      <div className="orb w-64 h-64 bg-pink-500 bottom-10 right-10"></div>
      <div className="orb w-80 h-80 bg-blue-500 top-1/2 right-1/4"></div>

      <div className="glass-morphism rounded-3xl p-8 w-full max-w-md animate-slideIn animate-pulseGlow">
        <div className="text-center mb-8 animate-float">
          <h1 className="text-4xl font-bold text-white mb-2">MoodFlow</h1>
          <p className="text-white/80">Track your emotional journey</p>
        </div>

        <LoginForm onLogin={onLogin} />
      </div>
    </div>
  )
}

export default LoginPage