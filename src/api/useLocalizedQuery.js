import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import api from './client'

/**
 * A read query whose response language is pinned to its cache key.
 *
 * Reading the active language ambiently at request time is not safe here: a
 * language switch re-renders components and changes the cache key immediately,
 * but the request for the new key can still be dispatched in a tick where the
 * i18n instance reports the previous language. The result is content that
 * lags one language behind the interface, cached under the *new* key so it
 * never corrects itself.
 *
 * Capturing the language during render and sending it as an explicit ?lang=
 * makes the two agree by construction — the payload in a cache slot is always
 * the language that slot is keyed by. The backend gives ?lang= the highest
 * precedence in SetLocale.
 */
export default function useLocalizedQuery(key, path, options = {}) {
  const { i18n } = useTranslation()
  const lang = i18n.language

  const { params, ...queryOptions } = options

  return useQuery({
    queryKey: [...(Array.isArray(key) ? key : [key]), lang],
    queryFn: async () => {
      const response = await api.get(path, { params: { ...params, lang } })
      return response.data
    },
    ...queryOptions,
  })
}
