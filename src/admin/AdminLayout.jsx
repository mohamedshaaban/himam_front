import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAdminLte from './useAdminLte.js'
import { useAuth } from '../context/AuthContext.jsx'
import { LOCALES, localeCodes } from '../i18n'
import api from '../api/client'

const NAV_ICONS = {
  dashboard: 'M3 12l9-9 9 9M5 10v10h14V10',
  levels: 'M4 19h16M4 14h16M4 9h16M4 4h16',
  books: 'M4 4h9a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z',
  badges: 'M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L3.5 9.2l5.9-.9z',
  announcements: 'M4 9h4l6-4v14l-6-4H4z',
  slides: 'M3 5h18v11H3z M8 20h8',
  certificates: 'M6 3h12v13l-6-3-6 3z M9 19h6',
  users: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 20a8 8 0 0 1 16 0',
}

export default function AdminLayout() {
  const { t, i18n } = useTranslation()
  const { user, setUser, logout } = useAuth()
  const { pathname } = useLocation()
  const [langOpen, setLangOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  useAdminLte()

  useEffect(() => {
    window.scrollTo({ top: 0 })
    // A route change on a phone should close the overlay sidebar, otherwise it
    // covers the page you just navigated to.
    document.body.classList.remove('sidebar-open')
    setLangOpen(false)
    setUserOpen(false)
  }, [pathname])

  const toggleSidebar = () => {
    // AdminLTE uses one class for the mobile overlay and another for the
    // desktop mini-sidebar; its own media queries decide which one applies, so
    // both are toggled together.
    document.body.classList.toggle('sidebar-open')
    document.body.classList.toggle('sidebar-collapse')
  }

  const chooseLanguage = async (code) => {
    setLangOpen(false)
    if (code === i18n.language) return

    await i18n.changeLanguage(code)

    try {
      const { data } = await api.put('/profile', { locale: code })
      setUser(data.data)
    } catch {
      // The interface still switches even if saving the preference fails.
    }
  }

  const nav = [
    { key: 'dashboard', to: '/admin', end: true },
    { key: 'levels', to: '/admin/levels' },
    { key: 'books', to: '/admin/books' },
    { key: 'badges', to: '/admin/badges' },
    { key: 'announcements', to: '/admin/announcements' },
    { key: 'slides', to: '/admin/slides' },
    { key: 'certificates', to: '/admin/certificates' },
    { key: 'users', to: '/admin/users' },
  ]

  return (
    <div className="app-wrapper">
      <nav className="app-header navbar navbar-expand bg-body">
        <div className="container-fluid">
          <ul className="navbar-nav">
            <li className="nav-item">
              <button type="button" className="nav-link btn btn-link" onClick={toggleSidebar} aria-label="Menu">
                <Icon d="M3 6h18M3 12h18M3 18h18" />
              </button>
            </li>
            <li className="nav-item d-none d-md-block">
              <Link to="/home" className="nav-link">{t('admin.backToApp')}</Link>
            </li>
          </ul>

          <ul className="navbar-nav ms-auto">
            <li className={`nav-item dropdown ${langOpen ? 'show' : ''}`}>
              <button
                type="button"
                className="nav-link btn btn-link d-flex align-items-center gap-1"
                onClick={() => { setLangOpen((open) => !open); setUserOpen(false) }}
                aria-expanded={langOpen}
              >
                <Icon d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18" />
                <span className="d-none d-sm-inline">{LOCALES[i18n.language]?.name}</span>
              </button>
              <div className={`dropdown-menu dropdown-menu-end ${langOpen ? 'show' : ''}`}>
                {localeCodes.map((code) => (
                  <button
                    key={code}
                    type="button"
                    className={`dropdown-item ${code === i18n.language ? 'active' : ''}`}
                    onClick={() => chooseLanguage(code)}
                    lang={code}
                    dir={LOCALES[code].dir}
                  >
                    {LOCALES[code].name}
                  </button>
                ))}
              </div>
            </li>

            <li className={`nav-item dropdown ${userOpen ? 'show' : ''}`}>
              <button
                type="button"
                className="nav-link btn btn-link d-flex align-items-center gap-2"
                onClick={() => { setUserOpen((open) => !open); setLangOpen(false) }}
                aria-expanded={userOpen}
              >
                <img
                  src={user?.avatar || '/assets/avatar-1.svg'}
                  alt=""
                  className="rounded-circle"
                  style={{ width: 30, height: 30 }}
                />
                <span className="d-none d-sm-inline">{user?.name}</span>
              </button>
              <div className={`dropdown-menu dropdown-menu-end ${userOpen ? 'show' : ''}`}>
                <Link className="dropdown-item" to="/account">{t('account.profile')}</Link>
                <Link className="dropdown-item" to="/home">{t('admin.backToApp')}</Link>
                <div className="dropdown-divider" />
                <button type="button" className="dropdown-item text-danger" onClick={logout}>
                  {t('actions.logout')}
                </button>
              </div>
            </li>
          </ul>
        </div>
      </nav>

      <aside className="app-sidebar bg-body-secondary shadow" data-bs-theme="dark">
        <div className="sidebar-brand">
          <Link to="/admin" className="brand-link d-flex align-items-center gap-2">
            <img src="/assets/logo.svg" alt="" className="brand-image opacity-75" style={{ height: 32 }} />
            <span className="brand-text fw-light">{t('admin.title')}</span>
          </Link>
        </div>

        <div className="sidebar-wrapper">
          <nav className="mt-2">
            <ul className="nav sidebar-menu flex-column" role="menu">
              {nav.map((item) => (
                <li className="nav-item" key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon d={NAV_ICONS[item.key]} className="nav-icon" />
                    <p>{t(`admin.nav.${item.key}`)}</p>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <div className="float-end d-none d-sm-inline">{t('app.copyright')}</div>
        <strong>{t('app.association')}</strong>
      </footer>
    </div>
  )
}

function Icon({ d, className }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}
