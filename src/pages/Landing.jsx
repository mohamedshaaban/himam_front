import { Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Slider from '../components/Slider.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Landing() {
  const { t } = useTranslation()
  const { isAuthenticated, loading } = useAuth()

  // A signed-in reader belongs on their own home screen, not the sales page.
  if (!loading && isAuthenticated) return <Navigate to="/home" replace />

  const pillars = ['one', 'two', 'three']

  return (
    <>
      <section
        className="grid-auto"
        style={{
          '--min': '320px',
          alignItems: 'center',
          paddingBottom: 'var(--space-8)',
          borderBottom: '1px solid var(--color-divider)',
          gap: 'var(--space-8)',
        }}
      >
        <div>
          <p className="kicker">{t('app.association')}</p>
          <h1 className="page-title" style={{ fontSize: 'clamp(32px, 4.6vw, 56px)' }}>
            {t('landing.title')}
          </h1>
          <p className="justify muted" style={{ margin: 'var(--space-4) 0 var(--space-6)', maxWidth: '48ch' }}>
            {t('landing.body')}
          </p>
          <div className="row">
            <Link to="/login" className="btn btn-primary">{t('actions.login')}</Link>
            <Link to="/register" className="btn btn-ghost">{t('actions.register')}</Link>
          </div>
        </div>

        <Slider screen="home" />
      </section>

      <section className="grid-auto" style={{ marginTop: 'var(--space-8)' }}>
        {pillars.map((key) => (
          <article key={key} className="card" style={{ padding: 'var(--space-6)' }}>
            <div className="tnum" style={{ fontSize: 15, letterSpacing: '0.16em', color: 'var(--color-accent-700)' }}>
              {t(`landing.pillars.${key}.n`)}
            </div>
            <h2 style={{ margin: 'var(--space-3) 0', fontSize: 26 }}>{t(`landing.pillars.${key}.title`)}</h2>
            <p className="justify muted" style={{ margin: 0 }}>{t(`landing.pillars.${key}.body`)}</p>
          </article>
        ))}
      </section>
    </>
  )
}
