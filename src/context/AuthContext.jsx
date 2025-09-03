// AuthContext for managing AWS Cognito authentication state
import React, { createContext, useContext, useReducer, useEffect } from 'react'
import {
  signUp as cognitoSignUp,
  confirmSignUp as cognitoConfirmSignUp,
  signIn as cognitoSignIn,
  signOut as cognitoSignOut,
  getCurrentSession,
  refreshSession,
  resendConfirmationCode as cognitoResendConfirmationCode,
} from '../lib/cognitoAuth'

// Initial state
const initialState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  authStatus: 'checking', // 'checking', 'signedOut', 'signedIn', 'needsConfirmation'
  pendingVerificationEmail: null, // Store email for verification flow
}

// Action types
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_USER: 'SET_USER',
  CLEAR_USER: 'CLEAR_USER',
  SET_AUTH_STATUS: 'SET_AUTH_STATUS',
  SET_TOKENS: 'SET_TOKENS',
  SET_PENDING_VERIFICATION_EMAIL: 'SET_PENDING_VERIFICATION_EMAIL',
}

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      }
    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        // Don't automatically set isLoading to false here
        // Each action handler should manage isLoading explicitly
      }
    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }
    case actionTypes.SET_USER:
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        authStatus: 'signedIn',
        isLoading: false,
        error: null,
      }
    case actionTypes.CLEAR_USER:
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        authStatus: 'signedOut',
        isLoading: false,
        error: null,
      }
    case actionTypes.SET_AUTH_STATUS:
      return {
        ...state,
        authStatus: action.payload,
        isLoading: false,
      }
    case actionTypes.SET_TOKENS:
      return {
        ...state,
        tokens: action.payload,
      }
    case actionTypes.SET_PENDING_VERIFICATION_EMAIL:
      return {
        ...state,
        pendingVerificationEmail: action.payload,
      }
    default:
      return state
  }
}

// Create context
const AuthContext = createContext()

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check for existing session on mount
  useEffect(() => {
    checkAuthState()
  }, [])

  // Auto-refresh tokens before they expire
  useEffect(() => {
    if (state.isAuthenticated && state.tokens) {
      const refreshInterval = setInterval(() => {
        handleRefreshSession()
      }, 50 * 60 * 1000) // Refresh every 50 minutes (tokens expire in 60 minutes)

      return () => clearInterval(refreshInterval)
    }
  }, [state.isAuthenticated, state.tokens])

  const checkAuthState = async () => {
    try {
      console.log('🔍 Checking auth state...')
      dispatch({ type: actionTypes.SET_LOADING, payload: true })
      const session = await getCurrentSession()
      
      if (session) {
        console.log('✅ Found existing session:', session)
        dispatch({
          type: actionTypes.SET_USER,
          payload: {
            user: session.user,
            tokens: session.tokens,
          },
        })
      } else {
        console.log('❌ No existing session found')
        dispatch({ type: actionTypes.CLEAR_USER })
      }
    } catch (error) {
      console.error('❌ Error checking auth state:', error)
      dispatch({ type: actionTypes.CLEAR_USER })
    }
  }

  const handleRefreshSession = async () => {
    try {
      const result = await refreshSession()
      dispatch({
        type: actionTypes.SET_TOKENS,
        payload: result.tokens,
      })
    } catch (error) {
      console.error('Error refreshing session:', error)
      // If refresh fails, sign out the user
      await handleSignOut()
    }
  }

  const handleSignUp = async ({ email, password }) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true })
      dispatch({ type: actionTypes.CLEAR_ERROR })
      
      const result = await cognitoSignUp({ email, password })
      
      // Store the email for verification flow
      dispatch({ 
        type: actionTypes.SET_PENDING_VERIFICATION_EMAIL, 
        payload: email 
      })
      
      dispatch({ 
        type: actionTypes.SET_AUTH_STATUS, 
        payload: 'needsConfirmation' 
      })
      
      return {
        success: true,
        userConfirmed: result.userConfirmed,
        message: 'Sign up successful! Please check your email for verification code.',
      }
    } catch (error) {
      // Don't change authStatus on sign-up errors - stay in current state
      dispatch({
        type: actionTypes.SET_ERROR,
        payload: {
          code: error.code,
          message: getErrorMessage(error),
        },
      })
      // Still set loading to false
      dispatch({ type: actionTypes.SET_LOADING, payload: false })
      throw error
    }
  }

  const handleConfirmSignUp = async ({ email, code }) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true })
      dispatch({ type: actionTypes.CLEAR_ERROR })
      
      await cognitoConfirmSignUp({ email, code })
      
      // Clear the pending verification email
      dispatch({ 
        type: actionTypes.SET_PENDING_VERIFICATION_EMAIL, 
        payload: null 
      })
      
      dispatch({ 
        type: actionTypes.SET_AUTH_STATUS, 
        payload: 'signedOut' 
      })
      
      return {
        success: true,
        message: 'Email verification successful! You can now sign in.',
      }
    } catch (error) {
      dispatch({
        type: actionTypes.SET_ERROR,
        payload: {
          code: error.code,
          message: getErrorMessage(error),
        },
      })
      throw error
    }
  }

  const handleSignIn = async ({ email, password }) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true })
      dispatch({ type: actionTypes.CLEAR_ERROR })
      
      const result = await cognitoSignIn({ email, password })
      
      dispatch({
        type: actionTypes.SET_USER,
        payload: {
          user: result.user,
          tokens: result.tokens,
        },
      })
      
      return {
        success: true,
        user: result.user,
      }
    } catch (error) {
      dispatch({
        type: actionTypes.SET_ERROR,
        payload: {
          code: error.code,
          message: getErrorMessage(error),
        },
      })
      // Explicitly set loading to false
      dispatch({ type: actionTypes.SET_LOADING, payload: false })
      throw error
    }
  }

  const handleSignOut = async () => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true })
      
      await cognitoSignOut()
      dispatch({ type: actionTypes.CLEAR_USER })
      
      return { success: true }
    } catch (error) {
      console.error('Error signing out:', error)
      // Force clear user state even if signout fails
      dispatch({ type: actionTypes.CLEAR_USER })
      return { success: true }
    }
  }

  const handleResendConfirmationCode = async ({ email }) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true })
      dispatch({ type: actionTypes.CLEAR_ERROR })
      
      await cognitoResendConfirmationCode({ email })
      
      dispatch({ type: actionTypes.SET_LOADING, payload: false })
      
      return {
        success: true,
        message: 'Verification code sent! Please check your email.',
      }
    } catch (error) {
      dispatch({
        type: actionTypes.SET_ERROR,
        payload: {
          code: error.code,
          message: getErrorMessage(error),
        },
      })
      throw error
    }
  }

  const clearError = () => {
    dispatch({ type: actionTypes.CLEAR_ERROR })
  }

  // Helper function to get user-friendly error messages
  const getErrorMessage = (error) => {
    switch (error.code) {
      case 'UsernameExistsException':
        return 'An account with this email already exists.'
      case 'InvalidPasswordException':
        return 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character.'
      case 'InvalidParameterException':
        return 'Please check your input and try again.'
      case 'CodeMismatchException':
        return 'Invalid verification code. Please try again.'
      case 'ExpiredCodeException':
        return 'Verification code has expired. Please request a new one.'
      case 'NotAuthorizedException':
        return 'Incorrect email or password.'
      case 'UserNotConfirmedException':
        return 'Please verify your email address before signing in.'
      case 'UserNotFoundException':
        return 'No account found with this email address.'
      case 'TooManyRequestsException':
        return 'Too many requests. Please wait a moment and try again.'
      case 'LimitExceededException':
        return 'Request limit exceeded. Please try again later.'
      default:
        return error.message || 'An unexpected error occurred. Please try again.'
    }
  }

  const contextValue = {
    // State
    user: state.user,
    tokens: state.tokens,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    authStatus: state.authStatus,
    pendingVerificationEmail: state.pendingVerificationEmail,
    
    // Actions
    signUp: handleSignUp,
    confirmSignUp: handleConfirmSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    resendConfirmationCode: handleResendConfirmationCode,
    clearError,
    checkAuthState,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
