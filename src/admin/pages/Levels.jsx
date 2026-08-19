import { useTranslation } from 'react-i18next'
import useCrud from '../useCrud.js'
import Modal from '../components/Modal.jsx'
import TranslatableField from '../components/TranslatableField.jsx'
import QueryState from '../../components/PageState.jsx'
import { pickTranslation } from '../translate.js'

const EMPTY = { name: {}, description: {}, position: 0, is_active: true }

export default function Levels() {
  const { i18n } = useTranslation()
  const crud = useCrud('levels', { emptyRecord: EMPTY })
  const { t, list, editing } = crud

  return (
    <>
      <div className="admin-head">
        <h1>{t('admin.nav.levels')}</h1>
        <button type="button" className="btn btn-primary" onClick={crud.startCreate}>{t('admin.newLevel')}</button>
      </div>

      <QueryState query={list} empty={list.data?.length === 0}>
        <div className="table-wrap panel">
          <table className="table">
            <thead>
              <tr>
                <th>{t('admin.fields.name')}</th>
                <th>{t('admin.fields.position')}</th>
                <th>{t('admin.nav.books')}</th>
                <th>{t('admin.fields.active')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.data?.map((level) => (
                <tr key={level.id}>
                  <td>{pickTranslation(level.name, i18n.language)}</td>
                  <td className="tnum">{level.position}</td>
                  <td className="tnum">{level.books_count}</td>
                  <td>{level.is_active ? t('common.yes') : t('common.no')}</td>
                  <td>
                    <span className="row" style={{ justifyContent: 'flex-end' }}>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => crud.startEdit(level)}>
                        {t('actions.edit')}
                      </button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => crud.confirmRemove(level.id)}>
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

          <div className="form-grid">
            <div className="field">
              <label htmlFor="position">{t('admin.fields.position')}</label>
              <input
                id="position"
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
