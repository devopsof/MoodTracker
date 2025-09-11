import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function LoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    
    // Validate username for signup
    if (isSignUp && (!username || username.length < 3 || username.length > 20)) {
      return
    }

    console.log('📧 Form submission:', { 
      isSignUp, 
      email, 
      username: isSignUp ? username : 'N/A',
      passwordLength: password.length,
      action: isSignUp ? 'SIGN_UP' : 'SIGN_IN'
    })

    try {
      if (isSignUp) {
        console.log('✨ Attempting sign up...')
        const result = await signUp({ username, email, password })
        console.log('✅ Sign up successful:', result)
        
        if (result.needsVerification) {
          // Navigate to verification page using React Router
          console.log('🔄 Navigating to verification page...')
          navigate('/verify')
        } else {
          setSuccessMessage(result.message)
          setShowSuccess(true)
          setTimeout(() => setShowSuccess(false), 5000)
        }
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
    setUsername('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isSignUp && (
        <div>
          <label className="block text-theme-secondary text-sm font-medium mb-3">
            Username
          </label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => { setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '')); handleInputChange(); }}
            className="w-full px-4 py-4 rounded-2xl bg-theme-glass border border-theme-glass text-theme-primary placeholder-theme-tertiary focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300"
            placeholder="your_username" 
            minLength={3}
            maxLength={20}
            pattern="[a-zA-Z0-9_]+"
            required={isSignUp}
          />
          <p className="text-theme-tertiary text-xs mt-1">3-20 characters, letters, numbers, and underscores only</p>
        </div>
      )}
      <div>
        <label className="block text-theme-secondary text-sm font-medium mb-3">
          {isSignUp ? 'Email' : 'Email or Username'}
        </label>
        <input 
          type={isSignUp ? "email" : "text"} 
          value={email} 
          onChange={(e) => { setEmail(e.target.value); handleInputChange(); }}
          className="w-full px-4 py-4 rounded-2xl bg-theme-glass border border-theme-glass text-theme-primary placeholder-theme-tertiary focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300"
          placeholder={isSignUp ? "you@example.com" : "email or username"} 
          required 
        />
      </div>
      <div>
        <label className="block text-theme-secondary text-sm font-medium mb-3">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => { setPassword(e.target.value); handleInputChange(); }}
            className="w-full pr-12 px-4 py-4 rounded-2xl bg-theme-glass border border-theme-glass text-theme-primary placeholder-theme-tertiary focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300"
            placeholder={isSignUp ? 'Min 8 chars, mixed case, number, symbol' : '••••••••'}
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-theme-tertiary hover:text-theme-primary transition-colors"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            )}
          </button>
        </div>
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
        disabled={isLoading || !email || !password || (isSignUp && (!username || username.length < 3))}
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
