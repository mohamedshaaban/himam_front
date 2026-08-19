import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api, { errorMessage } from '../../api/client'
import Modal from '../components/Modal.jsx'
import TranslatableField from '../components/TranslatableField.jsx'
import QueryState from '../../components/PageState.jsx'
import { pickTranslation } from '../translate.js'

const EMPTY_SECTION = { title: {}, body: {}, position: null }
const EMPTY_QUESTION = {
  text: {},
  options: [
    { text: {}, is_correct: true },
    { text: {}, is_correct: false },
    { text: {}, is_correct: false },
  ],
}

export default function BookEditor() {
  const { bookId } = useParams()
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()

  const [section, setSection] = useState(null)
  const [question, setQuestion] = useState(null)
  const [error, setError] = useState(null)

  const key = ['admin', 'book', bookId]

  const book = useQuery({
    queryKey: key,
    queryFn: async () => (await api.get(`/admin/books/${bookId}`)).data.data,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: key })
  const fail = (err) => setError(errorMessage(err))

  const saveSection = useMutation({
    mutationFn: async (record) =>
      record.id
        ? api.put(`/admin/sections/${record.id}`, record)
        : api.post(`/admin/books/${bookId}/sections`, record),
    onSuccess: () => { setSection(null); setError(null); invalidate() },
    onError: fail,
  })

  const removeSection = useMutation({
    mutationFn: async (id) => api.delete(`/admin/sections/${id}`),
    onSuccess: invalidate,
    onError: (err) => window.alert(errorMessage(err)),
  })

  const saveQuestion = useMutation({
    mutationFn: async (record) =>
      record.id
        ? api.put(`/admin/questions/${record.id}`, record)
        : api.post(`/admin/sections/${record.book_section_id}/questions`, record),
    onSuccess: () => { setQuestion(null); setError(null); invalidate() },
    onError: fail,
  })

  const removeQuestion = useMutation({
    mutationFn: async (id) => api.delete(`/admin/questions/${id}`),
    onSuccess: invalidate,
    onError: (err) => window.alert(errorMessage(err)),
  })

  const confirmThen = (action) => {
    if (window.confirm(t('admin.confirmDelete'))) action()
  }

  return (
    <>
      <div className="admin-head">
        <div>
          <Link to="/admin/books" className="btn btn-ghost btn-sm">{t('actions.back')}</Link>
          <h1 style={{ marginTop: 'var(--space-2)' }}>
            {pickTranslation(book.data?.title, i18n.language) || t('admin.nav.books')}
          </h1>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => { setError(null); setSection({ ...EMPTY_SECTION }) }}
        >
          {t('admin.newSection')}
        </button>
      </div>

      <QueryState query={book}>
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          {book.data?.sections?.map((item) => (
            <section key={item.id} className="panel">
              <div className="section-head">
                <h2>
                  <span className="tnum" style={{ color: 'var(--color-accent-700)', marginInlineEnd: 8 }}>
                    {String(item.position).padStart(2, '0')}
                  </span>
                  {pickTranslation(item.title, i18n.language)}
                </h2>
                <span className="row">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => { setError(null); setQuestion({ ...structuredClone(EMPTY_QUESTION), book_section_id: item.id }) }}
                  >
                    {t('admin.newQuestion')}
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setError(null); setSection(item) }}>
                    {t('actions.edit')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => confirmThen(() => removeSection.mutate(item.id))}
                  >
                    {t('actions.delete')}
                  </button>
                </span>
              </div>

              <ol style={{ margin: 0, paddingInlineStart: '1.4em', display: 'grid', gap: 'var(--space-3)' }}>
                {item.questions?.map((q) => (
                  <li key={q.id}>
                    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: '1 1 320px' }}>
                        <strong>{pickTranslation(q.text, i18n.language)}</strong>
                        <ul className="list-reset" style={{ marginTop: 6, fontSize: 15 }}>
                          {q.options?.map((option) => (
                            <li key={option.id} style={{ color: option.is_correct ? 'var(--color-accent-700)' : 'var(--color-neutral-700)' }}>
                              {option.is_correct ? '● ' : '○ '}
                              {pickTranslation(option.text, i18n.language)}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <span className="row">
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => {
                            setError(null)
                            setQuestion({
                              id: q.id,
                              book_section_id: item.id,
                              text: q.text ?? {},
                              options: (q.options ?? []).map((o) => ({ text: o.text ?? {}, is_correct: Boolean(o.is_correct) })),
                            })
                          }}
                        >
                          {t('actions.edit')}
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => confirmThen(() => removeQuestion.mutate(q.id))}
                        >
                          {t('actions.delete')}
                        </button>
                      </span>
                    </div>
                  </li>
                ))}
              </ol>

              {(!item.questions || item.questions.length === 0) && (
                <p className="muted" style={{ margin: 0 }}>{t('quiz.empty')}</p>
              )}
            </section>
          ))}
        </div>
      </QueryState>

      {section && (
        <Modal
          title={section.id ? t('actions.edit') : t('admin.newSection')}
          onClose={() => setSection(null)}
          onSubmit={() => saveSection.mutate(section)}
          busy={saveSection.isPending}
          error={error}
        >
          <TranslatableField
            label={t('admin.fields.title')}
            value={section.title}
            onChange={(title) => setSection({ ...section, title })}
          />
          <TranslatableField
            label={t('admin.fields.body')}
            value={section.body}
            onChange={(body) => setSection({ ...section, body })}
            textarea
            rows={8}
          />
          <div className="field" style={{ maxWidth: 160 }}>
            <label htmlFor="section-position">{t('admin.fields.position')}</label>
            <input
              id="section-position"
              className="input"
              type="number"
              min="0"
              value={section.position ?? ''}
              onChange={(e) => setSection({ ...section, position: e.target.value === '' ? null : Number(e.target.value) })}
            />
          </div>
        </Modal>
      )}

      {question && (
        <QuestionModal
          question={question}
          setQuestion={setQuestion}
          onClose={() => setQuestion(null)}
          onSubmit={() => saveQuestion.mutate(question)}
          busy={saveQuestion.isPending}
          error={error}
          t={t}
        />
      )}
    </>
  )
}

function QuestionModal({ question, setQuestion, onClose, onSubmit, busy, error, t }) {
  const setOption = (index, changes) => {
    const options = question.options.map((option, i) => (i === index ? { ...option, ...changes } : option))
    setQuestion({ ...question, options })
  }

  // Exactly one option may be correct — the API rejects anything else, so the
  // radio behaviour is enforced here rather than letting a save fail.
  const markCorrect = (index) => {
    setQuestion({
      ...question,
      options: question.options.map((option, i) => ({ ...option, is_correct: i === index })),
    })
  }

  return (
    <Modal
      title={question.id ? t('actions.edit') : t('admin.newQuestion')}
      onClose={onClose}
      onSubmit={onSubmit}
      busy={busy}
      error={error}
    >
      <TranslatableField
        label={t('admin.fields.title')}
        value={question.text}
        onChange={(text) => setQuestion({ ...question, text })}
        textarea
        rows={2}
      />

      <h3 style={{ margin: 'var(--space-3) 0 0', fontSize: 18 }}>{t('admin.fields.options')}</h3>

      {question.options.map((option, index) => (
        <div key={index} className="panel" style={{ background: 'transparent' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <label className="checkbox">
              <input
                type="radio"
                name="correct-option"
                checked={Boolean(option.is_correct)}
                onChange={() => markCorrect(index)}
              />
              {t('admin.fields.correct')}
            </label>

            {question.options.length > 2 && (
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => setQuestion({ ...question, options: question.options.filter((_, i) => i !== index) })}
              >
                {t('admin.removeOption')}
              </button>
            )}
          </div>

          <TranslatableField
            label={`${t('admin.fields.options')} ${index + 1}`}
            value={option.text}
            onChange={(text) => setOption(index, { text })}
          />
        </div>
      ))}

      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={() => setQuestion({ ...question, options: [...question.options, { text: {}, is_correct: false }] })}
      >
        {t('admin.addOption')}
      </button>
    </Modal>
  )
}
