import React, { createContext, useContext, useReducer, useEffect } from 'react'
import {
  signUp as cognitoSignUp,
  confirmSignUp as cognitoConfirmSignUp,
  signIn as cognitoSignIn,
  signOut as cognitoSignOut,
  getCurrentSession,
  resendConfirmationCode as cognitoResendConfirmationCode,
} from '../lib/cognitoAuth'

// Initial state
const initialState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  authStatus: 'checking',
  pendingVerificationEmail: null,
  pendingVerificationPassword: null, // Store password for auto-login after verification
}

// Action types
const actions = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_USER: 'SET_USER',
  CLEAR_USER: 'CLEAR_USER',
  SET_AUTH_STATUS: 'SET_AUTH_STATUS',
  SET_PENDING_EMAIL: 'SET_PENDING_EMAIL',
  SET_PENDING_PASSWORD: 'SET_PENDING_PASSWORD',
  CLEAR_PENDING_CREDENTIALS: 'CLEAR_PENDING_CREDENTIALS',
}

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case actions.SET_LOADING:
      return { ...state, isLoading: action.payload }
    case actions.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false }
    case actions.CLEAR_ERROR:
      return { ...state, error: null }
    case actions.SET_USER:
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        authStatus: 'signedIn',
        isLoading: false,
        error: null,
      }
    case actions.CLEAR_USER:
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        authStatus: 'signedOut',
        isLoading: false,
      }
    case actions.SET_AUTH_STATUS:
      return {
        ...state,
        authStatus: action.payload,
        isLoading: false,
      }
    case actions.SET_PENDING_EMAIL:
      return { ...state, pendingVerificationEmail: action.payload }
    case actions.SET_PENDING_PASSWORD:
      return { ...state, pendingVerificationPassword: action.payload }
    case actions.CLEAR_PENDING_CREDENTIALS:
      return { 
        ...state, 
        pendingVerificationEmail: null, 
        pendingVerificationPassword: null 
      }
    default:
      return state
  }
}

// Create context
const AuthContext = createContext()

// Provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check auth on mount with timeout
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    console.log('🔍 Checking authentication...')
    
    const timeoutId = setTimeout(() => {
      console.log('⏰ Auth check timeout - signing out')
      dispatch({ type: actions.CLEAR_USER })
    }, 10000)

    try {
      const session = await getCurrentSession()
      clearTimeout(timeoutId)
      
      if (session?.user) {
        dispatch({
          type: actions.SET_USER,
          payload: {
            user: session.user,
            tokens: session.tokens,
          },
        })
      } else {
        dispatch({ type: actions.CLEAR_USER })
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      clearTimeout(timeoutId)
      dispatch({ type: actions.CLEAR_USER })
    }
  }

  const signUp = async ({ email, password }) => {
    dispatch({ type: actions.SET_LOADING, payload: true })
    dispatch({ type: actions.CLEAR_ERROR })
    
    try {
      const result = await cognitoSignUp({ email, password })
      
      // Store credentials for auto-login after verification
      dispatch({ type: actions.SET_PENDING_EMAIL, payload: email })
      dispatch({ type: actions.SET_PENDING_PASSWORD, payload: password })
      dispatch({ type: actions.SET_AUTH_STATUS, payload: 'needsConfirmation' })
      
      return {
        success: true,
        message: 'Sign up successful! Please check your email.',
      }
    } catch (error) {
      dispatch({
        type: actions.SET_ERROR,
        payload: {
          code: error.code,
          message: getErrorMessage(error),
        },
      })
      throw error
    }
  }

  const confirmSignUp = async ({ email, code }) => {
    dispatch({ type: actions.SET_LOADING, payload: true })
    dispatch({ type: actions.CLEAR_ERROR })
    
    try {
      await cognitoConfirmSignUp({ email, code })
      
      // Auto-login after successful verification using stored password
      const storedPassword = state.pendingVerificationPassword
      
      if (storedPassword) {
        console.log('✨ Email verified! Auto-signing in...')
        
        // Automatically sign the user in
        const signInResult = await cognitoSignIn({ email, password: storedPassword })
        
        // Clear stored credentials for security
        dispatch({ type: actions.CLEAR_PENDING_CREDENTIALS })
        
        // Set user as authenticated
        dispatch({
          type: actions.SET_USER,
          payload: {
            user: signInResult.user,
            tokens: signInResult.tokens,
          },
        })
        
        return {
          success: true,
          message: 'Email verified and signed in successfully!',
          autoSignedIn: true
        }
      } else {
        // Fallback if password not stored (shouldn't happen)
        dispatch({ type: actions.SET_AUTH_STATUS, payload: 'signedOut' })
        return {
          success: true,
          message: 'Email verified! Please sign in.',
          autoSignedIn: false
        }
      }
    } catch (error) {
      dispatch({
        type: actions.SET_ERROR,
        payload: {
          code: error.code,
          message: getErrorMessage(error),
        },
      })
      throw error
    }
  }

  const signIn = async ({ email, password }) => {
    dispatch({ type: actions.SET_LOADING, payload: true })
    dispatch({ type: actions.CLEAR_ERROR })
    
    try {
      const result = await cognitoSignIn({ email, password })
      
      dispatch({
        type: actions.SET_USER,
        payload: {
          user: result.user,
          tokens: result.tokens,
        },
      })
      
      return { success: true, user: result.user }
    } catch (error) {
      dispatch({
        type: actions.SET_ERROR,
        payload: {
          code: error.code,
          message: getErrorMessage(error),
        },
      })
      throw error
    }
  }

  const signOut = async () => {
    dispatch({ type: actions.SET_LOADING, payload: true })
    
    try {
      await cognitoSignOut()
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      dispatch({ type: actions.CLEAR_USER })
      // Clear any pending credentials for security
      dispatch({ type: actions.CLEAR_PENDING_CREDENTIALS })
    }
  }

  const resendConfirmationCode = async ({ email }) => {
    try {
      await cognitoResendConfirmationCode({ email })
      return {
        success: true,
        message: 'Confirmation code sent!',
      }
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  const clearError = () => {
    dispatch({ type: actions.CLEAR_ERROR })
  }

  // Error message helper
  const getErrorMessage = (error) => {
    switch (error.code) {
      case 'UserNotFoundException':
        return 'No account found with this email.'
      case 'NotAuthorizedException':
        return 'Incorrect email or password.'
      case 'UserNotConfirmedException':
        return 'Please verify your email first.'
      case 'InvalidPasswordException':
        return 'Password must be at least 8 characters.'
      case 'UsernameExistsException':
        return 'Account already exists.'
      case 'CodeMismatchException':
        return 'Invalid verification code.'
      case 'ExpiredCodeException':
        return 'Code expired. Request a new one.'
      default:
        return error.message || 'Something went wrong.'
    }
  }

  const value = {
    ...state,
    signUp,
    confirmSignUp,
    signIn,
    signOut,
    resendConfirmationCode,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
