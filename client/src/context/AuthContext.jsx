import React, { createContext, useReducer, useCallback } from 'react'
import { authService } from '../services'

/**
 * Auth Context
 * Manages global authentication state
 */
export const AuthContext = createContext()

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('auth_token') || null,
  isLoading: false,
  error: null,
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null }

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        error: null,
      }

    case 'AUTH_ERROR':
      return { ...state, isLoading: false, error: action.payload }

    case 'LOGOUT':
      return { ...state, user: null, token: null, error: null }

    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } }

    case 'CLEAR_ERROR':
      return { ...state, error: null }

    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  /**
   * Login user
   */
  const login = useCallback(async (email, password) => {
    dispatch({ type: 'AUTH_START' })
    try {
      const response = await authService.login(email, password)
      const { token, userId, username, email: userEmail } = response

      const user = { userId, username, email: userEmail }

      // Store in localStorage
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user', JSON.stringify(user))

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { token, user },
      })

      return { success: true }
    } catch (error) {
      const errorMsg = error.message || 'Login failed'
      dispatch({ type: 'AUTH_ERROR', payload: errorMsg })
      return { success: false, error: errorMsg }
    }
  }, [])

  /**
   * Register new user
   */
  const register = useCallback(async (username, email, password) => {
    dispatch({ type: 'AUTH_START' })
    try {
      await authService.register({ username, email, password })
      // Auto-login after registration
      return await login(email, password)
    } catch (error) {
      const errorMsg = error.message || 'Registration failed'
      dispatch({ type: 'AUTH_ERROR', payload: errorMsg })
      return { success: false, error: errorMsg }
    }
  }, [login])

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    dispatch({ type: 'LOGOUT' })
  }, [])

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (data) => {
    dispatch({ type: 'AUTH_START' })
    try {
      const response = await authService.updateProfile(data)
      const updatedUser = {
        ...state.user,
        username: response.username,
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      dispatch({ type: 'UPDATE_USER', payload: updatedUser })
      return { success: true }
    } catch (error) {
      const errorMsg = error.message || 'Update failed'
      dispatch({ type: 'AUTH_ERROR', payload: errorMsg })
      return { success: false, error: errorMsg }
    }
  }, [state.user])

  /**
   * Get user profile
   */
  const getProfile = useCallback(async () => {
    dispatch({ type: 'AUTH_START' })
    try {
      const response = await authService.getProfile()
      const user = {
        userId: response.userId,
        username: response.username,
        email: response.email,
        salary: response.salary,
        monthlyExpense: response.monthlyExpense,
      }
      localStorage.setItem('user', JSON.stringify(user))
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { token: state.token, user },
      })
      return { success: true, data: response }
    } catch (error) {
      const errorMsg = error.message || 'Failed to fetch profile'
      dispatch({ type: 'AUTH_ERROR', payload: errorMsg })
      return { success: false, error: errorMsg }
    }
  }, [state.token])

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  const value = {
    ...state,
    isAuthenticated: !!state.token && !!state.user,
    login,
    register,
    logout,
    updateProfile,
    getProfile,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
