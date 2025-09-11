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
  pendingVerificationUsername: null, // Store username for auto-login after verification
}

// Try to restore pending verification data from localStorage
try {
  const pendingVerification = localStorage.getItem('pendingVerification');
  if (pendingVerification) {
    const { email, username, password } = JSON.parse(pendingVerification);
    if (email && username) {
      initialState.pendingVerificationEmail = email;
      initialState.pendingVerificationUsername = username;
      initialState.pendingVerificationPassword = password;
      initialState.authStatus = 'needsConfirmation';
    }
  }
} catch (e) {
  console.warn('Failed to restore pending verification from localStorage:', e);
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
  SET_PENDING_USERNAME: 'SET_PENDING_USERNAME',
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
    case actions.SET_PENDING_USERNAME:
      return { ...state, pendingVerificationUsername: action.payload }
    case actions.CLEAR_PENDING_CREDENTIALS:
      return { 
        ...state, 
        pendingVerificationEmail: null, 
        pendingVerificationPassword: null,
        pendingVerificationUsername: null 
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

  const signUp = async ({ username, email, password }) => {
    dispatch({ type: actions.SET_LOADING, payload: true })
    dispatch({ type: actions.CLEAR_ERROR })
    
    try {
      const result = await cognitoSignUp({ username, email, password })
      
      // Store credentials for auto-login after verification
      dispatch({ type: actions.SET_PENDING_EMAIL, payload: email })
      dispatch({ type: actions.SET_PENDING_PASSWORD, payload: password })
      dispatch({ type: actions.SET_PENDING_USERNAME, payload: username })
      dispatch({ type: actions.SET_AUTH_STATUS, payload: 'needsConfirmation' })
      
      // Also store in localStorage to persist across page refreshes
      try {
        localStorage.setItem('pendingVerification', JSON.stringify({
          email: email,
          username: username,
          password: password,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.warn('Failed to store pending verification in localStorage:', e);
      }
      
      return {
        success: true,
        message: 'Sign up successful! Please check your email.',
        needsVerification: true
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

  // Helper function to clean up localStorage before verification
  const cleanupLocalStorage = () => {
    try {
      // Get all keys in localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // Keep only essential keys, remove others
        if (key && !key.startsWith('pendingVerification') && 
            !key.startsWith('moodtracker_form_mode') && 
            !key.startsWith('moodtracker_entries')) {
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
  
  const confirmSignUp = async ({ code }) => {
    dispatch({ type: actions.SET_LOADING, payload: true })
    dispatch({ type: actions.CLEAR_ERROR })
    
    try {
      // Clean up localStorage before verification to avoid quota issues
      cleanupLocalStorage();
      
      await cognitoConfirmSignUp({ username: state.pendingVerificationUsername, code })
      
      // Auto-login after successful verification using stored credentials
      const storedPassword = state.pendingVerificationPassword
      const storedUsername = state.pendingVerificationUsername
      
      if (storedPassword && storedUsername) {
        console.log('✨ Email verified! Auto-signing in with username...')
        
        // Automatically sign the user in with username
        const signInResult = await cognitoSignIn({ email: storedUsername, password: storedPassword })
        
        // Clear stored credentials for security
        dispatch({ type: actions.CLEAR_PENDING_CREDENTIALS })
        
        // Clear localStorage as well
        try {
          localStorage.removeItem('pendingVerification');
        } catch (e) {
          console.warn('Failed to remove pending verification from localStorage:', e);
        }
        
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
        
        // Clear localStorage as well
        try {
          localStorage.removeItem('pendingVerification');
        } catch (e) {
          console.warn('Failed to remove pending verification from localStorage:', e);
        }
        
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
      
      // Clear localStorage as well
      try {
        localStorage.removeItem('pendingVerification');
        localStorage.removeItem('moodtracker_form_mode');
      } catch (e) {
        console.warn('Failed to clear localStorage items:', e);
      }
    }
  }

  const resendConfirmationCode = async () => {
    try {
      await cognitoResendConfirmationCode({ username: state.pendingVerificationUsername })
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
        return 'Username already exists. Please choose another one.'
      case 'AliasExistsException':
        return 'An account with this email already exists.'
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
