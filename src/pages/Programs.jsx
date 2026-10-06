import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useLocalizedQuery from '../api/useLocalizedQuery.js'
import QueryState from '../components/PageState.jsx'
import { mediaUrl } from '../api/media'

const TYPE_TONE = { general: 'tag-accent', sequential: 'tag-accent', selective: 'tag' }

export default function Programs() {
  const { t } = useTranslation()

  const programs = useLocalizedQuery(['programs'], '/programs', { select: (body) => body.data })

  return (
    <>
      <h1 className="page-title">{t('programs.title')}</h1>
      <p className="page-lead">{t('programs.lead')}</p>

      <QueryState query={programs} empty={programs.data?.length === 0 ? t('programs.empty') : false}>
        <div className="grid-auto" style={{ '--min': '300px' }}>
          {programs.data?.map((program) => (
            <article key={program.id} className="card" style={{ padding: 'var(--space-5)', gap: 'var(--space-3)' }}>
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                <span className={TYPE_TONE[program.type] ?? 'tag'}>{t(`programs.types.${program.type}`)}</span>
                {program.enrolled && <span className="tag">{t('programs.joined')}</span>}
              </div>

              {program.cover && (
                <div className="plate" style={{ aspectRatio: '16 / 9', overflow: 'hidden' }}>
                  <img src={mediaUrl(program.cover)} alt="" style={{ width: '100%', objectFit: 'cover' }} />
                </div>
              )}

              <h2 style={{ margin: 0, fontSize: 22 }}>{program.title}</h2>

              {program.description && (
                <p className="justify muted" style={{ margin: 0, fontSize: 15 }}>{program.description}</p>
              )}

              <ProgressBar percent={program.percent} />

              <p className="muted tnum" style={{ margin: 0, fontSize: 14 }}>
                {t('programs.booksProgress', { done: program.books_completed, total: program.books_count })}
                {' · '}
                {program.percent}%
              </p>

              <Link to={`/programs/${program.id}`} className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}>
                {t('programs.open')}
              </Link>
            </article>
          ))}
        </div>
      </QueryState>
    </>
  )
}

export function ProgressBar({ percent }) {
  return (
    <div
      style={{ height: 8, borderRadius: 999, background: 'var(--color-neutral-200)', overflow: 'hidden' }}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div style={{ width: `${percent}%`, height: '100%', background: 'var(--color-accent-700)' }} />
    </div>
  )
}
