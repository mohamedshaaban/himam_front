import { useTranslation } from 'react-i18next'
import useCrud from '../useCrud.js'
import Modal from '../components/Modal.jsx'
import TranslatableField from '../components/TranslatableField.jsx'
import AdminPage from '../components/AdminPage.jsx'
import QueryState from '../../components/PageState.jsx'
import { pickTranslation } from '../translate.js'

const CRITERIA = ['manual', 'sections_passed', 'books_completed', 'points']

const EMPTY = {
  name: {},
  description: {},
  image: 'assets/badge.png',
  criteria_type: 'sections_passed',
  criteria_value: 1,
  position: 0,
  is_active: true,
}

export default function Badges() {
  const { i18n } = useTranslation()
  const crud = useCrud('badges', { emptyRecord: EMPTY })
  const { t, list, editing } = crud

  return (
    <AdminPage
      title={t('admin.nav.badges')}
      actions={
        <button type="button" className="btn btn-primary" onClick={crud.startCreate}>
          {t('admin.newBadge')}
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
                  <th>{t('admin.fields.criteria')}</th>
                  <th>{t('admin.fields.criteriaValue')}</th>
                  <th>{t('admin.nav.users')}</th>
                  <th>{t('admin.fields.active')}</th>
                  <th className="text-end" />
                </tr>
              </thead>
              <tbody>
                {list.data?.map((badge) => (
                  <tr key={badge.id}>
                    <td>
                      <span className="d-flex align-items-center gap-2">
                        <img src={badge.image || '/assets/badge.png'} alt="" style={{ width: 26, height: 26, objectFit: 'contain' }} />
                        {pickTranslation(badge.name, i18n.language)}
                      </span>
                    </td>
                    <td>{t(`admin.criteria.${badge.criteria_type}`)}</td>
                    <td>{badge.criteria_type === 'manual' ? '—' : badge.criteria_value}</td>
                    <td><span className="badge text-bg-info">{badge.users_count}</span></td>
                    <td>
                      <span className={`badge ${badge.is_active ? 'text-bg-success' : 'text-bg-secondary'}`}>
                        {badge.is_active ? t('common.yes') : t('common.no')}
                      </span>
                    </td>
                    <td className="text-end text-nowrap">
                      <button type="button" className="btn btn-sm btn-outline-primary me-1" onClick={() => crud.startEdit(badge)}>
                        {t('actions.edit')}
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => crud.confirmRemove(badge.id)}>
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
          title={editing.id ? t('actions.edit') : t('admin.newBadge')}
          onClose={crud.cancel}
          onSubmit={() => crud.save.mutate(editing)}
          busy={crud.save.isPending}
          error={crud.error}
        >
          <TranslatableField label={t('admin.fields.name')} value={editing.name} onChange={(name) => crud.patch({ name })} />
          <TranslatableField
            label={t('admin.fields.description')}
            value={editing.description}
            onChange={(description) => crud.patch({ description })}
            textarea
            rows={3}
          />

          <div className="row g-3 align-items-end">
            <div className="col-sm-6">
              <label className="form-label" htmlFor="criteria_type">{t('admin.fields.criteria')}</label>
              <select
                id="criteria_type"
                className="form-select"
                value={editing.criteria_type}
                onChange={(event) => crud.patch({ criteria_type: event.target.value })}
              >
                {CRITERIA.map((criteria) => (
                  <option key={criteria} value={criteria}>{t(`admin.criteria.${criteria}`)}</option>
                ))}
              </select>
            </div>

            <div className="col-sm-6">
              <label className="form-label" htmlFor="criteria_value">{t('admin.fields.criteriaValue')}</label>
              <input
                id="criteria_value"
                className="form-control"
                type="number"
                min="0"
                disabled={editing.criteria_type === 'manual'}
                value={editing.criteria_value ?? 0}
                onChange={(event) => crud.patch({ criteria_value: Number(event.target.value) })}
              />
            </div>

            <div className="col-sm-6">
              <label className="form-label" htmlFor="image">{t('admin.fields.image')}</label>
              <input
                id="image"
                className="form-control"
                type="text"
                dir="ltr"
                value={editing.image ?? ''}
                onChange={(event) => crud.patch({ image: event.target.value })}
              />
            </div>

            <div className="col-6 col-sm-3">
              <label className="form-label" htmlFor="badge-position">{t('admin.fields.position')}</label>
              <input
                id="badge-position"
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
                  id="badge-active"
                  checked={Boolean(editing.is_active)}
                  onChange={(event) => crud.patch({ is_active: event.target.checked })}
                />
                <label className="form-check-label" htmlFor="badge-active">{t('admin.fields.active')}</label>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </AdminPage>
  )
}
