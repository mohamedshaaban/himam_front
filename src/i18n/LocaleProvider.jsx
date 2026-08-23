import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import { getLocales, setLocales } from './index'

const LocaleContext = createContext(null)

/**
 * Loads the platform's language list from the API.
 *
 * The set of languages is data now, not a build-time constant, so every screen
 * that renders a language picker or a per-language field reads it from here.
 * `refresh` lets the admin Languages screen push its changes through without a
 * page reload.
 */
export function LocaleProvider({ children }) {
  const [locales, setState] = useState(getLocales())
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/locales')
      setLocales(data.data)
      setState(getLocales())
    } catch {
      // Keep the built-in list: the app should still render if the API is
      // asleep or unreachable rather than losing its language picker.
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const value = useMemo(
    () => ({
      locales,
      codes: Object.keys(locales),
      loading,
      refresh: load,
    }),
    [locales, loading, load],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocales() {
  const context = useContext(LocaleContext)

  if (!context) {
    throw new Error('useLocales must be used inside a LocaleProvider')
  }

  return context
}
