import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import api, { errorMessage } from '../../api/client'
import useCrud from '../useCrud.js'
import Modal from '../components/Modal.jsx'
import TranslatableField from '../components/TranslatableField.jsx'
import AdminPage from '../components/AdminPage.jsx'
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
    <AdminPage
      title={t('admin.nav.announcements')}
      actions={
        <button type="button" className="btn btn-primary" onClick={crud.startCreate}>
          {t('admin.newAnnouncement')}
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
                  <th>{t('admin.fields.category')}</th>
                  <th>{t('admin.fields.holder')}</th>
                  <th>{t('admin.fields.published')}</th>
                  <th className="text-end" />
                </tr>
              </thead>
              <tbody>
                {list.data?.map((item) => (
                  <tr key={item.id}>
                    <td>{pickTranslation(item.title, i18n.language)}</td>
                    <td>{t(`notifications.category.${item.category}`, { defaultValue: item.category })}</td>
                    <td>{item.user ? item.user.name : t('admin.broadcast')}</td>
                    <td>
                      {item.published_at ? (
                        <span className="badge text-bg-success">
                          {new Date(item.published_at).toLocaleDateString(i18n.language)}
                        </span>
                      ) : (
                        <span className="badge text-bg-secondary">{t('admin.draft')}</span>
                      )}
                    </td>
                    <td className="text-end text-nowrap">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary me-1"
                        onClick={() => publish.mutate({ id: item.id, published: !item.published_at })}
                      >
                        {item.published_at ? t('admin.unpublish') : t('admin.publish')}
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-primary me-1" onClick={() => crud.startEdit(item)}>
                        {t('actions.edit')}
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => crud.confirmRemove(item.id)}>
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
            rows={3}
          />

          <div className="row g-3">
            <div className="col-sm-6">
              <label className="form-label" htmlFor="category">{t('admin.fields.category')}</label>
              <select
                id="category"
                className="form-select"
                value={editing.category}
                onChange={(event) => crud.patch({ category: event.target.value })}
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {t(`notifications.category.${category}`, { defaultValue: category })}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-sm-6">
              <label className="form-label" htmlFor="ann-image">{t('admin.fields.image')}</label>
              <input
                id="ann-image"
                className="form-control"
                type="text"
                dir="ltr"
                value={editing.image ?? ''}
                onChange={(event) => crud.patch({ image: event.target.value })}
              />
            </div>
          </div>
        </Modal>
      )}
    </AdminPage>
  )
}
