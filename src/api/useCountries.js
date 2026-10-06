import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import useLocalizedQuery from './useLocalizedQuery.js'
import { countryOptions } from '../data/countries.js'

/**
 * The country list, named and ordered in the current language.
 *
 * Served by the API so the app and the backend agree on one list — the same
 * endpoint the mobile app uses. The bundled list is kept only as a fallback:
 * a reader should never be unable to finish registering because one lookup
 * request failed.
 */
export default function useCountries() {
  const { i18n } = useTranslation()

  const query = useLocalizedQuery(['countries'], '/countries', {
    select: (body) => body.data,
    // Country names change about as often as countries do.
    staleTime: 1000 * 60 * 60,
    retry: 1,
  })

  const fallback = useMemo(() => countryOptions(i18n.language), [i18n.language])

  return {
    countries: query.data ?? fallback,
    usingFallback: !query.data,
    loading: query.isLoading,
  }
}
