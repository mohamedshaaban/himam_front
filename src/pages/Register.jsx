import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { errorMessage, fieldErrors } from '../api/client'
import { useAuth } from '../context/AuthContext.jsx'

const EMPTY = {
  name: '',
  phone: '',
  email: '',
  city: '',
  password: '',
  password_confirmation: '',
}

export default function Register() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { register } = useAuth()

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

  const fields = [
    { name: 'name', label: t('auth.name'), type: 'text', autoComplete: 'name' },
    { name: 'phone', label: t('auth.phone'), type: 'tel', autoComplete: 'tel', dir: 'ltr' },
    { name: 'email', label: t('auth.email'), type: 'email', autoComplete: 'email', dir: 'ltr' },
    { name: 'city', label: t('auth.city'), type: 'text', autoComplete: 'address-level2' },
    { name: 'password', label: t('auth.password'), type: 'password', autoComplete: 'new-password', dir: 'ltr' },
    { name: 'password_confirmation', label: t('auth.confirmPassword'), type: 'password', autoComplete: 'new-password', dir: 'ltr' },
  ]

  return (
    <section style={{ maxWidth: 720 }}>
      <h1 className="page-title">{t('auth.registerTitle')}</h1>
      <p className="justify muted" style={{ margin: 'var(--space-3) 0 var(--space-6)' }}>{t('auth.registerBody')}</p>

      {message && <p className="notice notice--error" role="alert">{message}</p>}

      <form onSubmit={submit} noValidate>
        <div className="form-grid">
          {fields.map((field) => (
            <div className="field" key={field.name}>
              <label htmlFor={field.name}>{field.label}</label>
              <input
                id={field.name}
                className="input"
                type={field.type}
                autoComplete={field.autoComplete}
                dir={field.dir}
                value={form[field.name]}
                onChange={set(field.name)}
              />
              {errors[field.name] && <p className="field-error">{errors[field.name]}</p>}
            </div>
          ))}
        </div>

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
