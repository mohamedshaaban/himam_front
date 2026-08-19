import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useLocalizedQuery from '../api/useLocalizedQuery.js'
import Slider from '../components/Slider.jsx'
import QueryState from '../components/PageState.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function BookDetail() {
  const { bookId } = useParams()
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()

  const book = useLocalizedQuery(['book', bookId], `/books/${bookId}`, {
    select: (body) => body.data,
  })

  return (
    <QueryState query={book}>
      {book.data && <Detail book={book.data} t={t} isAuthenticated={isAuthenticated} />}
    </QueryState>
  )
}

function Detail({ book, t, isAuthenticated }) {
  const facts = [
    { k: t('book.factLevel'), v: book.level?.name },
    { k: t('book.factSections'), v: book.sections?.length ?? 0 },
    { k: t('book.factPages'), v: book.pages },
    { k: t('book.factPoints'), v: book.points },
  ]

  return (
    <>
      <Link to="/books" className="btn btn-ghost btn-sm">{t('actions.backToBooks')}</Link>

      <div className="grid-auto" style={{ '--min': '260px', gap: 'var(--space-8)', marginTop: 'var(--space-4)' }}>
        <div style={{ maxWidth: 320 }}>
          <Slider screen="books" height={300} />

          <ul className="list-reset" style={{ marginTop: 'var(--space-4)', display: 'grid', gap: 'var(--space-2)', fontSize: 15 }}>
            {facts.map((fact) => (
              <li
                key={fact.k}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 'var(--space-3)',
                  borderBottom: '1px solid var(--color-divider)',
                  paddingBottom: 'var(--space-2)',
                  color: 'var(--color-neutral-700)',
                }}
              >
                <span>{fact.k}</span>
                <span className="tnum" style={{ color: 'var(--color-text)' }}>{fact.v}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <span className="tag tag-outline">{book.level?.name}</span>
          <h1 className="page-title" style={{ margin: 'var(--space-3) 0 var(--space-2)' }}>{book.title}</h1>
          <p className="muted" style={{ margin: '0 0 var(--space-4)' }}>{book.author ?? t('book.author')}</p>
          <p className="justify muted" style={{ margin: '0 0 var(--space-6)' }}>{book.description}</p>

          <h2 style={{ margin: '0 0 var(--space-3)', fontSize: 26 }}>{t('book.sectionsTitle')}</h2>

          <ol className="rule-list">
            {book.sections?.map((section) => (
              <li key={section.id}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '46px 1fr auto',
                    gap: 'var(--space-4)',
                    alignItems: 'center',
                    padding: 'var(--space-4) 0',
                  }}
                >
                  <span className="tnum" style={{ fontSize: 22, color: 'var(--color-accent-700)' }}>
                    {String(section.position).padStart(2, '0')}
                  </span>

                  <span>
                    <span style={{ display: 'block', fontSize: 21 }}>{section.title}</span>
                    <span style={{ display: 'block', fontSize: 14, color: 'var(--color-neutral-700)' }}>
                      {section.passed ? t('book.statusDone') : t('book.statusTodo')}
                    </span>
                  </span>

                  <span className="row">
                    {isAuthenticated ? (
                      <>
                        <Link to={`/sections/${section.id}`} className="btn btn-primary btn-sm">{t('actions.read')}</Link>
                        <Link to={`/sections/${section.id}/quiz`} className="btn btn-ghost btn-sm">{t('actions.quiz')}</Link>
                      </>
                    ) : (
                      <Link to="/login" className="btn btn-primary btn-sm">{t('actions.login')}</Link>
                    )}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  )
}
