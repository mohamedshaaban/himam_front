import { useTranslation } from 'react-i18next'
import useCrud from '../useCrud.js'
import Modal from '../components/Modal.jsx'
import TranslatableField from '../components/TranslatableField.jsx'
import RichTextField from '../components/RichTextField.jsx'
import AdminPage from '../components/AdminPage.jsx'
import QueryState from '../../components/PageState.jsx'
import { pickTranslation } from '../translate.js'

const EMPTY = { slug: '', title: {}, body: {}, is_published: true }

/**
 * The static pages the app reads from /api/pages/{slug} — About, Privacy, and
 * anything added later. The slug is editable on purpose: keying pages on one is
 * what lets a new page appear without a route or a deploy.
 */
export default function Pages() {
  const { i18n } = useTranslation()
  const crud = useCrud('pages', { emptyRecord: EMPTY })
  const { t, list, editing } = crud

  return (
    <AdminPage
      title={t('admin.nav.pages')}
      subtitle={t('admin.pagesHint')}
      actions={
        <button type="button" className="btn btn-primary" onClick={crud.startCreate}>
          {t('admin.newPage')}
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
                  <th>{t('admin.fields.slug')}</th>
                  <th>{t('admin.fields.published')}</th>
                  <th className="text-end" />
                </tr>
              </thead>
              <tbody>
                {list.data?.map((item) => (
                  <tr key={item.id}>
                    <td>{pickTranslation(item.title, i18n.language)}</td>
                    <td><code dir="ltr">{item.slug}</code></td>
                    <td>
                      <span className={`badge text-bg-${item.is_published ? 'success' : 'secondary'}`}>
                        {item.is_published ? t('admin.published') : t('admin.draft')}
                      </span>
                    </td>
                    <td className="text-end text-nowrap">
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
          title={editing.id ? t('actions.edit') : t('admin.newPage')}
          onClose={crud.cancel}
          onSubmit={() => crud.save.mutate(editing)}
          busy={crud.save.isPending}
          error={crud.error}
        >
          <div className="mb-3">
            <label className="form-label" htmlFor="page-slug">{t('admin.fields.slug')}</label>
            <input
              id="page-slug"
              className="form-control"
              dir="ltr"
              value={editing.slug}
              onChange={(event) => crud.patch({ slug: event.target.value })}
            />
            <div className="form-text">{t('admin.slugHint')}</div>
          </div>

          <TranslatableField
            label={t('admin.fields.title')}
            value={editing.title}
            onChange={(title) => crud.patch({ title })}
          />

          <RichTextField
            label={t('admin.fields.body')}
            value={editing.body}
            onChange={(body) => crud.patch({ body })}
          />

          <div className="form-check">
            <input
              id="page-published"
              type="checkbox"
              className="form-check-input"
              checked={Boolean(editing.is_published)}
              onChange={(event) => crud.patch({ is_published: event.target.checked })}
            />
            <label className="form-check-label" htmlFor="page-published">{t('admin.fields.published')}</label>
          </div>
        </Modal>
      )}
    </AdminPage>
  )
}
