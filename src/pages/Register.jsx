import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { errorMessage, fieldErrors } from '../api/client'
import { useAuth } from '../context/AuthContext.jsx'
import useCountries from '../api/useCountries.js'

const GENDERS = ['male', 'female']

const EMPTY = {
  email: '',
  name: '',
  gender: '',
  country: '',
  password: '',
  password_confirmation: '',
  accepts_email: false,
}

export default function Register() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { register } = useAuth()
  const { countries } = useCountries()

  const [form, setForm] = useState(EMPTY)
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
      await register(form)
      navigate('/home', { replace: true })
    } catch (error) {
      setErrors(fieldErrors(error))
      setMessage(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  const error = (field) => errors[field] && <p className="field-error">{errors[field]}</p>

  return (
    <section style={{ maxWidth: 560 }}>
      <h1 className="page-title">{t('auth.registerTitle')}</h1>
      <p className="justify muted" style={{ margin: 'var(--space-3) 0 var(--space-6)' }}>{t('auth.registerBody')}</p>

      {message && <p className="notice notice--error" role="alert">{message}</p>}

      <form onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="email">{t('auth.email')} <span aria-hidden="true">*</span></label>
          <input
            id="email"
            className="input"
            type="email"
            autoComplete="email"
            dir="ltr"
            value={form.email}
            onChange={set('email')}
          />
          {/* Said here rather than after the fact: the programme's messages go
              to this address, and a typo is only discovered when nothing arrives. */}
          <p className="muted" style={{ margin: 'var(--space-1) 0 0', fontSize: 14 }}>{t('auth.emailNotice')}</p>
          {error('email')}
        </div>

        <div className="field">
          <label htmlFor="name">{t('auth.name')} <span aria-hidden="true">*</span></label>
          <input
            id="name"
            className="input"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={set('name')}
          />
          <p className="muted" style={{ margin: 'var(--space-1) 0 0', fontSize: 14 }}>{t('auth.nameHint')}</p>
          {error('name')}
        </div>

        <div className="field">
          <label htmlFor="gender">{t('auth.gender')}</label>
          <select id="gender" className="input" value={form.gender} onChange={set('gender')}>
            <option value="">{t('common.choose')}</option>
            {GENDERS.map((value) => (
              <option key={value} value={value}>{t(`auth.genders.${value}`)}</option>
            ))}
          </select>
          {error('gender')}
        </div>

        <div className="field">
          <label htmlFor="country">{t('auth.country')}</label>
          <select id="country" className="input" value={form.country} onChange={set('country')}>
            <option value="">{t('common.choose')}</option>
            {countries.map((country) => (
              <option key={country.code} value={country.name}>{country.name}</option>
            ))}
          </select>
          {error('country')}
        </div>

        <div className="field">
          <label htmlFor="password">{t('auth.password')} <span aria-hidden="true">*</span></label>
          <input
            id="password"
            className="input"
            type="password"
            autoComplete="new-password"
            dir="ltr"
            value={form.password}
            onChange={set('password')}
          />
          {error('password')}
        </div>

        <div className="field">
          <label htmlFor="password_confirmation">{t('auth.confirmPassword')} <span aria-hidden="true">*</span></label>
          <input
            id="password_confirmation"
            className="input"
            type="password"
            autoComplete="new-password"
            dir="ltr"
            value={form.password_confirmation}
            onChange={set('password_confirmation')}
          />
          {error('password_confirmation')}
        </div>

        <label className="row" style={{ gap: 'var(--space-3)', marginTop: 'var(--space-5)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={form.accepts_email}
            onChange={(event) => setForm({ ...form, accepts_email: event.target.checked })}
          />
          <span>{t('auth.acceptsEmail')}</span>
        </label>

        <div className="row" style={{ marginTop: 'var(--space-6)' }}>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? t('common.loading') : t('actions.createAccount')}
          </button>
          <Link to="/login" className="btn btn-ghost">{t('actions.haveAccount')}</Link>
        </div>
      </form>
    </section>
  )
}
