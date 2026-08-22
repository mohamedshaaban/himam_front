import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/client'
import QueryState from '../../components/PageState.jsx'
import AdminPage from '../components/AdminPage.jsx'

export default function Dashboard() {
  const { t } = useTranslation()

  const stats = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => (await api.get('/admin/stats')).data,
  })

  const data = stats.data

  return (
    <AdminPage title={t('admin.nav.dashboard')}>
      <QueryState query={stats}>
        {data && (
          <>
            <div className="row g-3">
              <Box value={data.totals.users} label={t('admin.stats.users')} theme="primary" to="/admin/users"
                icon="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 20a8 8 0 0 1 16 0" />
              <Box value={data.totals.books} label={t('admin.stats.books')} theme="success" to="/admin/books"
                icon="M4 4h9a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z" />
              <Box value={data.totals.sections} label={t('admin.stats.sections')} theme="warning"
                icon="M4 19h16M4 14h16M4 9h16M4 4h16" />
              <Box value={data.totals.certificates} label={t('admin.stats.certificates')} theme="danger" to="/admin/certificates"
                icon="M6 3h12v13l-6-3-6 3z M9 19h6" />
            </div>

            <div className="row g-3 mt-1">
              <Mini value={data.quizzes.attempts} label={t('admin.stats.attempts')} />
              <Mini value={data.quizzes.passed} label={t('admin.stats.passed')} />
              <Mini value={data.quizzes.attempts_this_month} label={t('admin.stats.attemptsThisMonth')} />
              <Mini value={data.quizzes.points_awarded} label={t('admin.stats.pointsAwarded')} />
              <Mini value={data.signups_last_7_days} label={t('admin.stats.signups')} />
            </div>

            <div className="row g-3 mt-1">
              <div className="col-lg-5">
                <div className="card h-100">
                  <div className="card-header">
                    <h3 className="card-title">{t('admin.stats.topReaders')}</h3>
                  </div>
                  <div className="card-body p-0">
                    <ul className="list-group list-group-flush">
                      {data.top_readers.map((reader, index) => (
                        <li className="list-group-item d-flex align-items-center gap-2" key={reader.id}>
                          <span className="badge text-bg-secondary">{index + 1}</span>
                          <img
                            src={reader.avatar || '/assets/avatar-1.svg'}
                            alt=""
                            className="rounded-circle"
                            style={{ width: 32, height: 32 }}
                          />
                          <span className="flex-grow-1 text-truncate">{reader.name}</span>
                          <strong>{reader.points}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="col-lg-7">
                <div className="card h-100">
                  <div className="card-header">
                    <h3 className="card-title">{t('admin.stats.recentActivity')}</h3>
                  </div>
                  <div className="card-body p-0 table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <tbody>
                        {data.recent_attempts.map((attempt) => (
                          <tr key={attempt.id}>
                            <td>{attempt.user?.name}</td>
                            <td className="text-nowrap">{attempt.score} / {attempt.total}</td>
                            <td>
                              <span className={`badge ${attempt.passed ? 'text-bg-success' : 'text-bg-secondary'}`}>
                                {attempt.passed ? t('admin.stats.passed') : t('common.no')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </QueryState>
    </AdminPage>
  )
}

function Box({ value, label, theme, icon, to }) {
  const body = (
    <div className={`small-box text-bg-${theme}`}>
      <div className="inner">
        <h3>{value}</h3>
        <p>{label}</p>
      </div>
      <svg className="small-box-icon" width="56" height="56" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={icon} />
      </svg>
    </div>
  )

  return (
    <div className="col-6 col-lg-3">
      {to ? <Link to={to} className="text-decoration-none">{body}</Link> : body}
    </div>
  )
}

function Mini({ value, label }) {
  return (
    <div className="col-6 col-md-4 col-xl">
      <div className="info-box">
        <div className="info-box-content">
          <span className="info-box-text">{label}</span>
          <span className="info-box-number">{value}</span>
        </div>
      </div>
    </div>
  )
}
