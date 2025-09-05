import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Load form mode from localStorage to persist across re-renders
  const [isSignUp, setIsSignUp] = useState(() => {
    try {
      const saved = localStorage.getItem('moodtracker_form_mode')
      return saved === 'signup'
    } catch {
      return false
    }
  })
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Debug: Track component mount and form mode changes
  useEffect(() => {
    console.log('📝 LoginForm mounted')
    return () => console.log('📝 LoginForm unmounted')
  }, [])

  useEffect(() => {
    console.log('📝 Form mode changed to:', isSignUp ? 'SIGN_UP' : 'SIGN_IN')
  }, [isSignUp])

  const { signUp, signIn, isLoading, error, clearError } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()

    if (!email || !password) {
      return
    }

    console.log('📧 Form submission:', { 
      isSignUp, 
      email, 
      passwordLength: password.length,
      action: isSignUp ? 'SIGN_UP' : 'SIGN_IN'
    })

    try {
      if (isSignUp) {
        console.log('✨ Attempting sign up...')
        const result = await signUp({ email, password })
        console.log('✅ Sign up successful:', result)
        setSuccessMessage(result.message)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 5000)
        // Don't clear the form on successful sign-up since user will be redirected to verification
      } else {
        console.log('🔑 Attempting sign in...')
        await signIn({ email, password })
        console.log('✅ Sign in successful')
        // Success will be handled by AuthContext - user will be redirected
      }
    } catch (error) {
      console.error('❌ Authentication error:', error)
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        isSignUp,
        email
      })
      // Error will be displayed by the error state from AuthContext
      // Don't change the form mode - stay on current form (sign-up or sign-in)
    }
  }

  const handleInputChange = () => {
    clearError()
    setShowSuccess(false)
  }

  const handleToggleMode = () => {
    console.log('🔄 Toggling form mode from', isSignUp ? 'SIGN_UP' : 'SIGN_IN', 'to', !isSignUp ? 'SIGN_UP' : 'SIGN_IN')
    const newMode = !isSignUp
    setIsSignUp(newMode)
    
    // Save form mode to localStorage to persist across re-renders
    try {
      localStorage.setItem('moodtracker_form_mode', newMode ? 'signup' : 'signin')
    } catch (error) {
      console.warn('Failed to save form mode to localStorage:', error)
    }
    
    clearError()
    setShowSuccess(false)
    // Clear form when switching modes
    setEmail('')
    setPassword('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-theme-secondary text-sm font-medium mb-3">
          Email
        </label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => { setEmail(e.target.value); handleInputChange(); }}
          className="w-full px-4 py-4 rounded-2xl bg-theme-glass border border-theme-glass text-theme-primary placeholder-theme-tertiary focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300"
          placeholder="you@example.com" 
          required 
        />
      </div>
      <div>
        <label className="block text-theme-secondary text-sm font-medium mb-3">
          Password
        </label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => { setPassword(e.target.value); handleInputChange(); }}
          className="w-full px-4 py-4 rounded-2xl bg-theme-glass border border-theme-glass text-theme-primary placeholder-theme-tertiary focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300"
          placeholder={isSignUp ? 'Min 8 chars, mixed case, number, symbol' : '••••••••'}
          required 
          minLength={8}
        />
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/20 border border-red-400/30 text-theme-primary">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">⚠️</span>
            <span className="font-medium">{error.message}</span>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="p-4 rounded-2xl bg-green-500/20 border border-green-400/30 text-theme-primary">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">✅</span>
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      <button 
        type="submit" 
        disabled={isLoading || !email || !password}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-white to-gray-100 text-purple-700 font-semibold hover:from-gray-100 hover:to-white transform hover:scale-[1.02] transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? (isSignUp ? 'Creating Account...' : 'Signing In...') : (isSignUp ? 'Create Account' : 'Sign In')}
      </button>
      <div className="text-center pt-2">
        <button 
          type="button"
          onClick={handleToggleMode}
          className="text-theme-tertiary hover:text-theme-primary transition-colors duration-300 text-sm"
        >
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
      </div>
    </form>
  )
}

export default LoginForm