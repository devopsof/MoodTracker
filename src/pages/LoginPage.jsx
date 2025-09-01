import React from 'react';
import LoginForm from '../components/LoginForm'

function LoginPage({ onLogin }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', position: 'relative', overflow: 'hidden'}}>
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600" style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom right, rgb(147 51 234), rgb(219 39 119), rgb(37 99 235)'}}></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/20 to-cyan-500/20" style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top right, transparent, rgba(168 85 247 / 0.2), rgba(34 211 238 / 0.2))'}}></div>

      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-purple-400/30 rounded-full blur-xl animate-pulse" style={{position: 'absolute', top: '5rem', left: '5rem', width: '8rem', height: '8rem', backgroundColor: 'rgba(196 181 253 / 0.3)', borderRadius: '50%', filter: 'blur(40px)'}}></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-pink-400/30 rounded-full blur-xl animate-pulse delay-1000" style={{position: 'absolute', bottom: '5rem', right: '5rem', width: '10rem', height: '10rem', backgroundColor: 'rgba(244 114 182 / 0.3)', borderRadius: '50%', filter: 'blur(40px)'}}></div>
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-cyan-400/30 rounded-full blur-xl animate-pulse delay-500" style={{position: 'absolute', top: '50%', right: '25%', width: '6rem', height: '6rem', backgroundColor: 'rgba(34 211 238 / 0.3)', borderRadius: '50%', filter: 'blur(40px)'}}></div>

      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 sm:p-10 w-full max-w-md border border-white/20 shadow-2xl relative z-10" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(16px)', borderRadius: '1.5rem', padding: '2rem', width: '100%', maxWidth: '28rem', border: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative', zIndex: 10}}>
        <div className="text-center mb-10" style={{textAlign: 'center', marginBottom: '2.5rem'}}>
          <div className="text-5xl mb-4" style={{fontSize: '3rem', marginBottom: '1rem'}}>🌈</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3" style={{fontSize: '2.25rem', fontWeight: 'bold', color: 'white', marginBottom: '0.75rem'}}>MoodFlow</h1>
          <p className="text-white/80 text-lg" style={{color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.125rem'}}>Track your emotional journey</p>
        </div>

        <LoginForm onLogin={onLogin} />
      </div>
    </div>
  )
}

export default LoginPage