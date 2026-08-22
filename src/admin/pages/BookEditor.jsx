import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api, { errorMessage } from '../../api/client'
import Modal from '../components/Modal.jsx'
import TranslatableField from '../components/TranslatableField.jsx'
import AdminPage from '../components/AdminPage.jsx'
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
    <AdminPage
      title={pickTranslation(book.data?.title, i18n.language) || t('admin.nav.books')}
      subtitle={t('admin.manageSections')}
      actions={
        <div className="d-flex gap-2">
          <Link to="/admin/books" className="btn btn-outline-secondary">{t('actions.back')}</Link>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => { setError(null); setSection({ ...EMPTY_SECTION }) }}
          >
            {t('admin.newSection')}
          </button>
        </div>
      }
    >
      <QueryState query={book}>
        <div className="row g-3">
          {book.data?.sections?.map((item) => (
            <div className="col-12" key={item.id}>
              <div className="card">
                <div className="card-header d-flex flex-wrap align-items-center gap-2">
                  <h3 className="card-title mb-0 flex-grow-1">
                    <span className="badge text-bg-primary me-2">
                      {String(item.position).padStart(2, '0')}
                    </span>
                    {pickTranslation(item.title, i18n.language)}
                  </h3>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => { setError(null); setQuestion({ ...structuredClone(EMPTY_QUESTION), book_section_id: item.id }) }}
                  >
                    {t('admin.newQuestion')}
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => { setError(null); setSection(item) }}>
                    {t('actions.edit')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => confirmThen(() => removeSection.mutate(item.id))}
                  >
                    {t('actions.delete')}
                  </button>
                </div>

                <div className="card-body">
                  {item.questions?.length ? (
                    <ol className="list-group list-group-numbered list-group-flush">
                      {item.questions.map((q) => (
                        <li className="list-group-item d-flex justify-content-between align-items-start gap-3" key={q.id}>
                          <div className="flex-grow-1">
                            <strong>{pickTranslation(q.text, i18n.language)}</strong>
                            <ul className="list-unstyled mb-0 mt-1 small">
                              {q.options?.map((option) => (
                                <li key={option.id} className={option.is_correct ? 'text-success fw-semibold' : 'text-secondary'}>
                                  {option.is_correct ? '● ' : '○ '}
                                  {pickTranslation(option.text, i18n.language)}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <span className="text-nowrap">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary me-1"
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
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => confirmThen(() => removeQuestion.mutate(q.id))}
                            >
                              {t('actions.delete')}
                            </button>
                          </span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-secondary mb-0">{t('quiz.empty')}</p>
                  )}
                </div>
              </div>
            </div>
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
            rows={6}
          />
          <div className="col-sm-4">
            <label className="form-label" htmlFor="section-position">{t('admin.fields.position')}</label>
            <input
              id="section-position"
              className="form-control"
              type="number"
              min="0"
              value={section.position ?? ''}
              onChange={(event) => setSection({ ...section, position: event.target.value === '' ? null : Number(event.target.value) })}
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
    </AdminPage>
  )
}

function QuestionModal({ question, setQuestion, onClose, onSubmit, busy, error, t }) {
  const setOption = (index, changes) => {
    const options = question.options.map((option, i) => (i === index ? { ...option, ...changes } : option))
    setQuestion({ ...question, options })
  }

  // Grading picks a single correct option, so this is enforced here rather than
  // letting the API reject the save after the fact.
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
      size="xl"
    >
      <TranslatableField
        label={t('admin.fields.title')}
        value={question.text}
        onChange={(text) => setQuestion({ ...question, text })}
        textarea
        rows={2}
      />

      <h6 className="mt-3">{t('admin.fields.options')}</h6>

      {question.options.map((option, index) => (
        <div className="card mb-2" key={index}>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="correct-option"
                  id={`correct-${index}`}
                  checked={Boolean(option.is_correct)}
                  onChange={() => markCorrect(index)}
                />
                <label className="form-check-label" htmlFor={`correct-${index}`}>
                  {t('admin.fields.correct')}
                </label>
              </div>

              {question.options.length > 2 && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
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
        </div>
      ))}

      <button
        type="button"
        className="btn btn-outline-secondary btn-sm"
        onClick={() => setQuestion({ ...question, options: [...question.options, { text: {}, is_correct: false }] })}
      >
        {t('admin.addOption')}
      </button>
    </Modal>
  )
}
