import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import api, { errorMessage } from '../../api/client'
import useCrud from '../useCrud.js'
import Modal from '../components/Modal.jsx'
import TranslatableField from '../components/TranslatableField.jsx'
import MediaInput from '../components/MediaInput.jsx'
import AdminPage from '../components/AdminPage.jsx'
import QueryState from '../../components/PageState.jsx'
import { pickTranslation } from '../translate.js'

const TYPES = ['general', 'sequential', 'selective']

const EMPTY = {
  title: {},
  description: {},
  type: 'general',
  cover: '',
  position: 0,
  is_public: true,
  is_active: true,
}

const TYPE_BADGE = { general: 'success', sequential: 'primary', selective: 'warning' }

export default function Programs() {
  const { i18n } = useTranslation()
  const crud = useCrud('programs', { emptyRecord: EMPTY })
  const { t, list, editing } = crud

  // Books and readers are edited on their own screen: a programme's book order
  // is the whole point of a sequential programme, and it deserves more room
  // than a row in a dialog.
  const [managing, setManaging] = useState(null)

  return (
    <AdminPage
      title={t('admin.nav.programs')}
      subtitle={t('admin.programsHint')}
      actions={
        <button type="button" className="btn btn-primary" onClick={crud.startCreate}>
          {t('admin.newProgram')}
        </button>
      }
    >
      <QueryState query={list} empty={list.data?.length === 0}>
        <div className="card">
          <div className="card-body p-0 table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>{t('admin.fields.title')}</th>
                  <th>{t('admin.fields.type')}</th>
                  <th>{t('admin.nav.books')}</th>
                  <th>{t('admin.fields.assignedReaders')}</th>
                  <th>{t('admin.fields.active')}</th>
                  <th className="text-end" />
                </tr>
              </thead>
              <tbody>
                {list.data?.map((program) => (
                  <tr key={program.id}>
                    <td>{pickTranslation(program.title, i18n.language)}</td>
                    <td>
                      <span className={`badge text-bg-${TYPE_BADGE[program.type] ?? 'secondary'}`}>
                        {t(`programs.types.${program.type}`)}
                      </span>
                    </td>
                    <td>{program.books_count}</td>
                    <td>
                      {program.type === 'selective'
                        ? program.members_count
                        : <span className="text-secondary">{t('programs.everyone')}</span>}
                    </td>
                    <td>
                      <span className={`badge text-bg-${program.is_active ? 'success' : 'secondary'}`}>
                        {program.is_active ? t('admin.active') : t('admin.hidden')}
                      </span>
                    </td>
                    <td className="text-end text-nowrap">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary me-1"
                        onClick={() => setManaging(program)}
                      >
                        {t('admin.manageContents')}
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-primary me-1" onClick={() => crud.startEdit(program)}>
                        {t('actions.edit')}
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => crud.confirmRemove(program.id)}>
                        {t('actions.delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </QueryState>

      {editing && (
        <Modal
          title={editing.id ? t('actions.edit') : t('admin.newProgram')}
          onClose={crud.cancel}
          onSubmit={() => crud.save.mutate(editing)}
          busy={crud.save.isPending}
          error={crud.error}
        >
          <TranslatableField
            label={t('admin.fields.title')}
            value={editing.title}
            onChange={(title) => crud.patch({ title })}
          />
          <TranslatableField
            label={t('admin.fields.description')}
            value={editing.description}
            onChange={(description) => crud.patch({ description })}
            textarea
            rows={3}
          />

          <div className="row g-3">
            <div className="col-sm-6">
              <label className="form-label" htmlFor="type">{t('admin.fields.type')}</label>
              <select
                id="type"
                className="form-select"
                value={editing.type}
                onChange={(event) => crud.patch({ type: event.target.value })}
              >
                {TYPES.map((type) => (
                  <option key={type} value={type}>{t(`programs.types.${type}`)}</option>
                ))}
              </select>
              <div className="form-text">{t(`programs.typeHints.${editing.type}`)}</div>
            </div>

            <div className="col-sm-6">
              <label className="form-label" htmlFor="position">{t('admin.fields.position')}</label>
              <input
                id="position"
                type="number"
                min="0"
                className="form-control"
                value={editing.position ?? 0}
                onChange={(event) => crud.patch({ position: Number(event.target.value) })}
              />
            </div>
          </div>

          <MediaInput
            label={t('admin.fields.cover')}
            value={editing.cover}
            onChange={(cover) => crud.patch({ cover })}
          />

          {/* Only a sequential programme has a choice here: a general one is
              always listed and a selective one never is. */}
          {editing.type === 'sequential' && (
            <div className="form-check">
              <input
                id="is_public"
                type="checkbox"
                className="form-check-input"
                checked={Boolean(editing.is_public)}
                onChange={(event) => crud.patch({ is_public: event.target.checked })}
              />
              <label className="form-check-label" htmlFor="is_public">{t('admin.fields.listedForEveryone')}</label>
            </div>
          )}

          <div className="form-check">
            <input
              id="is_active"
              type="checkbox"
              className="form-check-input"
              checked={Boolean(editing.is_active)}
              onChange={(event) => crud.patch({ is_active: event.target.checked })}
            />
            <label className="form-check-label" htmlFor="is_active">{t('admin.fields.active')}</label>
          </div>
        </Modal>
      )}

      {managing && (
        <ProgramContents program={managing} onClose={() => setManaging(null)} onSaved={crud.invalidate} />
      )}
    </AdminPage>
  )
}

/**
 * Books (ordered) and, for a selective programme, the assigned readers.
 */
function ProgramContents({ program, onClose, onSaved }) {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [error, setError] = useState(null)

  const detail = useQuery({
    queryKey: ['admin', 'programs', program.id],
    queryFn: async () => (await api.get(`/admin/programs/${program.id}`)).data.data,
  })

  const allBooks = useQuery({
    queryKey: ['admin', 'books'],
    queryFn: async () => (await api.get('/admin/books')).data.data,
  })

  const allUsers = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => (await api.get('/admin/users')).data.data,
    enabled: program.type === 'selective',
  })

  const [bookIds, setBookIds] = useState(null)
  const [userIds, setUserIds] = useState(null)

  const books = bookIds ?? detail.data?.books?.map((b) => b.id) ?? []
  const members = userIds ?? detail.data?.members?.map((m) => m.id) ?? []

  const save = useMutation({
    mutationFn: async () => {
      await api.put(`/admin/programs/${program.id}/books`, { book_ids: books })

      if (program.type === 'selective') {
        await api.put(`/admin/programs/${program.id}/members`, { user_ids: members })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'programs'] })
      onSaved?.()
      onClose()
    },
    onError: (err) => setError(errorMessage(err)),
  })

  const titleOf = (book) => pickTranslation(book.title, i18n.language)

  const move = (index, direction) => {
    const target = index + direction
    if (target < 0 || target >= books.length) return

    const next = [...books]
    ;[next[index], next[target]] = [next[target], next[index]]
    setBookIds(next)
  }

  const toggleBook = (id) =>
    setBookIds(books.includes(id) ? books.filter((b) => b !== id) : [...books, id])

  const toggleUser = (id) =>
    setUserIds(members.includes(id) ? members.filter((u) => u !== id) : [...members, id])

  const byId = (id) => allBooks.data?.find((b) => b.id === id)

  return (
    <Modal
      title={`${pickTranslation(program.title, i18n.language)} — ${t('admin.manageContents')}`}
      onClose={onClose}
      onSubmit={() => save.mutate()}
      busy={save.isPending}
      error={error}
    >
      <QueryState query={detail}>
        <h6 className="fw-semibold">{t('admin.nav.books')}</h6>

        {program.type === 'sequential' && (
          <p className="text-secondary small">{t('admin.orderMatters')}</p>
        )}

        {books.length === 0 && <p className="text-secondary">{t('common.empty')}</p>}

        <ol className="list-group list-group-numbered mb-3">
          {books.map((id, index) => {
            const book = byId(id)

            return (
              <li key={id} className="list-group-item d-flex align-items-center gap-2">
                <span className="flex-grow-1">{book ? titleOf(book) : `#${id}`}</span>

                {program.type === 'sequential' && (
                  <>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                      aria-label={t('admin.moveUp')}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      disabled={index === books.length - 1}
                      onClick={() => move(index, 1)}
                      aria-label={t('admin.moveDown')}
                    >
                      ↓
                    </button>
                  </>
                )}

                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => toggleBook(id)}>
                  {t('actions.delete')}
                </button>
              </li>
            )
          })}
        </ol>

        <details className="mb-4">
          <summary className="fw-semibold">{t('admin.addBooks')}</summary>
          <div className="mt-2" style={{ maxHeight: 220, overflowY: 'auto' }}>
            {allBooks.data?.filter((b) => !books.includes(b.id)).map((book) => (
              <div className="form-check" key={book.id}>
                <input
                  id={`book-${book.id}`}
                  type="checkbox"
                  className="form-check-input"
                  checked={false}
                  onChange={() => toggleBook(book.id)}
                />
                <label className="form-check-label" htmlFor={`book-${book.id}`}>{titleOf(book)}</label>
              </div>
            ))}
          </div>
        </details>

        {program.type === 'selective' && (
          <>
            <h6 className="fw-semibold">{t('admin.fields.assignedReaders')}</h6>
            <p className="text-secondary small">{t('admin.selectiveHint')}</p>

            <div style={{ maxHeight: 240, overflowY: 'auto' }}>
              {allUsers.data?.filter((u) => u.role !== 'admin').map((user) => (
                <div className="form-check" key={user.id}>
                  <input
                    id={`user-${user.id}`}
                    type="checkbox"
                    className="form-check-input"
                    checked={members.includes(user.id)}
                    onChange={() => toggleUser(user.id)}
                  />
                  <label className="form-check-label" htmlFor={`user-${user.id}`}>
                    {user.name} <span className="text-secondary">{user.email}</span>
                  </label>
                </div>
              ))}
            </div>
          </>
        )}
      </QueryState>
    </Modal>
  )
}
