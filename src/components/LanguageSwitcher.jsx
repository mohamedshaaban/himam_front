import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../api/client'
import { LOCALES, localeCodes } from '../i18n'
import { useAuth } from '../context/AuthContext.jsx'

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const { isAuthenticated, setUser } = useAuth()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  // Close on an outside click or Escape — a menu that traps the page is worse
  // than no menu at all.
  useEffect(() => {
    if (!open) return undefined

    const onPointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const choose = async (code) => {
    setOpen(false)

    if (code === i18n.language) return

    await i18n.changeLanguage(code)

    // Persist for signed-in readers so the choice follows them to any device.
    if (isAuthenticated) {
      try {
        const { data } = await api.put('/profile', { locale: code })
        setUser(data.data)
      } catch {
        // A failed save still leaves the interface switched locally.
      }
    }
  }

  const current = LOCALES[i18n.language] ?? LOCALES.ar

  return (
    <div className="lang-switcher" ref={containerRef}>
      <button
        type="button"
        className="lang-switcher__button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t('common.language')}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
        </svg>
        <span>{current.name}</span>
      </button>

      {open && (
        <ul className="lang-switcher__menu" role="listbox">
          {localeCodes.map((code) => (
            <li key={code}>
              <button
                type="button"
                role="option"
                aria-current={code === i18n.language}
                aria-selected={code === i18n.language}
                onClick={() => choose(code)}
                lang={code}
                dir={LOCALES[code].dir}
              >
                <span>{LOCALES[code].name}</span>
                <span className="lang-switcher__native">{LOCALES[code].englishName}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
