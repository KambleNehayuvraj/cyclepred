import React, { createContext, useContext, useState, useCallback } from 'react'
import { authAPI } from '../api/services'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('cw_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(() => localStorage.getItem('cw_token'))

  const saveAuth = useCallback((accessToken, userData) => {
    localStorage.setItem('cw_token', accessToken)
    localStorage.setItem('cw_user', JSON.stringify(userData))
    setToken(accessToken)
    setUser(userData)
  }, [])

  const register = useCallback(async (name, email, password) => {
    const res = await authAPI.register({ name, email, password })
    saveAuth(res.data.access_token, res.data.user)
    return res.data
  }, [saveAuth])

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login(email, password)
    saveAuth(res.data.access_token, res.data.user)
    return res.data
  }, [saveAuth])

  const logout = useCallback(() => {
    localStorage.removeItem('cw_token')
    localStorage.removeItem('cw_user')
    setToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((updates) => {
    const updated = { ...user, ...updates }
    localStorage.setItem('cw_user', JSON.stringify(updated))
    setUser(updated)
  }, [user])

  return (
    <AuthContext.Provider value={{ user, token, register, login, logout, updateUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}