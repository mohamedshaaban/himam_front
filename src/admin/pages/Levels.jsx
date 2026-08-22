import { useTranslation } from 'react-i18next'
import useCrud from '../useCrud.js'
import Modal from '../components/Modal.jsx'
import TranslatableField from '../components/TranslatableField.jsx'
import AdminPage from '../components/AdminPage.jsx'
import QueryState from '../../components/PageState.jsx'
import { pickTranslation } from '../translate.js'

const EMPTY = { name: {}, description: {}, position: 0, is_active: true }

export default function Levels() {
  const { i18n } = useTranslation()
  const crud = useCrud('levels', { emptyRecord: EMPTY })
  const { t, list, editing } = crud

  return (
    <AdminPage
      title={t('admin.nav.levels')}
      actions={
        <button type="button" className="btn btn-primary" onClick={crud.startCreate}>
          {t('admin.newLevel')}
        </button>
      }
    >
      <QueryState query={list} empty={list.data?.length === 0}>
        <div className="card">
          <div className="card-body p-0 table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>{t('admin.fields.name')}</th>
                  <th>{t('admin.fields.position')}</th>
                  <th>{t('admin.nav.books')}</th>
                  <th>{t('admin.fields.active')}</th>
                  <th className="text-end" />
                </tr>
              </thead>
              <tbody>
                {list.data?.map((level) => (
                  <tr key={level.id}>
                    <td>{pickTranslation(level.name, i18n.language)}</td>
                    <td>{level.position}</td>
                    <td>{level.books_count}</td>
                    <td>
                      <span className={`badge ${level.is_active ? 'text-bg-success' : 'text-bg-secondary'}`}>
                        {level.is_active ? t('common.yes') : t('common.no')}
                      </span>
                    </td>
                    <td className="text-end text-nowrap">
                      <button type="button" className="btn btn-sm btn-outline-primary me-1" onClick={() => crud.startEdit(level)}>
                        {t('actions.edit')}
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => crud.confirmRemove(level.id)}>
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
          title={editing.id ? t('actions.edit') : t('admin.newLevel')}
          onClose={crud.cancel}
          onSubmit={() => crud.save.mutate(editing)}
          busy={crud.save.isPending}
          error={crud.error}
        >
          <TranslatableField
            label={t('admin.fields.name')}
            value={editing.name}
            onChange={(name) => crud.patch({ name })}
          />
          <TranslatableField
            label={t('admin.fields.description')}
            value={editing.description}
            onChange={(description) => crud.patch({ description })}
            textarea
            rows={3}
          />

          <div className="row g-3 align-items-end">
            <div className="col-sm-4">
              <label className="form-label" htmlFor="position">{t('admin.fields.position')}</label>
              <input
                id="position"
                className="form-control"
                type="number"
                min="0"
                value={editing.position ?? 0}
                onChange={(event) => crud.patch({ position: Number(event.target.value) })}
              />
            </div>
            <div className="col-sm-auto">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="is_active"
                  checked={Boolean(editing.is_active)}
                  onChange={(event) => crud.patch({ is_active: event.target.checked })}
                />
                <label className="form-check-label" htmlFor="is_active">{t('admin.fields.active')}</label>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </AdminPage>
  )
}
