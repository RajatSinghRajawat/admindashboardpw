import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'
import { getStoredToken } from '../services/apiClient'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication status on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = getStoredToken('admin')
      if (!token) {
        setLoading(false)
        return
      }

      // Get user data from localStorage or fetch from API
      const storedUser = localStorage.getItem('pw_admin_user')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        setIsAuthenticated(true)
      } else {
        // Fetch from API if not in localStorage
        const response = await authAPI.getMe()
        if (response.success && response.data) {
          setUser(response.data)
          setIsAuthenticated(true)
          localStorage.setItem('pw_admin_user', JSON.stringify(response.data))
        } else {
          logout()
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password)
      if (response.success && response.data) {
        const adminData = response.data.admin
        setUser(adminData)
        setIsAuthenticated(true)
        localStorage.setItem('pw_admin_user', JSON.stringify(adminData))
        return { success: true, data: response.data }
      }
      return { success: false, message: response.message || 'Login failed' }
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' }
    }
  }

  const logout = () => {
    authAPI.logout()
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('pw_admin_user')
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext

