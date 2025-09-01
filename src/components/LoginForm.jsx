import React, { useState } from 'react'

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email && password) {
      onLogin({ email })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-white/90 text-sm font-medium mb-2">
          Email
        </label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
          placeholder="you@example.com" 
          required 
        />
      </div>

      <div>
        <label className="block text-white/90 text-sm font-medium mb-2">
          Password
        </label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
          placeholder="••••••••" 
          required 
        />
      </div>

      <button 
        type="submit" 
        className="w-full py-3 px-6 rounded-xl bg-white text-purple-600 font-semibold hover:bg-white/90 transform hover:scale-105 transition-all duration-300 shadow-lg animate-pulseGlow"
      >
        {isSignUp ? 'Create Account' : 'Sign In'}
      </button>

      <div className="text-center">
        <button 
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-white/80 hover:text-white transition-colors duration-300"
        >
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
      </div>
    </form>
  )
}

export default LoginForm