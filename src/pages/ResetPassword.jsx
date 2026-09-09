import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api, { errorMessage, fieldErrors } from '../api/client'

/**
 * The screen the emailed reset link opens.
 *
 * The token and address ride in the query string, which is where the API's
 * email put them; the reader only supplies the new password.
 */
export default function ResetPassword() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const token = params.get('token') ?? ''
  const email = params.get('email') ?? ''

  const [form, setForm] = useState({ password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState(null)
  const [busy, setBusy] = useState(false)

  const set = (field) => (event) => setForm({ ...form, [field]: event.target.value })

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setErrors({})
    setMessage(null)

    try {
      await api.post('/auth/reset-password', { token, email, ...form })
      navigate('/login', { replace: true, state: { notice: t('auth.resetDone') } })
    } catch (error) {
      setErrors(fieldErrors(error))
      setMessage(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  // Landing here without a link is a dead end, so say so rather than showing a
  // form that cannot succeed.
  if (!token || !email) {
    return (
      <section style={{ maxWidth: 520 }}>
        <h1 className="page-title">{t('auth.resetTitle')}</h1>
        <p className="notice notice--error" role="alert">{t('auth.resetLinkMissing')}</p>
        <div className="row" style={{ marginTop: 'var(--space-6)' }}>
          <Link to="/forgot-password" className="btn btn-primary">{t('actions.requestNewLink')}</Link>
        </div>
      </section>
    )
  }

  return (
    <section style={{ maxWidth: 520 }}>
      <h1 className="page-title">{t('auth.resetTitle')}</h1>
      <p className="justify muted" style={{ margin: 'var(--space-3) 0 var(--space-6)' }}>
        {t('auth.resetBody', { email })}
      </p>

      {message && <p className="notice notice--error" role="alert">{message}</p>}

      <form onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="password">{t('auth.newPassword')}</label>
          <input
            id="password"
            className="input"
            type="password"
            autoComplete="new-password"
            dir="ltr"
            value={form.password}
            onChange={set('password')}
          />
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>

        <div className="field">
          <label htmlFor="password_confirmation">{t('auth.confirmPassword')}</label>
          <input
            id="password_confirmation"
            className="input"
            type="password"
            autoComplete="new-password"
            dir="ltr"
            value={form.password_confirmation}
            onChange={set('password_confirmation')}
          />
          {errors.password_confirmation && <p className="field-error">{errors.password_confirmation}</p>}
        </div>

        {errors.email && <p className="field-error">{errors.email}</p>}

        <div className="row" style={{ marginTop: 'var(--space-6)' }}>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? t('common.loading') : t('actions.resetPassword')}
          </button>
          <Link to="/login" className="btn btn-ghost">{t('actions.backToLogin')}</Link>
        </div>
      </form>
    </section>
  )
}
