import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { errorMessage, fieldErrors } from '../api/client'
import { useAuth } from '../context/AuthContext.jsx'
import { mediaUrl } from '../api/media'

/**
 * Deliberately spare: the two logos, the credentials, and nothing else.
 *
 * The marketing copy, the introduction link and the sign-up path all live on
 * the landing page. A sign-in screen only has one job, and every extra control
 * on it is something to read past.
 */
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
    <section className="login">
      <div className="login__marks">
        <img src={mediaUrl("assets/logo.svg")} alt={t('app.name')} className="login__logo" />
        <span className="login__divider" aria-hidden="true" />
        <img src={mediaUrl("assets/association.svg")} alt={t('app.association')} className="login__logo" />
      </div>

      <h1 className="login__title">{t('auth.loginTitle')}</h1>

      {message && <p className="notice notice--error" role="alert">{message}</p>}

      <form onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="email">{t('auth.email')}</label>
          <input
            id="email"
            className="input"
            type="email"
            autoComplete="username"
            dir="ltr"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
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
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={busy}
          style={{ marginTop: 'var(--space-6)' }}
        >
          {busy ? t('common.loading') : t('actions.login')}
        </button>
      </form>
    </section>
  )
}
