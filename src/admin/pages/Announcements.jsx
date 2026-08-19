import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import api, { errorMessage } from '../../api/client'
import useCrud from '../useCrud.js'
import Modal from '../components/Modal.jsx'
import TranslatableField from '../components/TranslatableField.jsx'
import QueryState from '../../components/PageState.jsx'
import { pickTranslation } from '../translate.js'

const CATEGORIES = ['general', 'program', 'exam', 'results', 'honor', 'certificate']

const EMPTY = {
  tag: {},
  title: {},
  body: {},
  image: 'assets/banner.svg',
  category: 'general',
  user_id: null,
  published_at: null,
}

export default function Announcements() {
  const { i18n } = useTranslation()
  const crud = useCrud('announcements', { emptyRecord: EMPTY })
  const { t, list, editing } = crud

  const publish = useMutation({
    mutationFn: async ({ id, published }) => api.post(`/admin/announcements/${id}/publish`, { published }),
    onSuccess: crud.invalidate,
    onError: (error) => window.alert(errorMessage(error)),
  })

  return (
    <>
      <div className="admin-head">
        <h1>{t('admin.nav.announcements')}</h1>
        <button type="button" className="btn btn-primary" onClick={crud.startCreate}>{t('admin.newAnnouncement')}</button>
      </div>

      <QueryState query={list} empty={list.data?.length === 0}>
        <div className="table-wrap panel">
          <table className="table">
            <thead>
              <tr>
                <th>{t('admin.fields.title')}</th>
                <th>{t('admin.fields.category')}</th>
                <th>{t('admin.fields.holder')}</th>
                <th>{t('admin.fields.published')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.data?.map((item) => (
                <tr key={item.id}>
                  <td>{pickTranslation(item.title, i18n.language)}</td>
                  <td>{t(`notifications.category.${item.category}`, { defaultValue: item.category })}</td>
                  <td>{item.user ? item.user.name : t('admin.broadcast')}</td>
                  <td>
                    {item.published_at
                      ? new Date(item.published_at).toLocaleDateString(i18n.language)
                      : <span className="tag tag-neutral">{t('admin.draft')}</span>}
                  </td>
                  <td>
                    <span className="row" style={{ justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => publish.mutate({ id: item.id, published: !item.published_at })}
                      >
                        {item.published_at ? t('admin.unpublish') : t('admin.publish')}
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => crud.startEdit(item)}>
                        {t('actions.edit')}
                      </button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => crud.confirmRemove(item.id)}>
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
          title={editing.id ? t('actions.edit') : t('admin.newAnnouncement')}
          onClose={crud.cancel}
          onSubmit={() => crud.save.mutate(editing)}
          busy={crud.save.isPending}
          error={crud.error}
        >
          <TranslatableField label={t('admin.fields.tag')} value={editing.tag} onChange={(tag) => crud.patch({ tag })} />
          <TranslatableField label={t('admin.fields.title')} value={editing.title} onChange={(title) => crud.patch({ title })} />
          <TranslatableField
            label={t('admin.fields.body')}
            value={editing.body}
            onChange={(body) => crud.patch({ body })}
            textarea
            rows={4}
          />

          <div className="form-grid">
            <div className="field">
              <label htmlFor="category">{t('admin.fields.category')}</label>
              <select
                id="category"
                className="select"
                value={editing.category}
                onChange={(e) => crud.patch({ category: e.target.value })}
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {t(`notifications.category.${category}`, { defaultValue: category })}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="ann-image">{t('admin.fields.image')}</label>
              <input
                id="ann-image"
                className="input"
                type="text"
                dir="ltr"
                value={editing.image ?? ''}
                onChange={(e) => crud.patch({ image: e.target.value })}
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
