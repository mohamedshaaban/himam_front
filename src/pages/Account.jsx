import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api, { errorMessage, fieldErrors } from '../api/client'
import Slider from '../components/Slider.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { LOCALES, localeCodes } from '../i18n'

export default function Account() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user, setUser, logout } = useAuth()

  const [profile, setProfile] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    city: user?.city ?? '',
    locale: user?.locale ?? i18n.language,
  })
  const [passwords, setPasswords] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState(null)
  const [busy, setBusy] = useState(false)

  const saveProfile = async (event) => {
    event.preventDefault()
    setBusy(true)
    setErrors({})
    setNotice(null)

    try {
      const { data } = await api.put('/profile', profile)
      setUser(data.data)
      if (profile.locale !== i18n.language) await i18n.changeLanguage(profile.locale)
      setNotice({ type: 'success', text: t('account.profileUpdated') })
    } catch (error) {
      setErrors(fieldErrors(error))
      setNotice({ type: 'error', text: errorMessage(error) })
    } finally {
      setBusy(false)
    }
  }

  const savePassword = async (event) => {
    event.preventDefault()
    setBusy(true)
    setErrors({})
    setNotice(null)

    try {
      await api.put('/profile/password', passwords)
      setPasswords({ current_password: '', password: '', password_confirmation: '' })
      setNotice({ type: 'success', text: t('account.passwordUpdated') })
    } catch (error) {
      setErrors(fieldErrors(error))
      setNotice({ type: 'error', text: errorMessage(error) })
    } finally {
      setBusy(false)
    }
  }

  const signOut = async () => {
    await logout()
    navigate('/')
  }

  const rows = [
    t('account.settings'),
    t('account.appSettings'),
    t('account.about'),
    t('account.faq'),
    t('account.privacy'),
  ]

  return (
    <section className="grid-auto" style={{ '--min': '280px', gap: 'var(--space-8)' }}>
      <div className="card" style={{ padding: 'var(--space-6)', alignSelf: 'start', textAlign: 'center' }}>
        <img
          src={user?.avatar || '/assets/avatar-2.svg'}
          alt=""
          style={{ width: 96, height: 96, borderRadius: '50%', margin: '0 auto var(--space-3)' }}
        />
        <h2 style={{ margin: 0, fontSize: 26 }}>{user?.name}</h2>
        <p className="muted" style={{ margin: 'var(--space-2) 0 var(--space-4)', fontSize: 15 }} dir="ltr">
          {user?.email}
        </p>

        <div className="tnum" style={{ fontSize: 32, color: 'var(--color-accent-700)' }}>{user?.points ?? 0}</div>
        <div className="muted" style={{ fontSize: 14 }}>{t('home.points')}</div>

        <div style={{ marginTop: 'var(--space-6)' }}>
          <Slider screen="account" height={220} />
        </div>
      </div>

      <div>
        <h1 className="page-title" style={{ marginBottom: 'var(--space-4)' }}>{t('account.title')}</h1>

        {notice && (
          <p className={`notice notice--${notice.type}`} role="status">{notice.text}</p>
        )}

        <form onSubmit={saveProfile} className="panel" style={{ marginBottom: 'var(--space-6)' }}>
          <h2 style={{ margin: '0 0 var(--space-3)', fontSize: 22 }}>{t('account.profile')}</h2>

          <div className="form-grid">
            <Field id="name" label={t('auth.name')} value={profile.name} error={errors.name}
              onChange={(v) => setProfile({ ...profile, name: v })} />
            <Field id="email" label={t('auth.email')} type="email" dir="ltr" value={profile.email} error={errors.email}
              onChange={(v) => setProfile({ ...profile, email: v })} />
            <Field id="phone" label={t('auth.phone')} type="tel" dir="ltr" value={profile.phone} error={errors.phone}
              onChange={(v) => setProfile({ ...profile, phone: v })} />
            <Field id="city" label={t('auth.city')} value={profile.city} error={errors.city}
              onChange={(v) => setProfile({ ...profile, city: v })} />

            <div className="field">
              <label htmlFor="locale">{t('account.language')}</label>
              <select
                id="locale"
                className="select"
                value={profile.locale}
                onChange={(e) => setProfile({ ...profile, locale: e.target.value })}
              >
                {localeCodes.map((code) => (
                  <option key={code} value={code}>{LOCALES[code].name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-4)' }}>
            <button type="submit" className="btn btn-primary" disabled={busy}>{t('actions.save')}</button>
          </div>
        </form>

        <form onSubmit={savePassword} className="panel" style={{ marginBottom: 'var(--space-6)' }}>
          <h2 style={{ margin: '0 0 var(--space-3)', fontSize: 22 }}>{t('account.changePassword')}</h2>

          <div className="form-grid">
            <Field id="current_password" label={t('account.currentPassword')} type="password" dir="ltr"
              value={passwords.current_password} error={errors.current_password}
              onChange={(v) => setPasswords({ ...passwords, current_password: v })} />
            <Field id="new_password" label={t('account.newPassword')} type="password" dir="ltr"
              value={passwords.password} error={errors.password}
              onChange={(v) => setPasswords({ ...passwords, password: v })} />
            <Field id="confirm_password" label={t('auth.confirmPassword')} type="password" dir="ltr"
              value={passwords.password_confirmation}
              onChange={(v) => setPasswords({ ...passwords, password_confirmation: v })} />
          </div>

          <div style={{ marginTop: 'var(--space-4)' }}>
            <button type="submit" className="btn btn-primary" disabled={busy}>{t('actions.save')}</button>
          </div>
        </form>

        <ul className="rule-list">
          {rows.map((row) => (
            <li key={row}>
              <button type="button" className="row-button">
                <span>{row}</span>
                <span className="chev">›</span>
              </button>
            </li>
          ))}
        </ul>

        <p className="justify muted" style={{ margin: 'var(--space-4) 0 0', fontSize: 14 }}>{t('account.note')}</p>

        <div style={{ marginTop: 'var(--space-6)' }}>
          <button type="button" className="btn btn-ghost" onClick={signOut}>{t('actions.logout')}</button>
        </div>
      </div>
    </section>
  )
}

function Field({ id, label, value, onChange, type = 'text', dir, error }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        className="input"
        type={type}
        dir={dir}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}
