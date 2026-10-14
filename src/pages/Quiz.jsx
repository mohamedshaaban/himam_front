import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api, { errorMessage } from '../api/client'
import useLocalizedQuery from '../api/useLocalizedQuery.js'
import QueryState, { EmptyState } from '../components/PageState.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ']

export default function Quiz() {
  // One screen for both exams. A book is examined either per section or as a
  // whole, and the two endpoints take the same request and answer with the same
  // body, so the only difference here is which one to call.
  const { sectionId, bookId } = useParams()
  const scope = sectionId ? 'sections' : 'books'
  const id = sectionId ?? bookId
  const path = `/${scope}/${id}/quiz`

  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { refresh } = useAuth()

  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [message, setMessage] = useState(null)

  const quiz = useLocalizedQuery(['quiz', scope, id], path)

  const submit = useMutation({
    mutationFn: async () => (await api.post(path, { answers })).data,
    onSuccess: (data) => {
      setResult(data)
      setMessage(null)
      // Points, badges and the honour board all move on a pass.
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['badges'] })
      queryClient.invalidateQueries({ queryKey: ['certificates'] })
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      refresh()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    onError: (error) => setMessage(errorMessage(error)),
  })

  const questions = quiz.data?.data ?? []
  const meta = quiz.data?.meta

  const graded = Boolean(result)
  const allAnswered = questions.length > 0 && questions.every((question) => answers[question.id])

  const pick = (questionId, optionId) => {
    if (graded) return
    setAnswers((current) => ({ ...current, [questionId]: optionId }))
  }

  const send = () => {
    if (!allAnswered) {
      setMessage(t('quiz.answerAll'))
      return
    }
    submit.mutate()
  }

  const retry = () => {
    setAnswers({})
    setResult(null)
    setMessage(null)
  }

  return (
    <QueryState query={quiz}>
      <section style={{ maxWidth: 760, margin: '0 auto' }}>
        <Link to={`/books/${meta?.book?.id ?? bookId ?? ''}`} className="btn btn-ghost btn-sm">{t('actions.backToBook')}</Link>

        <p className="kicker" style={{ margin: 'var(--space-4) 0 0' }}>{meta?.book?.title}</p>
        <h1 className="page-title" style={{ margin: 'var(--space-2) 0', fontSize: 'clamp(28px, 3.6vw, 40px)' }}>
          {sectionId ? t('quiz.title') : t('quiz.bookTitle')}
        </h1>
        <p className="muted" style={{ margin: '0 0 var(--space-6)' }}>
          {sectionId ? meta?.section?.title : t('book.wholeBookNote')}
        </p>

        {/* A reader may sit the exam again as often as they like. Saying so
            before they start, along with what a retake does and does not
            change, is better than letting them discover it from the result. */}
        {meta?.taken && !graded && (
          <div className="notice" style={{ marginBottom: 'var(--space-6)' }}>
            {meta.passed && <p style={{ margin: 0 }}>{t('quiz.retakeNote')}</p>}
            <p className="muted" style={{ margin: 'var(--space-1) 0 0', fontSize: 14 }}>
              {t('quiz.attemptCount', { count: meta.attempts, best: meta.best_score ?? 0 })}
            </p>
          </div>
        )}

        {questions.length === 0 ? (
          <EmptyState message={sectionId ? t('quiz.empty') : t('quiz.emptyBook')} />
        ) : (
          <>
            {graded && <Scorecard result={result} t={t} />}
            {message && <p className="notice notice--error" role="alert">{message}</p>}

            <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
              {questions.map((question) => (
                <div key={question.id} className="card" style={{ padding: 'var(--space-6)' }}>
                  <h2 style={{ margin: '0 0 var(--space-4)', fontSize: 22 }}>{question.text}</h2>

                  <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
                    {question.options.map((option, index) => {
                      const picked = answers[question.id] === option.id
                      const correctId = result?.correct_options?.[question.id]
                      const right = graded && option.id === correctId
                      const wrong = graded && picked && option.id !== correctId

                      const classes = ['quiz-option']
                      if (right) classes.push('quiz-option--right')
                      else if (wrong) classes.push('quiz-option--wrong')
                      else if (picked) classes.push('quiz-option--picked')

                      return (
                        <button
                          key={option.id}
                          type="button"
                          className={classes.join(' ')}
                          onClick={() => pick(question.id, option.id)}
                          disabled={graded}
                          aria-pressed={picked}
                        >
                          <span className="quiz-option__letter">{LETTERS[index] ?? index + 1}</span>
                          <span>{option.text}</span>
                          <span className="quiz-option__mark">
                            {right ? t('quiz.correctAnswer') : wrong ? t('quiz.yourAnswer') : ''}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="row" style={{ marginTop: 'var(--space-6)', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={retry}>{t('actions.retry')}</button>
              <button type="button" className="btn btn-primary" onClick={send} disabled={submit.isPending || graded}>
                {submit.isPending ? t('common.loading') : t('actions.submitAnswers')}
              </button>
            </div>
          </>
        )}
      </section>
    </QueryState>
  )
}

function Scorecard({ result, t }) {
  return (
    <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)', gap: 'var(--space-2)' }}>
      <div className="tnum" style={{ fontSize: 44, lineHeight: 1, color: 'var(--color-accent-700)' }}>
        {t('quiz.score', { score: result.score, total: result.total })}
      </div>
      <div style={{ fontSize: 18 }}>{result.passed ? t('quiz.passed') : t('quiz.failed')}</div>
      <div className="muted" style={{ fontSize: 15 }}>
        {result.passed ? t('quiz.passedNote') : t('quiz.failedNote')}
      </div>

      {result.points_awarded > 0 && (
        <div style={{ color: 'var(--color-accent-700)' }}>{t('quiz.pointsAwarded', { points: result.points_awarded })}</div>
      )}

      {result.new_badges?.length > 0 && (
        <div style={{ marginTop: 'var(--space-2)' }}>
          <strong>{t('quiz.newBadges')}: </strong>
          {result.new_badges.map((badge) => badge.name).join('، ')}
        </div>
      )}

      {result.new_certificates?.length > 0 && (
        <div>
          <strong>{t('quiz.newCertificates')}: </strong>
          {result.new_certificates.map((certificate) => certificate.serial).join('، ')}
        </div>
      )}
    </div>
  )
}
