// AWS Cognito authentication utility
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js'

// Configuration from environment variables
const poolData = {
  UserPoolId: import.meta.env.VITE_COGNITO_USERPOOL_ID,
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
}

// Debug environment variables
console.log('🌍 Environment variables:', {
  region: import.meta.env.VITE_AWS_REGION,
  userPoolId: import.meta.env.VITE_COGNITO_USERPOOL_ID,
  clientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
  domain: import.meta.env.VITE_COGNITO_DOMAIN,
})

if (!poolData.UserPoolId || !poolData.ClientId) {
  console.error('❌ Missing Cognito configuration! Check your .env.local file')
  console.error('Required variables: VITE_COGNITO_USERPOOL_ID, VITE_COGNITO_CLIENT_ID')
}

const userPool = new CognitoUserPool(poolData)

/**
 * Sign up a new user
 * @param {string} username - User's chosen username
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} Promise resolving to user data or rejecting with error
 */
export const signUp = ({ username, email, password }) => {
  return new Promise((resolve, reject) => {
    const attributeList = [
      new CognitoUserAttribute({
        Name: 'email',
        Value: email,
      }),
      new CognitoUserAttribute({
        Name: 'preferred_username',
        Value: username,
      }),
    ]

    // Use username as the Cognito username, email as an attribute
    userPool.signUp(username, password, attributeList, null, (err, result) => {
      if (err) {
        console.error('SignUp error:', err)
        reject({
          code: err.code,
          message: err.message,
        })
        return
      }

      console.log('SignUp success:', result)
      resolve({
        user: result.user,
        userConfirmed: result.userConfirmed,
        userSub: result.userSub,
      })
    })
  })
}

/**
 * Confirm user registration with verification code
 * @param {string} email - User's email address or username  
 * @param {string} code - Verification code from email
 * @returns {Promise<string>} Promise resolving to confirmation result
 */
export const confirmSignUp = ({ email, code }) => {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email, // This can be username or email
      Pool: userPool,
    })

    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        console.error('ConfirmSignUp error:', err)
        reject({
          code: err.code,
          message: err.message,
        })
        return
      }

      console.log('ConfirmSignUp success:', result)
      resolve(result)
    })
  })
}

/**
 * Sign in an existing user
 * @param {string} email - User's email address or username
 * @param {string} password - User's password
 * @returns {Promise<Object>} Promise resolving to session data
 */
export const signIn = ({ email, password }) => {
  return new Promise((resolve, reject) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: email, // This can be username or email
      Password: password,
    })

    const cognitoUser = new CognitoUser({
      Username: email, // This can be username or email
      Pool: userPool,
    })

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session) => {
        console.log('SignIn success:', session)
        const tokens = {
          idToken: session.getIdToken().getJwtToken(),
          accessToken: session.getAccessToken().getJwtToken(),
          refreshToken: session.getRefreshToken().getToken(),
        }

        const user = {
          email: null, // Will be set from attributes
          username: cognitoUser.getUsername(),
          attributes: {},
        }

        // Get user attributes
        cognitoUser.getUserAttributes((err, attributes) => {
          if (!err && attributes) {
            attributes.forEach((attribute) => {
              user.attributes[attribute.getName()] = attribute.getValue()
            })
            // Set email from attributes, or use display name if no email attribute
            user.email = user.attributes.email || user.username
            // Set readable username from preferred_username or fallback
            user.displayUsername = user.attributes.preferred_username || user.username
          } else {
            // Fallback if attributes fail
            user.email = user.username
            user.displayUsername = user.username
          }
        })

        resolve({
          user,
          tokens,
          session,
        })
      },
      onFailure: (err) => {
        console.error('SignIn error:', err)
        reject({
          code: err.code,
          message: err.message,
        })
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        // Handle new password required scenario
        reject({
          code: 'NewPasswordRequired',
          message: 'New password is required',
          userAttributes,
          requiredAttributes,
        })
      },
    })
  })
}

/**
 * Sign out the current user
 * @returns {Promise<void>} Promise resolving when sign out is complete
 */
export const signOut = () => {
  return new Promise((resolve) => {
    const cognitoUser = userPool.getCurrentUser()
    if (cognitoUser) {
      cognitoUser.signOut(() => {
        console.log('SignOut success')
        resolve()
      })
    } else {
      console.log('No user to sign out')
      resolve()
    }
  })
}

/**
 * Get the current user session
 * @returns {Promise<Object>} Promise resolving to current session or null
 */
export const getCurrentSession = () => {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser()
    
    if (!cognitoUser) {
      resolve(null)
      return
    }

    cognitoUser.getSession((err, session) => {
      if (err) {
        console.error('GetCurrentSession error:', err)
        resolve(null)
        return
      }

      if (!session || !session.isValid()) {
        resolve(null)
        return
      }

      const tokens = {
        idToken: session.getIdToken().getJwtToken(),
        accessToken: session.getAccessToken().getJwtToken(),
        refreshToken: session.getRefreshToken().getToken(),
      }

      const user = {
        email: null, // Will be set from attributes
        username: cognitoUser.getUsername(),
        attributes: {},
      }

      // Get user attributes
      cognitoUser.getUserAttributes((err, attributes) => {
        if (!err && attributes) {
          attributes.forEach((attribute) => {
            user.attributes[attribute.getName()] = attribute.getValue()
          })
          // Use email attribute as the primary email, fallback to username
          user.email = user.attributes.email || cognitoUser.getUsername()
          // Set readable username from preferred_username or fallback
          user.displayUsername = user.attributes.preferred_username || user.username.split('@')[0]
        } else {
          // Fallback if attributes fail to load
          user.email = cognitoUser.getUsername()
          user.displayUsername = user.username.includes('@') ? user.username.split('@')[0] : user.username
        }

        // Debug: User authentication data loaded

        resolve({
          user,
          tokens,
          session,
        })
      })
    })
  })
}

/**
 * Refresh the current session tokens
 * @returns {Promise<Object>} Promise resolving to refreshed session
 */
export const refreshSession = () => {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser()
    
    if (!cognitoUser) {
      reject(new Error('No current user'))
      return
    }

    cognitoUser.getSession((err, session) => {
      if (err) {
        reject(err)
        return
      }

      if (!session || !session.isValid()) {
        reject(new Error('Invalid session'))
        return
      }

      const refreshToken = session.getRefreshToken()
      cognitoUser.refreshSession(refreshToken, (err, newSession) => {
        if (err) {
          console.error('RefreshSession error:', err)
          reject(err)
          return
        }

        const tokens = {
          idToken: newSession.getIdToken().getJwtToken(),
          accessToken: newSession.getAccessToken().getJwtToken(),
          refreshToken: newSession.getRefreshToken().getToken(),
        }

        resolve({
          tokens,
          session: newSession,
        })
      })
    })
  })
}

/**
 * Resend verification code to user's email
 * @param {string} email - User's email address
 * @returns {Promise<string>} Promise resolving when code is sent
 */
export const resendConfirmationCode = ({ email }) => {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    })

    cognitoUser.resendConfirmationCode((err, result) => {
      if (err) {
        console.error('ResendConfirmationCode error:', err)
        reject({
          code: err.code,
          message: err.message,
        })
        return
      }

      console.log('ResendConfirmationCode success:', result)
      resolve(result)
    })
  })
}

/**
 * Check if there's a current user
 * @returns {boolean} True if there's a current user
 */
export const hasCurrentUser = () => {
  return userPool.getCurrentUser() !== null
}

/**
 * Get user pool instance (for advanced usage)
 * @returns {CognitoUserPool} The user pool instance
 */
export const getUserPool = () => userPool

export default {
  signUp,
  confirmSignUp,
  signIn,
  signOut,
  getCurrentSession,
  refreshSession,
  resendConfirmationCode,
  hasCurrentUser,
  getUserPool,
}
