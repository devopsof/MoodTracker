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
    isAuthenticated 
  } = useAuth()

  // Use the stored email from sign-up flow
  const email = pendingVerificationEmail
  
  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard')
    } else {
      navigate('/') // Go back to landing page
    }
  }

  const handleVerification = async (e) => {
    e.preventDefault()
    clearError()

    if (!email || !code) {
      return
    }

    try {
      const result = await confirmSignUp({ email, code })
      
      setVerificationSuccess(true)
      setSuccessMessage(result.message)
      
      if (result.autoSignedIn) {
        console.log('✅ Auto-signed in after verification!')
        // Show success message briefly before redirect
        setTimeout(() => {
          // User will be automatically redirected to dashboard by AuthContext
        }, 1500)
      } else {
        console.log('ℹ️ Verification complete, please sign in')
        // Fallback: user will be redirected to login page
      }
    } catch (error) {
      console.error('Verification error:', error)
      setVerificationSuccess(false)
    }
  }

  const handleResendCode = async () => {
    if (!email) return

    setIsResending(true)
    setResendMessage('')
    
    try {
      await resendConfirmationCode({ email })
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
      {/* Animated moving background */}
      <div 
        className="absolute inset-0" 
        style={{
          background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab, #667eea, #764ba2)',
          backgroundSize: '400% 400%',
          animation: 'gradientMove 15s ease infinite'
        }}
      ></div>
      <div 
        className="absolute inset-0" 
        style={{
          background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(0,0,0,0.1), transparent, rgba(255,255,255,0.05))',
          backgroundSize: '200% 200%',
          animation: 'shimmer 8s ease-in-out infinite reverse'
        }}
      ></div>

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
          {/* Show the email being verified */}
          <div className="text-center mb-6">
            <p className="text-white/70 text-sm mb-2">Verification code sent to:</p>
            <p className="text-white font-medium">{email}</p>
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
            disabled={isLoading || !email || !code}
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
            disabled={isResending || !email}
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
