import { useTranslation } from 'react-i18next'
import useCrud from '../useCrud.js'
import Modal from '../components/Modal.jsx'
import TranslatableField from '../components/TranslatableField.jsx'
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
    <>
      <div className="admin-head">
        <h1>{t('admin.nav.badges')}</h1>
        <button type="button" className="btn btn-primary" onClick={crud.startCreate}>{t('admin.newBadge')}</button>
      </div>

      <QueryState query={list} empty={list.data?.length === 0}>
        <div className="table-wrap panel">
          <table className="table">
            <thead>
              <tr>
                <th>{t('admin.fields.name')}</th>
                <th>{t('admin.fields.criteria')}</th>
                <th>{t('admin.fields.criteriaValue')}</th>
                <th>{t('admin.nav.users')}</th>
                <th>{t('admin.fields.active')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.data?.map((badge) => (
                <tr key={badge.id}>
                  <td>
                    <span className="row" style={{ flexWrap: 'nowrap' }}>
                      <img src={badge.image || '/assets/badge.png'} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                      {pickTranslation(badge.name, i18n.language)}
                    </span>
                  </td>
                  <td>{t(`admin.criteria.${badge.criteria_type}`)}</td>
                  <td className="tnum">{badge.criteria_type === 'manual' ? '—' : badge.criteria_value}</td>
                  <td className="tnum">{badge.users_count}</td>
                  <td>{badge.is_active ? t('common.yes') : t('common.no')}</td>
                  <td>
                    <span className="row" style={{ justifyContent: 'flex-end' }}>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => crud.startEdit(badge)}>
                        {t('actions.edit')}
                      </button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => crud.confirmRemove(badge.id)}>
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

          <div className="form-grid">
            <div className="field">
              <label htmlFor="criteria_type">{t('admin.fields.criteria')}</label>
              <select
                id="criteria_type"
                className="select"
                value={editing.criteria_type}
                onChange={(e) => crud.patch({ criteria_type: e.target.value })}
              >
                {CRITERIA.map((criteria) => (
                  <option key={criteria} value={criteria}>{t(`admin.criteria.${criteria}`)}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="criteria_value">{t('admin.fields.criteriaValue')}</label>
              <input
                id="criteria_value"
                className="input"
                type="number"
                min="0"
                disabled={editing.criteria_type === 'manual'}
                value={editing.criteria_value ?? 0}
                onChange={(e) => crud.patch({ criteria_value: Number(e.target.value) })}
              />
            </div>

            <div className="field">
              <label htmlFor="image">{t('admin.fields.image')}</label>
              <input
                id="image"
                className="input"
                type="text"
                dir="ltr"
                value={editing.image ?? ''}
                onChange={(e) => crud.patch({ image: e.target.value })}
              />
            </div>

            <div className="field">
              <label htmlFor="badge-position">{t('admin.fields.position')}</label>
              <input
                id="badge-position"
                className="input"
                type="number"
                min="0"
                value={editing.position ?? 0}
                onChange={(e) => crud.patch({ position: Number(e.target.value) })}
              />
            </div>

            <label className="checkbox" style={{ alignSelf: 'end', paddingBottom: 8 }}>
              <input
                type="checkbox"
                checked={Boolean(editing.is_active)}
                onChange={(e) => crud.patch({ is_active: e.target.checked })}
              />
              {t('admin.fields.active')}
            </label>
          </div>
        </Modal>
      )}
    </>
  )
}
