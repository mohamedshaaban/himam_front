import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api, { clearToken, getToken, setToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { i18n } = useTranslation()
  const [user, setUser] = useState(null)
  // Starts true only when there is a token worth verifying, so a signed-out
  // visitor never waits on a request to render the landing page.
  const [loading, setLoading] = useState(Boolean(getToken()))

  const loadUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null)
      setLoading(false)
      return null
    }

    try {
      const { data } = await api.get('/auth/me')
      setUser(data.data)
      return data.data
    } catch {
      clearToken()
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  // A reader's saved language wins over whatever this browser had stored, so
  // signing in on a new device carries the preference across.
  useEffect(() => {
    if (user?.locale && user.locale !== i18n.language) {
      i18n.changeLanguage(user.locale)
    }
  }, [user?.locale, i18n])

  const login = useCallback(async (credentials) => {
    const { data } = await api.post('/auth/login', credentials)
    setToken(data.token)
    setUser(data.user.data ?? data.user)
    return data.user.data ?? data.user
  }, [])

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', {
      ...payload,
      locale: payload.locale ?? i18n.language,
    })
    setToken(data.token)
    setUser(data.user.data ?? data.user)
    return data.user.data ?? data.user
  }, [i18n])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // The local session still has to end even if the request fails.
    }

    clearToken()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      refresh: loadUser,
      setUser,
    }),
    [user, loading, login, register, logout, loadUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider')
  }

  return context
}
