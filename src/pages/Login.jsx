import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { errorMessage, fieldErrors } from '../api/client'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setErrors({})
    setMessage(null)

    try {
      const user = await login(form)
      // Send administrators straight to the dashboard; everyone else lands
      // wherever they were headed before the login redirect.
      const fallback = user.role === 'admin' ? '/admin' : '/home'
      navigate(location.state?.from?.pathname ?? fallback, { replace: true })
    } catch (error) {
      setErrors(fieldErrors(error))
      setMessage(errorMessage(error, t('auth.invalid')))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="grid-auto" style={{ '--min': '300px', alignItems: 'center', gap: 'var(--space-8)' }}>
      <div className="plate">
        <img
          src="/assets/logo.svg"
          alt={t('app.name')}
          style={{ width: '100%', height: 'clamp(220px, 30vw, 380px)', objectFit: 'contain', background: 'var(--color-neutral-100)' }}
        />
      </div>

      <div style={{ maxWidth: '44ch' }}>
        <h1 className="page-title">{t('auth.loginTitle')}</h1>
        <p className="justify muted" style={{ margin: 'var(--space-3) 0 var(--space-6)' }}>{t('auth.loginBody')}</p>

        {message && <p className="notice notice--error" role="alert">{message}</p>}

        <form onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="email">{t('auth.email')}</label>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="email"
              dir="ltr"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div className="field" style={{ marginTop: 'var(--space-4)' }}>
            <label htmlFor="password">{t('auth.password')}</label>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="current-password"
              dir="ltr"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          <div className="row" style={{ marginTop: 'var(--space-6)' }}>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? t('common.loading') : t('actions.login')}
            </button>
            <Link to="/register" className="btn btn-ghost">{t('actions.register')}</Link>
          </div>
        </form>

        <p className="justify muted" style={{ margin: 'var(--space-4) 0 0', fontSize: 14 }}>{t('auth.loginHint')}</p>
        <p className="muted" style={{ margin: 'var(--space-2) 0 0', fontSize: 13 }} dir="ltr">{t('auth.demoHint')}</p>
      </div>
    </section>
  )
}
