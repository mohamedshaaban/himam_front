import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Slider from '../components/Slider.jsx'

export default function Intro() {
  const { t } = useTranslation()
  const pillars = ['one', 'two', 'three']

  return (
    <>
      <h1 className="page-title">{t('intro.title')}</h1>
      <p className="page-lead">{t('intro.body')}</p>

      <Slider screen="home" />

      <div className="grid-auto" style={{ marginTop: 'var(--space-8)' }}>
        {pillars.map((key) => (
          <article key={key} className="card" style={{ padding: 'var(--space-6)' }}>
            <div className="tnum" style={{ fontSize: 15, letterSpacing: '0.16em', color: 'var(--color-accent-700)' }}>
              {t(`landing.pillars.${key}.n`)}
            </div>
            <h2 style={{ margin: 'var(--space-3) 0', fontSize: 26 }}>{t(`landing.pillars.${key}.title`)}</h2>
            <p className="justify muted" style={{ margin: 0 }}>{t(`landing.pillars.${key}.body`)}</p>
          </article>
        ))}
      </div>

      <div style={{ marginTop: 'var(--space-8)' }}>
        <Link to="/login" className="btn btn-primary">{t('actions.startNow')}</Link>
      </div>
    </>
  )
}
