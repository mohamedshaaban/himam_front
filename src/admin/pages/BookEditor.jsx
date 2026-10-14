import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api, { errorMessage } from '../../api/client'
import Modal from '../components/Modal.jsx'
import TranslatableField from '../components/TranslatableField.jsx'
import RichTextField from '../components/RichTextField.jsx'
import TranslatableMediaField from '../components/TranslatableMediaField.jsx'
import AdminPage from '../components/AdminPage.jsx'
import QueryState from '../../components/PageState.jsx'
import { pickTranslation } from '../translate.js'

const EMPTY_SECTION = { title: {}, body: {}, pdf: {}, position: null }
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
    // A question belongs either to a section or to the book itself, and the
    // endpoint follows from which.
    mutationFn: async (record) => {
      if (record.id) return api.put(`/admin/questions/${record.id}`, record)

      return record.book_section_id
        ? api.post(`/admin/sections/${record.book_section_id}/questions`, record)
        : api.post(`/admin/books/${bookId}/questions`, record)
    },
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

  const sections = book.data?.sections ?? []
  const wholeBook = sections.length === 0

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
        {book.data && (
          <BookSettings
            book={book.data}
            wholeBook={wholeBook}
            onSaved={invalidate}
            t={t}
          />
        )}

        {/* A book read as one document is examined as a whole, so its questions
            live here rather than on sections it does not have. */}
        {book.data && wholeBook && (
          <div className="card mb-3">
            <div className="card-header d-flex flex-wrap align-items-center gap-2">
              <h3 className="card-title mb-0 flex-grow-1">{t('admin.bookQuestions')}</h3>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => { setError(null); setQuestion({ ...structuredClone(EMPTY_QUESTION) }) }}
              >
                {t('admin.newQuestion')}
              </button>
            </div>

            <div className="card-body">
              <QuestionList
                questions={book.data.questions}
                emptyMessage={t('admin.noBookQuestions')}
                onEdit={(q) => {
                  setError(null)
                  setQuestion({
                    id: q.id,
                    text: q.text ?? {},
                    options: (q.options ?? []).map((o) => ({ text: o.text ?? {}, is_correct: Boolean(o.is_correct) })),
                  })
                }}
                onRemove={(id) => confirmThen(() => removeQuestion.mutate(id))}
                t={t}
                language={i18n.language}
              />
            </div>
          </div>
        )}

        <div className="row g-3">
          {sections.map((item) => (
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
                  <QuestionList
                    questions={item.questions}
                    emptyMessage={t('quiz.empty')}
                    onEdit={(q) => {
                      setError(null)
                      setQuestion({
                        id: q.id,
                        book_section_id: item.id,
                        text: q.text ?? {},
                        options: (q.options ?? []).map((o) => ({ text: o.text ?? {}, is_correct: Boolean(o.is_correct) })),
                      })
                    }}
                    onRemove={(id) => confirmThen(() => removeQuestion.mutate(id))}
                    t={t}
                    language={i18n.language}
                  />
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
          <RichTextField
            label={t('admin.fields.body')}
            value={section.body}
            onChange={(body) => setSection({ ...section, body })}
          />

          <TranslatableMediaField
            label={t('admin.fields.pdf')}
            value={section.pdf}
            onChange={(pdf) => setSection({ ...section, pdf })}
            help={t('admin.pdfHint')}
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

/**
 * How the book is read, and what its quiz button says.
 *
 * The reading mode is not a field of its own: a book with sections is read in
 * sections and a book without them is read whole. Showing it as a stored
 * setting would invite it to disagree with the sections below.
 */
function BookSettings({ book, wholeBook, onSaved, t }) {
  const [form, setForm] = useState({
    pdf: book.pdf ?? {},
    quiz_button_visible: book.quiz_button_visible ?? true,
    quiz_button_label: book.quiz_button_label ?? {},
  })
  const [notice, setNotice] = useState(null)
  const [error, setError] = useState(null)

  // A save elsewhere on this page refetches the book, and the form should show
  // what was stored rather than what was typed before that.
  useEffect(() => {
    setForm({
      pdf: book.pdf ?? {},
      quiz_button_visible: book.quiz_button_visible ?? true,
      quiz_button_label: book.quiz_button_label ?? {},
    })
  }, [book.pdf, book.quiz_button_visible, book.quiz_button_label])

  const save = useMutation({
    mutationFn: async () => api.put(`/admin/books/${book.id}`, form),
    onSuccess: () => { setError(null); setNotice(t('admin.saved')); onSaved() },
    onError: (err) => { setNotice(null); setError(errorMessage(err)) },
  })

  return (
    <div className="card mb-3">
      <div className="card-header">
        <h3 className="card-title mb-0">{t('admin.bookSettings')}</h3>
      </div>

      <div className="card-body">
        <p className="mb-1">
          <strong>{t('admin.readingMode')}:</strong>{' '}
          {wholeBook ? t('admin.modeWholeBook') : t('admin.modeSections')}
        </p>
        <p className="text-secondary small">{t('admin.modeHint')}</p>

        {error && <div className="alert alert-danger py-2">{error}</div>}
        {notice && <div className="alert alert-success py-2">{notice}</div>}

        <div className="row g-3">
          {/* Offered on every book: a book read in sections may still carry
              the whole text as one document beside them. */}
          <TranslatableMediaField
            label={t('admin.fields.bookPdf')}
            value={form.pdf}
            onChange={(pdf) => setForm({ ...form, pdf })}
            help={t('admin.bookPdfHint')}
          />

          <div className="col-12">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="quiz-button-visible"
                checked={Boolean(form.quiz_button_visible)}
                onChange={(event) => setForm({ ...form, quiz_button_visible: event.target.checked })}
              />
              <label className="form-check-label" htmlFor="quiz-button-visible">
                {t('admin.fields.quizButtonVisible')}
              </label>
            </div>
            <div className="form-text">{t('admin.quizButtonHint')}</div>
          </div>

          <TranslatableField
            label={t('admin.fields.quizButtonLabel')}
            value={form.quiz_button_label}
            onChange={(quiz_button_label) => setForm({ ...form, quiz_button_label })}
          />
        </div>

        <button
          type="button"
          className="btn btn-primary mt-3"
          onClick={() => save.mutate()}
          disabled={save.isPending}
        >
          {save.isPending && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
          {t('actions.save')}
        </button>
      </div>
    </div>
  )
}

function QuestionList({ questions, emptyMessage, onEdit, onRemove, t, language }) {
  if (!questions?.length) {
    return <p className="text-secondary mb-0">{emptyMessage}</p>
  }

  return (
    <ol className="list-group list-group-numbered list-group-flush">
      {questions.map((q) => (
        <li className="list-group-item d-flex justify-content-between align-items-start gap-3" key={q.id}>
          <div className="flex-grow-1">
            <strong>{pickTranslation(q.text, language)}</strong>
            <ul className="list-unstyled mb-0 mt-1 small">
              {q.options?.map((option) => (
                <li key={option.id} className={option.is_correct ? 'text-success fw-semibold' : 'text-secondary'}>
                  {option.is_correct ? '● ' : '○ '}
                  {pickTranslation(option.text, language)}
                </li>
              ))}
            </ul>
          </div>
          <span className="text-nowrap">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary me-1"
              onClick={() => onEdit(q)}
            >
              {t('actions.edit')}
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() => onRemove(q.id)}
            >
              {t('actions.delete')}
            </button>
          </span>
        </li>
      ))}
    </ol>
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
