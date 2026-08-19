import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useLocalizedQuery from '../api/useLocalizedQuery.js'
import QueryState, { EmptyState } from '../components/PageState.jsx'

export default function Progress() {
  const { t, i18n } = useTranslation()

  const progress = useLocalizedQuery(['progress'], '/progress')
  const data = progress.data

  return (
    <QueryState query={progress}>
      {data && (
        <>
          <h1 className="page-title">{t('progress.title')}</h1>
          <p className="page-lead">{t('progress.body')}</p>

          <Summary data={data} t={t} />
          <MonthlyPoints months={data.monthly_points} t={t} />
          <Levels levels={data.levels} t={t} />
          <NextBadges badges={data.next_badges} t={t} />
          <RecentAttempts attempts={data.recent_attempts} t={t} locale={i18n.language} />
        </>
      )}
    </QueryState>
  )
}

function Summary({ data, t }) {
  const { stats, levels } = data
  const overall = stats.sections_total > 0
    ? Math.round((stats.sections_passed / stats.sections_total) * 100)
    : 0
  const levelsCompleted = levels.filter((level) => level.sections_total > 0 && level.percent === 100).length

  const figures = [
    { value: `${stats.sections_passed}/${stats.sections_total}`, label: t('progress.sectionsPassed') },
    { value: `${stats.books_completed}/${stats.books_total}`, label: t('progress.booksCompleted') },
    { value: `${levelsCompleted}/${levels.length}`, label: t('progress.levelsCompleted') },
    { value: stats.points, label: t('home.points'), accent: true },
    { value: stats.badges_earned, label: t('home.badges') },
    { value: stats.certificates, label: t('home.certificates') },
  ]

  return (
    <section
      style={{
        paddingBottom: 'var(--space-6)',
        borderBottom: '1px solid var(--color-divider)',
        marginBottom: 'var(--space-8)',
      }}
    >
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>{t('progress.overall')}</h2>
        <span className="tnum" style={{ fontSize: 34, color: 'var(--color-accent-700)' }}>{overall}%</span>
      </div>

      <div className="progress progress--lg" style={{ margin: 'var(--space-3) 0 var(--space-6)' }}>
        <div className="progress__fill" style={{ width: `${overall}%` }} />
      </div>

      <div className="grid-auto" style={{ '--min': '150px', gap: 'var(--space-3)' }}>
        {figures.map((figure) => (
          <div key={figure.label} className="card stat-card">
            <div className={`stat-card__value${figure.accent ? '' : ' stat-card__value--plain'}`}>{figure.value}</div>
            <div className="stat-card__label">{figure.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function MonthlyPoints({ months, t }) {
  const peak = Math.max(...months.map((month) => month.points), 1)

  return (
    <section style={{ marginBottom: 'var(--space-8)' }}>
      <h2 style={{ margin: '0 0 var(--space-4)', fontSize: 22 }}>{t('progress.pointsByMonth')}</h2>

      <div className="spark-scroll">
        <div className="spark">
          {months.map((month) => (
            <div className="spark__col" key={month.month} title={`${month.month}: ${month.points}`}>
              <span className="spark__value tnum">{month.points > 0 ? month.points : ''}</span>
              <div
                className={`spark__bar${month.points === 0 ? ' spark__bar--empty' : ''}`}
                style={{ height: `${Math.max(2, (month.points / peak) * 100)}%` }}
              />
              <span className="spark__label">{month.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Levels({ levels, t }) {
  return (
    <section style={{ marginBottom: 'var(--space-8)' }}>
      <h2 style={{ margin: '0 0 var(--space-4)', fontSize: 22 }}>{t('progress.levels')}</h2>

      <div className="stack">
        {levels.map((level) => (
          <article key={level.id} className="panel">
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 style={{ margin: 0, fontSize: 24 }}>{level.name}</h3>
              <span className="row" style={{ gap: 'var(--space-3)' }}>
                {level.certificate && (
                  <span className="tag tag-accent" dir="ltr">
                    {t('progress.certificateEarned', { serial: level.certificate.serial })}
                  </span>
                )}
                <span className="tnum" style={{ color: 'var(--color-accent-700)' }}>{level.percent}%</span>
              </span>
            </div>

            <div className="progress" style={{ margin: 'var(--space-2) 0 var(--space-4)' }}>
              <div className="progress__fill" style={{ width: `${level.percent}%` }} />
            </div>

            {level.books.map((book) => (
              <div key={book.id} className="book-progress">
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Link to={`/books/${book.id}`} style={{ fontSize: 19, textDecoration: 'none' }}>
                    {book.title}
                  </Link>
                  <span className="tnum muted" style={{ fontSize: 14 }}>
                    {book.sections_passed}/{book.sections_total}
                  </span>
                </div>

                <ol className="section-track">
                  {book.sections.map((section) => (
                    <li key={section.id}>
                      <Link
                        to={`/sections/${section.id}`}
                        className={`section-chip${
                          section.passed ? ' section-chip--passed' : section.read ? ' section-chip--read' : ''
                        }`}
                        title={section.title}
                      >
                        <span className="section-chip__no tnum">
                          {String(section.position).padStart(2, '0')}
                        </span>
                        <span className="section-chip__title">{section.title}</span>
                        <span className="section-chip__state">
                          {section.passed
                            ? t('progress.sectionPassed')
                            : section.read
                              ? t('progress.sectionRead')
                              : t('progress.sectionTodo')}
                          {section.attempts > 0 && (
                            <span className="tnum">
                              {' · '}
                              {t('progress.bestScore', { score: `${section.best_score}/${section.questions}` })}
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </article>
        ))}
      </div>
    </section>
  )
}

function NextBadges({ badges, t }) {
  if (!badges?.length) return null

  return (
    <section style={{ marginBottom: 'var(--space-8)' }}>
      <h2 style={{ margin: '0 0 var(--space-4)', fontSize: 22 }}>{t('progress.nextBadges')}</h2>

      <div className="grid-auto" style={{ '--min': '240px' }}>
        {badges.map((badge) => (
          <div key={badge.id} className="card" style={{ padding: 'var(--space-4)' }}>
            <div className="row" style={{ flexWrap: 'nowrap', gap: 'var(--space-3)' }}>
              <img
                src={badge.image || '/assets/badge.png'}
                alt=""
                style={{ height: 48, filter: 'grayscale(1)', opacity: 0.6 }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 18 }}>{badge.name}</div>
                <div className="muted tnum" style={{ fontSize: 14 }}>
                  {badge.current} / {badge.criteria_value} · {t('progress.remaining', { count: badge.remaining })}
                </div>
              </div>
            </div>

            <div className="progress" style={{ marginTop: 'var(--space-3)' }}>
              <div className="progress__fill" style={{ width: `${badge.percent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function RecentAttempts({ attempts, t, locale }) {
  return (
    <section>
      <h2 style={{ margin: '0 0 var(--space-4)', fontSize: 22 }}>{t('progress.recentActivity')}</h2>

      {attempts.length === 0 ? (
        <EmptyState message={t('progress.noActivity')} />
      ) : (
        <div className="table-wrap">
          <table className="table" style={{ minWidth: 560 }}>
            <thead>
              <tr>
                <th>{t('admin.fields.title')}</th>
                <th>{t('progress.result')}</th>
                <th>{t('home.points')}</th>
                <th>{t('progress.when')}</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt) => (
                <tr key={attempt.id}>
                  <td>
                    <span style={{ display: 'block' }}>{attempt.section.title}</span>
                    <span className="muted" style={{ fontSize: 14 }}>{attempt.book.title}</span>
                  </td>
                  <td>
                    <span className={`tag ${attempt.passed ? 'tag-accent' : 'tag-neutral'}`}>
                      <span className="tnum">{attempt.score}/{attempt.total}</span>
                      {' · '}
                      {attempt.passed ? t('progress.passed') : t('progress.failed')}
                    </span>
                  </td>
                  <td className="tnum">{attempt.points_awarded > 0 ? `+${attempt.points_awarded}` : '—'}</td>
                  <td className="muted" style={{ whiteSpace: 'nowrap' }}>
                    {new Date(attempt.created_at).toLocaleDateString(locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
