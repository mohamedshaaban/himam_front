import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/client'
import QueryState from '../../components/PageState.jsx'

export default function Dashboard() {
  const { t } = useTranslation()

  const stats = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => (await api.get('/admin/stats')).data,
  })

  const data = stats.data

  return (
    <>
      <div className="admin-head">
        <h1>{t('admin.nav.dashboard')}</h1>
      </div>

      <QueryState query={stats}>
        {data && (
          <>
            <div className="stat-grid">
              <Stat value={data.totals.users} label={t('admin.stats.users')} />
              <Stat value={data.totals.books} label={t('admin.stats.books')} />
              <Stat value={data.totals.sections} label={t('admin.stats.sections')} />
              <Stat value={data.totals.certificates} label={t('admin.stats.certificates')} />
              <Stat value={data.quizzes.attempts} label={t('admin.stats.attempts')} />
              <Stat value={data.quizzes.passed} label={t('admin.stats.passed')} />
              <Stat value={data.quizzes.attempts_this_month} label={t('admin.stats.attemptsThisMonth')} />
              <Stat value={data.quizzes.points_awarded} label={t('admin.stats.pointsAwarded')} />
              <Stat value={data.signups_last_7_days} label={t('admin.stats.signups')} />
            </div>

            <div className="grid-auto" style={{ '--min': '320px', marginTop: 'var(--space-6)' }}>
              <section className="panel">
                <h2 style={{ margin: '0 0 var(--space-3)', fontSize: 22 }}>{t('admin.stats.topReaders')}</h2>
                <ol className="honor-list">
                  {data.top_readers.map((reader, index) => (
                    <li key={reader.id}>
                      <span className="honor-list__rank">{index + 1}</span>
                      <img src={reader.avatar || '/assets/avatar-1.svg'} alt="" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                      <span>{reader.name}</span>
                      <span className="tnum muted">{reader.points}</span>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="panel">
                <h2 style={{ margin: '0 0 var(--space-3)', fontSize: 22 }}>{t('admin.stats.recentActivity')}</h2>
                <div className="table-wrap">
                  <table className="table">
                    <tbody>
                      {data.recent_attempts.map((attempt) => (
                        <tr key={attempt.id}>
                          <td>{attempt.user?.name}</td>
                          <td className="tnum">{attempt.score} / {attempt.total}</td>
                          <td>
                            <span className={`tag ${attempt.passed ? 'tag-accent' : 'tag-neutral'}`}>
                              {attempt.passed ? t('admin.stats.passed') : t('common.no')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </>
        )}
      </QueryState>
    </>
  )
}

function Stat({ value, label }) {
  return (
    <div className="card stat-card">
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  )
}
