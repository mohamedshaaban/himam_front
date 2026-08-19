import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useLocalizedQuery from '../api/useLocalizedQuery.js'
import { useAuth } from '../context/AuthContext.jsx'
import LanguageSwitcher from './LanguageSwitcher.jsx'

export default function Header() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated, isAdmin, user, logout } = useAuth()

  const unread = useLocalizedQuery(['announcements', 'unread'], '/announcements', {
    enabled: isAuthenticated,
    staleTime: 60_000,
    select: (body) => body.meta.unread,
  })

  const links = [
    { to: '/home', label: t('nav.home'), authOnly: true },
    { to: '/progress', label: t('progress.title'), authOnly: true },
    { to: '/books', label: t('nav.books') },
    { to: '/badges', label: t('nav.badges') },
    { to: '/certificates', label: t('nav.certificates'), authOnly: true },
    { to: '/honor', label: t('nav.honor') },
    { to: '/account', label: t('nav.account'), authOnly: true },
  ].filter((link) => !link.authOnly || isAuthenticated)

  const signOut = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to={isAuthenticated ? '/home' : '/'} className="brand">
          <img src="/assets/logo.svg" alt={t('app.name')} />
          <span className="brand__latin">{t('app.brandLatin')}</span>
        </Link>

        <nav className="site-nav" aria-label={t('app.name')}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? 'is-active' : undefined)}
            >
              {link.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
              {t('nav.admin')}
            </NavLink>
          )}
        </nav>

        <div className="header-actions">
          <LanguageSwitcher />

          {isAuthenticated ? (
            <>
              <Link to="/notifications" className="icon-button" aria-label={t('nav.notifications')}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                  <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
                </svg>
                {unread.data > 0 && <span className="badge-count">{unread.data}</span>}
              </Link>

              <Link to="/account" aria-label={t('nav.account')}>
                <img className="avatar" src={user?.avatar || '/assets/avatar-2.svg'} alt="" />
              </Link>

              <button type="button" className="btn btn-ghost" onClick={signOut}>
                {t('actions.logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/intro" className="btn btn-ghost">{t('actions.intro')}</Link>
              <Link to="/login" className="btn btn-primary">{t('actions.login')}</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
