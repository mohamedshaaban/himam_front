import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api, { errorMessage, fieldErrors } from '../api/client'

export default function ForgotPassword() {
  const { t } = useTranslation()

  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState(null)
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setErrors({})
    setMessage(null)

    try {
      const { data } = await api.post('/auth/forgot-password', { email })
      // The reply is deliberately the same whether or not the address is
      // registered, so this screen says nothing more than the API does.
      setMessage(data.message)
      setSent(true)
    } catch (error) {
      setErrors(fieldErrors(error))
      setMessage(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section style={{ maxWidth: 520 }}>
      <h1 className="page-title">{t('auth.forgotTitle')}</h1>
      <p className="justify muted" style={{ margin: 'var(--space-3) 0 var(--space-6)' }}>
        {t('auth.forgotBody')}
      </p>

      {message && (
        <p className={`notice notice--${sent ? 'success' : 'error'}`} role="alert">{message}</p>
      )}

      {!sent && (
        <form onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="email">{t('auth.email')}</label>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="email"
              dir="ltr"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div className="row" style={{ marginTop: 'var(--space-6)' }}>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? t('common.loading') : t('actions.sendResetLink')}
            </button>
            <Link to="/login" className="btn btn-ghost">{t('actions.backToLogin')}</Link>
          </div>
        </form>
      )}

      {sent && (
        <div className="row" style={{ marginTop: 'var(--space-6)' }}>
          <Link to="/login" className="btn btn-primary">{t('actions.backToLogin')}</Link>
        </div>
      )}
    </section>
  )
}
