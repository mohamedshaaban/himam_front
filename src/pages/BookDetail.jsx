import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import api from '../api/client'
import useLocalizedQuery from '../api/useLocalizedQuery.js'
import Slider from '../components/Slider.jsx'
import QueryState from '../components/PageState.jsx'
import PdfViewer from '../components/PdfViewer.jsx'
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
  const queryClient = useQueryClient()

  const sections = book.sections ?? []
  const hasSections = sections.length > 0

  // Whether the exam is offered, and what its button says, are set in the
  // dashboard — so a book can be published for reading before its questions
  // are written.
  const button = book.quiz_button ?? { visible: false, label: t('actions.quiz') }

  // Opening a book that is read as one document is what counts as reading it,
  // the same way opening a section does. A book that also has sections is
  // tracked by those, so recording a read against the book as well would mean
  // two answers to how far this reader has got.
  useEffect(() => {
    if (!isAuthenticated || hasSections || !book.pdf) return

    let cancelled = false

    api.post(`/books/${book.id}/read`)
      .then(() => {
        if (!cancelled) queryClient.invalidateQueries({ queryKey: ['books'] })
      })
      .catch(() => {
        // Failing to record the read must not stop the reader reading.
      })

    return () => { cancelled = true }
  }, [isAuthenticated, hasSections, book.id, book.pdf, queryClient])

  const facts = [
    { k: t('book.factLevel'), v: book.level?.name },
    hasSections && { k: t('book.factSections'), v: sections.length },
    { k: t('book.factPages'), v: book.pages },
    { k: t('book.factPoints'), v: book.points },
  ].filter(Boolean)

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

          {/* A book may carry a document of its own, a list of sections, or
              both: the document is then the whole text and the sections are the
              way through it. */}
          {book.pdf && (
            <section style={{ marginBottom: 'var(--space-8)' }}>
              <h2 style={{ margin: '0 0 var(--space-3)', fontSize: 26 }}>{t('book.documentTitle')}</h2>
              {!hasSections && (
                <p className="muted" style={{ margin: '0 0 var(--space-4)', fontSize: 15 }}>
                  {t('book.wholeBookNote')}
                </p>
              )}
              <PdfViewer src={book.pdf} title={book.title} />
            </section>
          )}

          {!book.pdf && !hasSections && (
            <p className="notice">{t('book.noDocument')}</p>
          )}

          {hasSections && (
            <Sections
              sections={sections}
              t={t}
              isAuthenticated={isAuthenticated}
              hasOwnQuiz={book.has_own_quiz}
            />
          )}

          {(button.visible || !isAuthenticated) && (
            <div
              className="row"
              style={{
                marginTop: 'var(--space-8)',
                paddingTop: 'var(--space-4)',
                borderTop: '1px solid var(--color-divider)',
                justifyContent: 'flex-end',
              }}
            >
              {isAuthenticated ? (
                <Link to={`/books/${book.id}/quiz`} className="btn btn-primary">{button.label}</Link>
              ) : (
                <Link to="/login" className="btn btn-primary">{t('actions.login')}</Link>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/**
 * A book read in parts, each part with its own short quiz.
 */
function Sections({ sections, t, isAuthenticated, hasOwnQuiz }) {
  return (
    <>
      <h2 style={{ margin: '0 0 var(--space-3)', fontSize: 26 }}>{t('book.sectionsTitle')}</h2>

      {/* When the exam belongs to the book, the sections are the way through
          the reading rather than five separate examinations. Saying so beats
          leaving a reader to wonder where the quiz buttons went. */}
      {hasOwnQuiz && (
        <p className="muted" style={{ margin: '0 0 var(--space-3)', fontSize: 15 }}>
          {t('book.quizMovedToBook')}
        </p>
      )}

      <ol className="rule-list">
        {sections.map((section) => (
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
                  {/* "Read, then a short quiz" is only true while the section
                      has one of its own. */}
                  {section.passed
                    ? t('book.statusDone')
                    : section.read
                      ? t('book.statusRead')
                      : hasOwnQuiz
                        ? t('book.statusUnread')
                        : t('book.statusTodo')}
                </span>
              </span>

              <span className="row">
                {isAuthenticated ? (
                  <>
                    <Link to={`/sections/${section.id}`} className="btn btn-primary btn-sm">{t('actions.read')}</Link>
                    {!hasOwnQuiz && (
                      <Link to={`/sections/${section.id}/quiz`} className="btn btn-ghost btn-sm">{t('actions.quiz')}</Link>
                    )}
                  </>
                ) : (
                  <Link to="/login" className="btn btn-primary btn-sm">{t('actions.login')}</Link>
                )}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </>
  )
}
