import { Link, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Header from './Header.jsx'

export default function Layout() {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  // Routing between screens should start you at the top, the way a page load
  // would — otherwise a long book page drops you mid-way down the next screen.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="app-shell">
      <Header />

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="site-footer__inner">
          <span>{t('app.association')}</span>
          <span className="row" style={{ gap: 'var(--space-4)' }}>
            <Link to="/intro">{t('actions.intro')}</Link>
            <Link to="/login">{t('actions.login')}</Link>
            <Link to="/register">{t('actions.register')}</Link>
          </span>
          <span className="tnum">{t('app.copyright')}</span>
        </div>
      </footer>
    </div>
  )
}
