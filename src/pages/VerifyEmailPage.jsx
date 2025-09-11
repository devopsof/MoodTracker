import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function VerifyEmailPage() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [verificationSuccess, setVerificationSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const { 
    confirmSignUp, 
    resendConfirmationCode, 
    isLoading, 
    error, 
    clearError,
    pendingVerificationEmail,
    pendingVerificationUsername,
    isAuthenticated 
  } = useAuth()

  // Use the stored email and username from sign-up flow
  const email = pendingVerificationEmail
  const username = pendingVerificationUsername
  
  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard')
    } else {
      navigate('/') // Go back to landing page
    }
  }

  // Helper function to clean up localStorage before verification
  const cleanupLocalStorage = () => {
    try {
      // Get all keys in localStorage that might be taking up space
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // Remove any Cognito tokens that might be leftover from previous sessions
        if (key && key.includes('CognitoIdentityServiceProvider') && 
            !key.includes(username)) {
          keysToRemove.push(key);
        }
      }
      
      // Remove unnecessary items to free up space
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
          console.log('🧹 Cleaned up localStorage item:', key);
        } catch (e) {
          console.warn('Failed to remove item from localStorage:', key, e);
        }
      });
      
      console.log(`🧹 Cleaned up ${keysToRemove.length} localStorage items`);
    } catch (e) {
      console.warn('Failed to clean up localStorage:', e);
    }
  }

  const handleVerification = async (e) => {
    e.preventDefault()
    clearError()

    if (!email || !username || !code) {
      return
    }

    try {
      // Clean up localStorage before verification to avoid quota issues
      cleanupLocalStorage();
      
      const result = await confirmSignUp({ code })
      
      setVerificationSuccess(true)
      setSuccessMessage(result.message)
      
      if (result.autoSignedIn) {
        console.log('✅ Auto-signed in after verification!')
        // Show success message briefly before redirect
        setTimeout(() => {
          navigate('/dashboard')
        }, 1500)
      } else {
        console.log('ℹ️ Verification complete, please sign in')
        // Fallback: redirect to login page
        setTimeout(() => {
          navigate('/login')
        }, 1500)
      }
    } catch (error) {
      console.error('Verification error:', error)
      setVerificationSuccess(false)
    }
  }

  const handleResendCode = async () => {
    if (!email || !username) return

    setIsResending(true)
    setResendMessage('')
    
    try {
      await resendConfirmationCode()
      setResendMessage('Verification code sent! Please check your email.')
    } catch (error) {
      console.error('Resend error:', error)
    } finally {
      setIsResending(false)
    }
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    clearError()
  }

  const handleCodeChange = (e) => {
    setCode(e.target.value)
    clearError()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">

      {/* Floating animated orbs */}
      <div 
        className="absolute top-20 left-20 w-32 h-32 bg-purple-400/30 rounded-full blur-xl" 
        style={{
          animation: 'floatOrb1 20s ease-in-out infinite'
        }}
      ></div>
      <div 
        className="absolute bottom-20 right-20 w-40 h-40 bg-pink-400/30 rounded-full blur-xl" 
        style={{
          animation: 'floatOrb2 25s ease-in-out infinite reverse'
        }}
      ></div>
      <div 
        className="absolute top-1/2 right-1/4 w-24 h-24 bg-cyan-400/30 rounded-full blur-xl" 
        style={{
          animation: 'floatOrb3 18s ease-in-out infinite'
        }}
      ></div>

      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 sm:p-10 w-full max-w-md border border-white/20 shadow-2xl relative z-10">
        <div className="text-center mb-10">
          <div 
            className="text-5xl mb-4 cursor-pointer hover:scale-110 transition-transform duration-300"
            onClick={handleLogoClick}
            title={isAuthenticated ? 'Go to Dashboard' : 'Go to Home'}
          >
            📧
          </div>
          <h1 
            className="text-4xl sm:text-5xl font-bold text-white mb-3 cursor-pointer hover:opacity-80 transition-opacity duration-300"
            onClick={handleLogoClick}
            title={isAuthenticated ? 'Go to Dashboard' : 'Go to Home'}
          >
            Verify Email
          </h1>
          <p className="text-white/80 text-lg">Enter the verification code sent to your email</p>
        </div>

        <form onSubmit={handleVerification} className="space-y-6">
          {/* Show the email and username being verified */}
          <div className="text-center mb-6">
            <p className="text-white/70 text-sm mb-2">Verification code sent to:</p>
            <p className="text-white font-medium">{email}</p>
            <p className="text-white/70 text-sm mt-2 mb-1">Username:</p>
            <p className="text-white font-medium">{username}</p>
          </div>

          <div>
            <label className="block text-white/90 text-sm font-medium mb-3">
              Verification Code
            </label>
            <input 
              type="text" 
              value={code} 
              onChange={handleCodeChange}
              className="w-full px-4 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300"
              placeholder="123456" 
              required 
              maxLength={6}
            />
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-500/20 border border-red-400/30 text-white">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">⚠️</span>
                <span className="font-medium">{error.message}</span>
              </div>
            </div>
          )}

          {resendMessage && (
            <div className="p-4 rounded-2xl bg-green-500/20 border border-green-400/30 text-white">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">✅</span>
                <span className="font-medium">{resendMessage}</span>
              </div>
            </div>
          )}

          {verificationSuccess && successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-white">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">✨</span>
                <span className="font-medium">{successMessage}</span>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading || !email || !username || !code}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-white to-gray-100 text-purple-700 font-semibold hover:from-gray-100 hover:to-white transform hover:scale-[1.02] transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-white/70 text-sm mb-3">
            Didn't receive the code?
          </p>
          <button 
            type="button"
            onClick={handleResendCode}
            disabled={isResending || !email || !username}
            className="text-white hover:text-white/80 transition-colors duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? 'Sending...' : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmailPage
