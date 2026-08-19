import { FALLBACK_LOCALE } from '../i18n'

/**
 * Reads a locale => text map the way the API's own resolver does.
 *
 * Admin endpoints return the full translation map rather than one resolved
 * string, so list screens need the same degradation the reader app gets:
 * requested locale, then fallback, then whatever exists.
 */
export function pickTranslation(map, locale) {
  if (!map) return ''
  if (typeof map === 'string') return map

  const values = Object.values(map).filter(Boolean)

  return map[locale] ?? map[FALLBACK_LOCALE] ?? values[0] ?? ''
}
