import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useLocalizedQuery from '../api/useLocalizedQuery.js'
import Slider from '../components/Slider.jsx'
import QueryState from '../components/PageState.jsx'

export default function Books() {
  const { t } = useTranslation()
  const [levelId, setLevelId] = useState('')

  const levels = useLocalizedQuery(['levels'], '/levels', { select: (body) => body.data })

  const books = useLocalizedQuery(['books', levelId], '/books', {
    params: levelId ? { level_id: levelId } : undefined,
    select: (body) => body.data,
  })

  return (
    <>
      <h1 className="page-title">{t('books.title')}</h1>
      <p className="page-lead">{t('books.body')}</p>

      <div style={{ marginBottom: 'var(--space-8)' }}>
        <Slider screen="books" />
      </div>

      {levels.data?.length > 0 && (
        <div className="field" style={{ maxWidth: 280, marginBottom: 'var(--space-6)' }}>
          <label htmlFor="level">{t('book.factLevel')}</label>
          <select id="level" className="select" value={levelId} onChange={(e) => setLevelId(e.target.value)}>
            <option value="">{t('books.allLevels')}</option>
            {levels.data.map((level) => (
              <option key={level.id} value={level.id}>{level.name}</option>
            ))}
          </select>
        </div>
      )}

      <QueryState query={books} empty={books.data?.length === 0 ? t('books.empty') : false}>
        <div className="grid-auto">
          {books.data?.map((book) => (
            <article key={book.id} className="card" style={{ padding: 'var(--space-4)', gap: 'var(--space-3)' }}>
              <div
                className="plate"
                style={{
                  aspectRatio: '3 / 4',
                  background: 'repeating-linear-gradient(135deg, var(--color-neutral-200) 0 7px, var(--color-neutral-100) 7px 14px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {book.cover
                  ? <img src={book.cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, color: 'var(--color-neutral-700)' }}>cover</span>}
              </div>

              <span className="tag tag-outline" style={{ justifySelf: 'start' }}>{book.level?.name}</span>
              <h2 style={{ margin: 0, fontSize: 24 }}>{book.title}</h2>
              <p className="muted" style={{ margin: 0, fontSize: 15 }}>
                {t('books.sectionsCount', { count: book.sections_count })} — {t('books.pagesCount', { count: book.pages })}
              </p>

              {book.progress && book.progress.sections_total > 0 && (
                <div>
                  <div className="progress" aria-hidden="true">
                    <div className="progress__fill" style={{ width: `${book.progress.percent}%` }} />
                  </div>
                  <p className="muted" style={{ margin: '6px 0 0', fontSize: 13 }}>
                    {t('book.progress', { done: book.progress.sections_passed, total: book.progress.sections_total })}
                  </p>
                </div>
              )}

              <Link to={`/books/${book.id}`} className="btn btn-primary">{t('actions.openBook')}</Link>
            </article>
          ))}
        </div>
      </QueryState>
    </>
  )
}
