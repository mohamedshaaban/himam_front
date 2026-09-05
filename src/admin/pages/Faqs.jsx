import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import api, { errorMessage } from '../../api/client'
import useCrud from '../useCrud.js'
import Modal from '../components/Modal.jsx'
import TranslatableField from '../components/TranslatableField.jsx'
import RichTextField from '../components/RichTextField.jsx'
import AdminPage from '../components/AdminPage.jsx'
import QueryState from '../../components/PageState.jsx'
import { pickTranslation } from '../translate.js'

const EMPTY = { question: {}, answer: {}, category: '', is_active: true }

export default function Faqs() {
  const { i18n } = useTranslation()
  const crud = useCrud('faqs', { emptyRecord: EMPTY })
  const { t, list, editing } = crud

  // The order questions appear in matters — the common ones belong at the top —
  // so the whole ordering is sent at once rather than a row at a time.
  const reorder = useMutation({
    mutationFn: async (ids) => api.post('/admin/faqs/reorder', { ids }),
    onSuccess: crud.invalidate,
    onError: (error) => window.alert(errorMessage(error)),
  })

  const move = (index, direction) => {
    const rows = list.data ?? []
    const target = index + direction
    if (target < 0 || target >= rows.length) return

    const ids = rows.map((row) => row.id)
    ;[ids[index], ids[target]] = [ids[target], ids[index]]
    reorder.mutate(ids)
  }

  return (
    <AdminPage
      title={t('admin.nav.faqs')}
      actions={
        <button type="button" className="btn btn-primary" onClick={crud.startCreate}>
          {t('admin.newFaq')}
        </button>
      }
    >
      <QueryState query={list} empty={list.data?.length === 0}>
        <div className="card">
          <div className="card-body p-0 table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: 90 }}>{t('admin.fields.order')}</th>
                  <th>{t('admin.fields.question')}</th>
                  <th>{t('admin.fields.category')}</th>
                  <th>{t('admin.fields.active')}</th>
                  <th className="text-end" />
                </tr>
              </thead>
              <tbody>
                {list.data?.map((item, index) => (
                  <tr key={item.id}>
                    <td className="text-nowrap">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        disabled={index === 0 || reorder.isPending}
                        onClick={() => move(index, -1)}
                        aria-label={t('admin.moveUp')}
                      >
                        ↑
                      </button>{' '}
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        disabled={index === (list.data?.length ?? 0) - 1 || reorder.isPending}
                        onClick={() => move(index, 1)}
                        aria-label={t('admin.moveDown')}
                      >
                        ↓
                      </button>
                    </td>
                    <td>{pickTranslation(item.question, i18n.language)}</td>
                    <td>{item.category || '—'}</td>
                    <td>
                      <span className={`badge text-bg-${item.is_active ? 'success' : 'secondary'}`}>
                        {item.is_active ? t('admin.active') : t('admin.hidden')}
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
          title={editing.id ? t('actions.edit') : t('admin.newFaq')}
          onClose={crud.cancel}
          onSubmit={() => crud.save.mutate(editing)}
          busy={crud.save.isPending}
          error={crud.error}
        >
          <TranslatableField
            label={t('admin.fields.question')}
            value={editing.question}
            onChange={(question) => crud.patch({ question })}
          />

          <RichTextField
            label={t('admin.fields.answer')}
            value={editing.answer}
            onChange={(answer) => crud.patch({ answer })}
          />

          <div className="mb-3">
            <label className="form-label" htmlFor="faq-category">{t('admin.fields.category')}</label>
            <input
              id="faq-category"
              className="form-control"
              value={editing.category ?? ''}
              onChange={(event) => crud.patch({ category: event.target.value })}
            />
          </div>

          <div className="form-check">
            <input
              id="faq-active"
              type="checkbox"
              className="form-check-input"
              checked={Boolean(editing.is_active)}
              onChange={(event) => crud.patch({ is_active: event.target.checked })}
            />
            <label className="form-check-label" htmlFor="faq-active">{t('admin.fields.active')}</label>
          </div>
        </Modal>
      )}
    </AdminPage>
  )
}
