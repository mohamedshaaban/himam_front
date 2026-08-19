import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function AdminLayout() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  const links = [
    { to: '/admin', label: t('admin.nav.dashboard'), end: true },
    { to: '/admin/levels', label: t('admin.nav.levels') },
    { to: '/admin/books', label: t('admin.nav.books') },
    { to: '/admin/badges', label: t('admin.nav.badges') },
    { to: '/admin/announcements', label: t('admin.nav.announcements') },
    { to: '/admin/slides', label: t('admin.nav.slides') },
    { to: '/admin/certificates', label: t('admin.nav.certificates') },
    { to: '/admin/users', label: t('admin.nav.users') },
  ]

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Link to="/admin" className="brand">
          <img src="/assets/logo.svg" alt={t('app.name')} />
          <span className="brand__latin">{t('admin.title')}</span>
        </Link>

        <nav className="admin-side__nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? 'is-active' : undefined)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', display: 'grid', gap: 'var(--space-3)' }}>
          <LanguageSwitcher />
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>{user?.name}</p>
          <Link to="/home" className="btn btn-secondary btn-sm">{t('admin.backToApp')}</Link>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
