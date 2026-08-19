import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useLocalizedQuery from '../api/useLocalizedQuery.js'
import Slider from '../components/Slider.jsx'
import QueryState from '../components/PageState.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Home() {
  const { t } = useTranslation()
  const { user } = useAuth()

  const dashboard = useLocalizedQuery(['dashboard'], '/dashboard')

  return (
    <QueryState query={dashboard}>
      {dashboard.data && <Dashboard data={dashboard.data} user={user} t={t} />}
    </QueryState>
  )
}

function Dashboard({ data, user, t }) {
  const { stats, badges, certificates, honor_board: honor } = data

  const figures = [
    { value: stats.points, label: t('home.points'), accent: true },
    { value: stats.badges_earned, label: t('home.badges') },
    { value: stats.certificates, label: t('home.certificates') },
  ]

  const cards = [
    { value: stats.sections_passed, top: t('home.sectionsPassed'), unit: t('home.outOf', { total: stats.sections_total }) },
    { value: stats.books_completed, top: t('home.booksCompleted'), unit: t('home.outOf', { total: stats.books_total }) },
    { value: stats.points, top: t('home.totalPoints'), unit: t('home.unit.point') },
  ]

  return (
    <>
      <section style={{ marginBottom: 'var(--space-8)' }}>
        <Slider screen="home" />
      </section>

      <section
        className="grid-auto"
        style={{
          '--min': '300px',
          alignItems: 'end',
          paddingBottom: 'var(--space-6)',
          borderBottom: '1px solid var(--color-divider)',
          gap: 'var(--space-8)',
        }}
      >
        <div>
          <p className="kicker">{t('home.welcome')}</p>
          <h1 className="page-title" style={{ fontSize: 'clamp(34px, 4.4vw, 54px)' }}>{user?.name}</h1>
          <p className="justify muted" style={{ margin: 'var(--space-3) 0 0', maxWidth: '46ch' }}>
            {t('home.subtitle')}
          </p>
        </div>

        <div className="row" style={{ justifyContent: 'flex-end', gap: 'var(--space-6)' }}>
          {figures.map((figure, index) => (
            <div key={figure.label} className="row" style={{ gap: 'var(--space-6)' }}>
              {index > 0 && <div className="figure-divider" style={{ alignSelf: 'stretch' }} />}
              <div className="figure-stat">
                <div className={`figure-stat__value${figure.accent ? ' figure-stat__value--accent' : ''}`}>
                  {figure.value}
                </div>
                <div className="figure-stat__label">{figure.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 'var(--space-8)' }}>
        <h2 style={{ margin: '0 0 var(--space-4)', fontSize: 26 }}>{t('home.statsTitle')}</h2>
        <div className="grid-auto" style={{ '--min': '220px' }}>
          {cards.map((card) => (
            <div key={card.top} className="card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: 'var(--color-neutral-700)' }}>{card.top}</div>
              <div className="tnum" style={{ fontSize: 46, lineHeight: 1, color: 'var(--color-accent-700)' }}>
                {card.value}
              </div>
              <div style={{ fontSize: 14, color: 'var(--color-neutral-700)' }}>{card.unit}</div>
            </div>
          ))}
        </div>
      </section>

      <section
        className="grid-auto"
        style={{
          '--min': '320px',
          marginTop: 'var(--space-8)',
          paddingTop: 'var(--space-8)',
          borderTop: '1px solid var(--color-divider)',
          gap: 'var(--space-8)',
        }}
      >
        <div>
          <div className="section-head">
            <h2>{t('certificates.title')}</h2>
            <Link to="/certificates" className="btn btn-ghost btn-sm">{t('actions.viewAll')}</Link>
          </div>

          {certificates.length > 0 ? (
            <div
              className="card"
              style={{
                padding: 'var(--space-4)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                gap: 'var(--space-4)',
                alignItems: 'center',
              }}
            >
              <div className="plate"><img src="/assets/certificate.png" alt="" /></div>
              <div>
                <h3 style={{ margin: '0 0 var(--space-2)', fontSize: 22 }}>
                  {certificates[0].title ?? t('certificates.certificateTitle')}
                </h3>
                <p className="muted" style={{ margin: 0, fontSize: 15 }}>
                  {t('certificates.date')} {certificates[0].issued_at}
                </p>
                <p className="muted" style={{ margin: 0, fontSize: 15 }} dir="ltr">
                  {certificates[0].serial}
                </p>
              </div>
              <img src="/assets/qr.png" alt="QR" style={{ width: 96, height: 96, border: '1px solid var(--color-divider)' }} />
            </div>
          ) : (
            <p className="muted">{t('certificates.empty')}</p>
          )}

          <div style={{ marginTop: 'var(--space-8)' }}>
            <div className="section-head">
              <h2>{t('badges.title')}</h2>
              <Link to="/badges" className="btn btn-ghost btn-sm">{t('actions.viewAll')}</Link>
            </div>

            {badges.length > 0 ? (
              <div className="grid-auto" style={{ '--min': '140px' }}>
                {badges.map((badge) => (
                  <div key={badge.id} className="card badge-tile">
                    <img src={badge.image || '/assets/badge.png'} alt="" style={{ height: 68 }} />
                    <div>{badge.name}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">{t('common.empty')}</p>
            )}
          </div>
        </div>

        <aside>
          <div className="section-head">
            <h2>{t('honor.title')}</h2>
            <Link to="/honor" className="btn btn-ghost btn-sm">{t('actions.viewAll')}</Link>
          </div>

          <ol className="honor-list">
            {honor.map((row) => (
              <li key={row.id}>
                <span className="honor-list__rank">{row.rank}</span>
                <img src={row.avatar || '/assets/avatar-1.svg'} alt="" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                <span style={{ fontSize: 16 }}>{row.name}</span>
                <span className="tnum muted">{row.points}</span>
              </li>
            ))}
          </ol>

          <p className="justify muted" style={{ margin: 'var(--space-4) 0 0', fontSize: 14 }}>
            {t('home.honorNote')}
          </p>
        </aside>
      </section>
    </>
  )
}
