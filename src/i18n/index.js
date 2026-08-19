import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import ar from './locales/ar.json'
import en from './locales/en.json'
import fr from './locales/fr.json'
import ur from './locales/ur.json'

/**
 * The languages Himam speaks. Adding one means adding a locale JSON above and
 * an entry here — plus the matching entry in the backend's config/himam.php,
 * which is what makes the *content* (books, quizzes, notifications)
 * translatable as well as the interface.
 */
export const LOCALES = {
  ar: { name: 'العربية', englishName: 'Arabic', dir: 'rtl' },
  en: { name: 'English', englishName: 'English', dir: 'ltr' },
  fr: { name: 'Français', englishName: 'French', dir: 'ltr' },
  ur: { name: 'اردو', englishName: 'Urdu', dir: 'rtl' },
}

export const DEFAULT_LOCALE = 'ar'
export const FALLBACK_LOCALE = 'en'

export const localeCodes = Object.keys(LOCALES)

export const isRtl = (code) => LOCALES[code]?.dir === 'rtl'

/**
 * Keeps <html lang/dir> in step with the active language.
 *
 * `dir` has to live on the document element rather than a wrapper: it drives
 * the logical CSS properties (margin-inline, inset-inline) the whole layout is
 * built on, and it tells the browser how to lay out text selection and caret
 * movement in form fields.
 */
export function applyDocumentLocale(code) {
  const locale = LOCALES[code] ? code : DEFAULT_LOCALE
  const root = document.documentElement

  root.setAttribute('lang', locale)
  root.setAttribute('dir', LOCALES[locale].dir)
  root.setAttribute('data-locale', locale)
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      en: { translation: en },
      fr: { translation: fr },
      ur: { translation: ur },
    },
    supportedLngs: localeCodes,
    fallbackLng: FALLBACK_LOCALE,
    // A visitor with no stored preference gets Arabic, the programme's own
    // language, rather than whatever their browser happens to report.
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
