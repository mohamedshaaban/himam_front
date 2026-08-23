import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import ar from './locales/ar.json'
import en from './locales/en.json'
import fr from './locales/fr.json'
import ur from './locales/ur.json'

/**
 * Interface translations that ship with the build.
 *
 * These are separate from the *set of languages the platform offers*, which now
 * lives in the database and is fetched at runtime. An administrator can add a
 * language from the dashboard and immediately translate content into it; the
 * interface chrome falls back to the default language until a bundle for it is
 * added here. That split is deliberate — content is data, interface strings are
 * code, and only one of the two should require a deploy.
 */
const BUNDLES = { ar, en, fr, ur }

export const DEFAULT_LOCALE = 'ar'
export const FALLBACK_LOCALE = 'en'

/**
 * The active locale registry. Seeded with what the bundles know about so the
 * very first paint has a direction to work with, then replaced by the API's
 * list once LocaleProvider has loaded it.
 */
let registry = {
  ar: { name: 'العربية', englishName: 'Arabic', dir: 'rtl' },
  en: { name: 'English', englishName: 'English', dir: 'ltr' },
  fr: { name: 'Français', englishName: 'French', dir: 'ltr' },
  ur: { name: 'اردو', englishName: 'Urdu', dir: 'rtl' },
}

export const getLocales = () => registry
export const localeCodes = () => Object.keys(registry)
export const isRtl = (code) => registry[code]?.dir === 'rtl'
export const hasBundle = (code) => Boolean(BUNDLES[code])

/**
 * Replaces the registry with the server's list. Called once on boot and again
 * whenever an administrator changes the languages.
 */
export function setLocales(list) {
  if (!Array.isArray(list) || list.length === 0) return

  registry = Object.fromEntries(
    list.map((locale) => [
      locale.code,
      { name: locale.name, englishName: locale.english_name, dir: locale.dir },
    ]),
  )

  // A language may have been disabled while this reader was using it.
  if (!registry[i18n.language]) {
    i18n.changeLanguage(Object.keys(registry)[0])
  } else {
    applyDocumentLocale(i18n.language)
  }
}

/**
 * Keeps <html lang/dir> in step with the active language.
 *
 * `dir` has to live on the document element rather than a wrapper: it drives
 * the logical CSS properties the layout is built on, and it tells the browser
 * how to handle text selection and caret movement inside form fields.
 */
export function applyDocumentLocale(code) {
  const locale = registry[code] ? code : DEFAULT_LOCALE
  const root = document.documentElement

  root.setAttribute('lang', locale)
  root.setAttribute('dir', registry[locale]?.dir ?? 'ltr')
  root.setAttribute('data-locale', locale)
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: Object.fromEntries(
      Object.entries(BUNDLES).map(([code, translation]) => [code, { translation }]),
    ),
    // Deliberately unrestricted: a language added in the dashboard has no
    // bundle here, and pinning supportedLngs would make i18next refuse to
    // switch to it at all rather than falling back for interface strings only.
    fallbackLng: FALLBACK_LOCALE,
    lng: localStorage.getItem('himam.locale') || DEFAULT_LOCALE,
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'himam.locale',
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
    returnEmptyString: false,
  })

i18n.on('languageChanged', (code) => {
  applyDocumentLocale(code)
  localStorage.setItem('himam.locale', code)
})

applyDocumentLocale(i18n.language)

export default i18n
