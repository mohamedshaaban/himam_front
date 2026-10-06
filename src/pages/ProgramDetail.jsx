import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api, { errorMessage } from '../api/client'
import useLocalizedQuery from '../api/useLocalizedQuery.js'
import QueryState from '../components/PageState.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { ProgressBar } from './Programs.jsx'

export default function ProgramDetail() {
  const { programId } = useParams()
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const program = useLocalizedQuery(['program', programId], `/programs/${programId}`, {
    select: (body) => body.data,
  })

  const data = program.data

  const enrolment = useMutation({
    mutationFn: async (join) =>
      join
        ? api.post(`/programs/${programId}/enroll`)
        : api.delete(`/programs/${programId}/enroll`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program', programId] })
      queryClient.invalidateQueries({ queryKey: ['programs'] })
    },
    onError: (error) => window.alert(errorMessage(error)),
  })

  // The lock message names the book you have to finish, which means looking it
  // up by id — the API sends the id rather than the title so the two cannot
  // disagree about what it is called in the current language.
  const titleOf = (id) => data?.books?.find((book) => book.id === id)?.title

  return (
    <QueryState query={program}>
      {data && (
        <section style={{ maxWidth: 820 }}>
          <Link to="/programs" className="btn btn-ghost btn-sm">{t('actions.back')}</Link>

          <div className="row" style={{ gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <span className="tag tag-accent">{t(`programs.types.${data.type}`)}</span>
            {data.enrolled && <span className="tag">{t('programs.joined')}</span>}
          </div>

          <h1 className="page-title" style={{ margin: 'var(--space-3) 0 var(--space-2)' }}>{data.title}</h1>

          {/* The administrator's own description usually explains the rule
              better than our generic sentence does, so the generic one only
              stands in when there is nothing written. */}
          <p className="justify muted" style={{ margin: '0 0 var(--space-5)' }}>
            {data.description || t(`programs.typeHints.${data.type}`)}
          </p>

          <ProgressBar percent={data.percent} />

          <p className="muted tnum" style={{ margin: 'var(--space-2) 0 var(--space-6)', fontSize: 14 }}>
            {t('programs.booksProgress', { done: data.books_completed, total: data.books.length })} · {data.percent}%
          </p>

          {isAuthenticated && (
            <button
              type="button"
              className={`btn btn-sm ${data.enrolled ? 'btn-ghost' : 'btn-primary'}`}
              disabled={enrolment.isPending}
              onClick={() => enrolment.mutate(!data.enrolled)}
              style={{ marginBottom: 'var(--space-6)' }}
            >
              {data.enrolled ? t('programs.leave') : t('programs.join')}
            </button>
          )}

          <ol className="program-list">
            {data.books.map((book, index) => (
              <li key={book.id} className={`card program-item${book.unlocked ? '' : ' program-item--locked'}`}>
                <span className="program-item__index tnum">{index + 1}</span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: 18 }}>{book.title}</h3>

                  {book.author && (
                    <p className="muted" style={{ margin: '2px 0 0', fontSize: 14 }}>{book.author}</p>
                  )}

                  <p className="muted tnum" style={{ margin: 'var(--space-2) 0 0', fontSize: 13 }}>
                    {book.sections_passed}/{book.sections_total} · {t(`programs.${statusKey(book.status)}`)}
                  </p>

                  {!book.unlocked && book.blocked_by && (
                    <p style={{ margin: 'var(--space-2) 0 0', fontSize: 13, color: 'var(--color-neutral-700)' }}>
                      🔒 {t('programs.lockedBecause', { book: titleOf(book.blocked_by) ?? '…' })}
                    </p>
                  )}
                </div>

                {book.unlocked ? (
                  <Link to={`/books/${book.id}`} className="btn btn-primary btn-sm">
                    {book.completed ? t('actions.read') : t('actions.openBook')}
                  </Link>
                ) : (
                  <span className="tag" aria-label={t('programs.locked')}>{t('programs.locked')}</span>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}
    </QueryState>
  )
}

function statusKey(status) {
  return { completed: 'completed', in_progress: 'inProgress', available: 'available', locked: 'locked' }[status]
    ?? 'available'
}
