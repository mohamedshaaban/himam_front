import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { errorMessage, fieldErrors } from '../api/client'
import { useAuth } from '../context/AuthContext.jsx'
import { countryOptions } from '../data/countries.js'

const GENDERS = ['male', 'female']
const AGE_BANDS = ['under_21', '21_30', '31_45', 'over_46']
const EDUCATION_LEVELS = [
  'primary', 'intermediate', 'secondary', 'diploma',
  'bachelor', 'master', 'doctorate', 'other',
]

const EMPTY = {
  name: '',
  gender: '',
  age_band: '',
  email: '',
  education_level: '',
  password: '',
  password_confirmation: '',
  country: '',
  whatsapp: '',
  accepts_email: false,
}

export default function Register() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { register } = useAuth()

  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState(null)
  const [busy, setBusy] = useState(false)

  // Rebuilt on a language change so the names follow the interface.
  const countries = useMemo(() => countryOptions(i18n.language), [i18n.language])

  const set = (field) => (event) => setForm({ ...form, [field]: event.target.value })
  const patch = (changes) => setForm((current) => ({ ...current, ...changes }))

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
    <section style={{ maxWidth: 720 }}>
      <h1 className="page-title">{t('auth.registerTitle')}</h1>
      <p className="justify muted" style={{ margin: 'var(--space-3) 0 var(--space-6)' }}>{t('auth.registerBody')}</p>

      {message && <p className="notice notice--error" role="alert">{message}</p>}

      <form onSubmit={submit} noValidate>
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
          {/* The certificate is printed from this, so it is worth saying so. */}
          <p className="muted" style={{ margin: 'var(--space-1) 0 0', fontSize: 14 }}>{t('auth.nameHint')}</p>
          {error('name')}
        </div>

        <fieldset className="field" style={{ border: 0, padding: 0, margin: '0 0 var(--space-4)' }}>
          <legend style={{ padding: 0 }}>{t('auth.gender')}</legend>
          <div className="row" style={{ gap: 'var(--space-5)', flexWrap: 'wrap' }}>
            {GENDERS.map((value) => (
              <label key={value} className="row" style={{ gap: 'var(--space-2)', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="gender"
                  value={value}
                  checked={form.gender === value}
                  onChange={set('gender')}
                />
                {t(`auth.genders.${value}`)}
              </label>
            ))}
          </div>
          {error('gender')}
        </fieldset>

        <fieldset className="field" style={{ border: 0, padding: 0, margin: '0 0 var(--space-4)' }}>
          <legend style={{ padding: 0 }}>{t('auth.ageBand')}</legend>
          <div className="row" style={{ gap: 'var(--space-5)', flexWrap: 'wrap' }}>
            {AGE_BANDS.map((value) => (
              <label key={value} className="row" style={{ gap: 'var(--space-2)', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="age_band"
                  value={value}
                  checked={form.age_band === value}
                  onChange={set('age_band')}
                />
                {t(`auth.ageBands.${value}`)}
              </label>
            ))}
          </div>
          {error('age_band')}
        </fieldset>

        <div className="form-grid">
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
            {error('email')}
          </div>

          <div className="field">
            <label htmlFor="education_level">{t('auth.educationLevel')}</label>
            <select
              id="education_level"
              className="input"
              value={form.education_level}
              onChange={set('education_level')}
            >
              <option value="">{t('common.choose')}</option>
              {EDUCATION_LEVELS.map((value) => (
                <option key={value} value={value}>{t(`auth.educationLevels.${value}`)}</option>
              ))}
            </select>
            {error('education_level')}
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
            <label htmlFor="whatsapp">{t('auth.whatsapp')}</label>
            <input
              id="whatsapp"
              className="input"
              type="tel"
              autoComplete="tel"
              dir="ltr"
              placeholder="+965…"
              value={form.whatsapp}
              onChange={set('whatsapp')}
            />
            <p className="muted" style={{ margin: 'var(--space-1) 0 0', fontSize: 14 }}>{t('auth.whatsappHint')}</p>
            {error('whatsapp')}
          </div>
        </div>

        <label className="row" style={{ gap: 'var(--space-3)', marginTop: 'var(--space-5)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={form.accepts_email}
            onChange={(event) => patch({ accepts_email: event.target.checked })}
          />
          <span>{t('auth.acceptsEmail')}</span>
        </label>

        <p className="muted" style={{ margin: 'var(--space-2) 0 0', fontSize: 14 }}>{t('auth.emailNotice')}</p>

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
