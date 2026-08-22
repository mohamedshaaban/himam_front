import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/client'
import useCrud from '../useCrud.js'
import Modal from '../components/Modal.jsx'
import TranslatableField from '../components/TranslatableField.jsx'
import AdminPage from '../components/AdminPage.jsx'
import QueryState from '../../components/PageState.jsx'
import { pickTranslation } from '../translate.js'

const EMPTY = {
  level_id: '',
  title: {},
  author: {},
  description: {},
  cover: '',
  pages: 0,
  points: 0,
  position: 0,
  is_published: true,
}

export default function Books() {
  const { i18n } = useTranslation()
  const crud = useCrud('books', { emptyRecord: EMPTY })
  const { t, list, editing } = crud

  const levels = useQuery({
    queryKey: ['admin', 'levels'],
    queryFn: async () => (await api.get('/admin/levels')).data.data,
  })

  return (
    <AdminPage
      title={t('admin.nav.books')}
      actions={
        <button type="button" className="btn btn-primary" onClick={crud.startCreate}>
          {t('admin.newBook')}
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
                  <th>{t('admin.fields.level')}</th>
                  <th>{t('admin.fields.sections')}</th>
                  <th>{t('admin.fields.pages')}</th>
                  <th>{t('admin.fields.points')}</th>
                  <th>{t('admin.fields.published')}</th>
                  <th className="text-end" />
                </tr>
              </thead>
              <tbody>
                {list.data?.map((book) => (
                  <tr key={book.id}>
                    <td>{pickTranslation(book.title, i18n.language)}</td>
                    <td>{pickTranslation(book.level?.name, i18n.language)}</td>
                    <td>{book.sections_count}</td>
                    <td>{book.pages}</td>
                    <td>{book.points}</td>
                    <td>
                      <span className={`badge ${book.is_published ? 'text-bg-success' : 'text-bg-secondary'}`}>
                        {book.is_published ? t('common.yes') : t('common.no')}
                      </span>
                    </td>
                    <td className="text-end text-nowrap">
                      <Link to={`/admin/books/${book.id}`} className="btn btn-sm btn-outline-secondary me-1">
                        {t('admin.manageSections')}
                      </Link>
                      <button type="button" className="btn btn-sm btn-outline-primary me-1" onClick={() => crud.startEdit(book)}>
                        {t('actions.edit')}
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => crud.confirmRemove(book.id)}>
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
          title={editing.id ? t('actions.edit') : t('admin.newBook')}
          onClose={crud.cancel}
          onSubmit={() => crud.save.mutate(editing)}
          busy={crud.save.isPending}
          error={crud.error}
        >
          <div className="mb-3">
            <label className="form-label" htmlFor="level_id">{t('admin.fields.level')}</label>
            <select
              id="level_id"
              className="form-select"
              value={editing.level_id ?? ''}
              onChange={(event) => crud.patch({ level_id: event.target.value })}
              required
            >
              <option value="">—</option>
              {levels.data?.map((level) => (
                <option key={level.id} value={level.id}>
                  {pickTranslation(level.name, i18n.language)}
                </option>
              ))}
            </select>
          </div>

          <TranslatableField label={t('admin.fields.title')} value={editing.title} onChange={(title) => crud.patch({ title })} />
          <TranslatableField label={t('admin.fields.author')} value={editing.author} onChange={(author) => crud.patch({ author })} />
          <TranslatableField
            label={t('admin.fields.description')}
            value={editing.description}
            onChange={(description) => crud.patch({ description })}
            textarea
            rows={3}
          />

          <div className="row g-3 align-items-end">
            <Num id="pages" label={t('admin.fields.pages')} value={editing.pages} onChange={(pages) => crud.patch({ pages })} />
            <Num id="points" label={t('admin.fields.points')} value={editing.points} onChange={(points) => crud.patch({ points })} />
            <Num id="position" label={t('admin.fields.position')} value={editing.position} onChange={(position) => crud.patch({ position })} />

            <div className="col-sm-6">
              <label className="form-label" htmlFor="cover">{t('admin.fields.cover')}</label>
              <input
                id="cover"
                className="form-control"
                type="text"
                dir="ltr"
                value={editing.cover ?? ''}
                onChange={(event) => crud.patch({ cover: event.target.value })}
              />
            </div>

            <div className="col-sm-auto">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="is_published"
                  checked={Boolean(editing.is_published)}
                  onChange={(event) => crud.patch({ is_published: event.target.checked })}
                />
                <label className="form-check-label" htmlFor="is_published">{t('admin.fields.published')}</label>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </AdminPage>
  )
}

function Num({ id, label, value, onChange }) {
  return (
    <div className="col-6 col-sm-3">
      <label className="form-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        className="form-control"
        type="number"
        min="0"
        value={value ?? 0}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  )
}
