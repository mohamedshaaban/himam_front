import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/client'
import useCrud from '../useCrud.js'
import Modal from '../components/Modal.jsx'
import TranslatableField from '../components/TranslatableField.jsx'
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
    <>
      <div className="admin-head">
        <h1>{t('admin.nav.books')}</h1>
        <button type="button" className="btn btn-primary" onClick={crud.startCreate}>{t('admin.newBook')}</button>
      </div>

      <QueryState query={list} empty={list.data?.length === 0}>
        <div className="table-wrap panel">
          <table className="table">
            <thead>
              <tr>
                <th>{t('admin.fields.title')}</th>
                <th>{t('admin.fields.level')}</th>
                <th>{t('admin.fields.sections')}</th>
                <th>{t('admin.fields.pages')}</th>
                <th>{t('admin.fields.points')}</th>
                <th>{t('admin.fields.published')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.data?.map((book) => (
                <tr key={book.id}>
                  <td>{pickTranslation(book.title, i18n.language)}</td>
                  <td>{pickTranslation(book.level?.name, i18n.language)}</td>
                  <td className="tnum">{book.sections_count}</td>
                  <td className="tnum">{book.pages}</td>
                  <td className="tnum">{book.points}</td>
                  <td>{book.is_published ? t('common.yes') : t('common.no')}</td>
                  <td>
                    <span className="row" style={{ justifyContent: 'flex-end' }}>
                      <Link to={`/admin/books/${book.id}`} className="btn btn-secondary btn-sm">
                        {t('admin.manageSections')}
                      </Link>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => crud.startEdit(book)}>
                        {t('actions.edit')}
                      </button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => crud.confirmRemove(book.id)}>
                        {t('actions.delete')}
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          <div className="field">
            <label htmlFor="level_id">{t('admin.fields.level')}</label>
            <select
              id="level_id"
              className="select"
              value={editing.level_id ?? ''}
              onChange={(e) => crud.patch({ level_id: e.target.value })}
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
            rows={4}
          />

          <div className="form-grid">
            <NumberField id="pages" label={t('admin.fields.pages')} value={editing.pages} onChange={(pages) => crud.patch({ pages })} />
            <NumberField id="points" label={t('admin.fields.points')} value={editing.points} onChange={(points) => crud.patch({ points })} />
            <NumberField id="position" label={t('admin.fields.position')} value={editing.position} onChange={(position) => crud.patch({ position })} />

            <div className="field">
              <label htmlFor="cover">{t('admin.fields.cover')}</label>
              <input
                id="cover"
                className="input"
                type="text"
                dir="ltr"
                value={editing.cover ?? ''}
                onChange={(e) => crud.patch({ cover: e.target.value })}
              />
            </div>

            <label className="checkbox" style={{ alignSelf: 'end', paddingBottom: 8 }}>
              <input
                type="checkbox"
                checked={Boolean(editing.is_published)}
                onChange={(e) => crud.patch({ is_published: e.target.checked })}
              />
              {t('admin.fields.published')}
            </label>
          </div>
        </Modal>
      )}
    </>
  )
}

function NumberField({ id, label, value, onChange }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        className="input"
        type="number"
        min="0"
        value={value ?? 0}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}
