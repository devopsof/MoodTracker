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
        <label className="block text-white/90 text-sm font-medium mb-3">
          Email
        </label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300"
          placeholder="you@example.com" 
          required 
        />
      </div>
      <div>
        <label className="block text-white/90 text-sm font-medium mb-3">
          Password
        </label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300"
          placeholder="••••••••" 
          required 
        />
      </div>
      <button 
        type="submit" 
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-white to-gray-100 text-purple-700 font-semibold hover:from-gray-100 hover:to-white transform hover:scale-[1.02] transition-all duration-300 shadow-xl"
      >
        {isSignUp ? 'Create Account' : 'Sign In'}
      </button>
      <div className="text-center pt-2">
        <button 
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-white/70 hover:text-white transition-colors duration-300 text-sm"
        >
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
      </div>
    </form>
  )
}

export default LoginForm