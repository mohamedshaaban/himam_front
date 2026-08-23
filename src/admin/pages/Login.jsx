import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api, { clearToken, errorMessage, fieldErrors } from '../../api/client'
import { useAuth } from '../../context/AuthContext.jsx'
import useAdminLte, { LOGIN_BODY_CLASSES } from '../useAdminLte.js'
import { mediaUrl } from '../../api/media'

/**
 * Sign-in for the dashboard, on AdminLTE's own login layout.
 *
 * Separate from the reader sign-in on purpose: this one states plainly that it
 * wants an administrator account, and it turns a successful sign-in by a
 * non-admin straight back around rather than dropping them somewhere they have
 * no access to.
 */
export default function AdminLogin() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { login, logout, isAuthenticated, isAdmin, loading } = useAuth()

  useAdminLte(LOGIN_BODY_CLASSES)

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState(null)
  const [busy, setBusy] = useState(false)

  // Already signed in as an administrator — no reason to show this page.
  if (!loading && isAuthenticated && isAdmin) {
    return <Navigate to={location.state?.from?.pathname ?? '/admin'} replace />
  }

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setErrors({})
    setMessage(null)

    try {
      const user = await login(form)

      if (user.role !== 'admin') {
        // A valid reader account, but not for this door. Drop the token rather
        // than leaving them half signed-in against a dashboard they can't use.
        await logout().catch(() => clearToken())
        setMessage(t('admin.login.notAdmin'))
        return
      }

      navigate(location.state?.from?.pathname ?? '/admin', { replace: true })
    } catch (error) {
      setErrors(fieldErrors(error))
      setMessage(errorMessage(error, t('auth.invalid')))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-box">
      <div className="login-logo">
        <img src={mediaUrl("assets/logo.svg")} alt="" style={{ height: 56 }} />
        <div className="mt-2 fs-6 text-secondary">{t('app.association')}</div>
      </div>

      <div className="card">
        <div className="card-body login-card-body">
          <p className="login-box-msg">{t('admin.login.title')}</p>

          {message && <div className="alert alert-danger py-2" role="alert">{message}</div>}

          <form onSubmit={submit} noValidate>
            <div className="input-group mb-3">
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder={t('auth.email')}
                autoComplete="username"
                dir="ltr"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
              <div className="input-group-text">
                <Icon d="M4 6h16v12H4z M4 7l8 6 8-6" />
              </div>
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="input-group mb-3">
              <input
                type="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder={t('auth.password')}
                autoComplete="current-password"
                dir="ltr"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
              />
              <div className="input-group-text">
                <Icon d="M7 11V8a5 5 0 0 1 10 0v3 M5 11h14v10H5z" />
              </div>
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={busy}>
              {busy && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
              {t('actions.login')}
            </button>
          </form>

          <div className="text-center mt-3">
            <Link to="/" className="small">{t('admin.login.backToSite')}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function Icon({ d }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}
