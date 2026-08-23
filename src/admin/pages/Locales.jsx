import { useTranslation } from 'react-i18next'
import useCrud from '../useCrud.js'
import Modal from '../components/Modal.jsx'
import AdminPage from '../components/AdminPage.jsx'
import QueryState from '../../components/PageState.jsx'
import { useLocales } from '../../i18n/LocaleProvider.jsx'
import { hasBundle } from '../../i18n'

const EMPTY = {
  code: '',
  name: '',
  english_name: '',
  direction: 'ltr',
  is_active: true,
  is_default: false,
  position: 0,
}

export default function Locales() {
  const { t } = useTranslation()
  const { refresh } = useLocales()
  const crud = useCrud('locales', { emptyRecord: EMPTY })
  const { list, editing } = crud

  // Every change here alters what the rest of the dashboard offers, so the
  // shared registry is reloaded rather than waiting for the next page load.
  const saveThenRefresh = async (record) => {
    await crud.save.mutateAsync(record)
    refresh()
  }

  return (
    <AdminPage
      title={t('admin.nav.locales')}
      subtitle={t('admin.locales.help')}
      actions={
        <button type="button" className="btn btn-primary" onClick={crud.startCreate}>
          {t('admin.newLocale')}
        </button>
      }
    >
      <QueryState query={list} empty={list.data?.length === 0}>
        <div className="card">
          <div className="card-body p-0 table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>{t('admin.fields.code')}</th>
                  <th>{t('admin.fields.name')}</th>
                  <th>{t('admin.fields.englishName')}</th>
                  <th>{t('admin.fields.direction')}</th>
                  <th>{t('admin.fields.interface')}</th>
                  <th>{t('admin.fields.active')}</th>
                  <th>{t('admin.fields.default')}</th>
                  <th className="text-end" />
                </tr>
              </thead>
              <tbody>
                {list.data?.map((locale) => (
                  <tr key={locale.id}>
                    <td><code>{locale.code}</code></td>
                    <td dir={locale.direction}>{locale.name}</td>
                    <td>{locale.english_name}</td>
                    <td><span className="badge text-bg-light text-uppercase">{locale.direction}</span></td>
                    <td>
                      {/* Content is translatable the moment a language exists;
                          the interface needs a bundle shipped with the build. */}
                      <span className={`badge ${hasBundle(locale.code) ? 'text-bg-success' : 'text-bg-warning'}`}>
                        {hasBundle(locale.code) ? t('admin.locales.translated') : t('admin.locales.fallsBack')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${locale.is_active ? 'text-bg-success' : 'text-bg-secondary'}`}>
                        {locale.is_active ? t('common.yes') : t('common.no')}
                      </span>
                    </td>
                    <td>{locale.is_default && <span className="badge text-bg-primary">★</span>}</td>
                    <td className="text-end text-nowrap">
                      <button type="button" className="btn btn-sm btn-outline-primary me-1" onClick={() => crud.startEdit(locale)}>
                        {t('actions.edit')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => crud.confirmRemove(locale.id)}
                        disabled={locale.is_default}
                        title={locale.is_default ? t('admin.locales.defaultLocked') : undefined}
                      >
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
          title={editing.id ? t('actions.edit') : t('admin.newLocale')}
          onClose={crud.cancel}
          onSubmit={() => saveThenRefresh(editing)}
          busy={crud.save.isPending}
          error={crud.error}
          size="md"
        >
          <div className="row g-3">
            <div className="col-sm-4">
              <label className="form-label" htmlFor="loc-code">{t('admin.fields.code')}</label>
              <input
                id="loc-code"
                className="form-control"
                dir="ltr"
                placeholder="tr"
                value={editing.code ?? ''}
                onChange={(event) => crud.patch({ code: event.target.value.toLowerCase() })}
                disabled={Boolean(editing.id)}
                required
              />
              <div className="form-text">{t('admin.locales.codeHelp')}</div>
            </div>

            <div className="col-sm-8">
              <label className="form-label" htmlFor="loc-name">{t('admin.fields.name')}</label>
              <input
                id="loc-name"
                className="form-control"
                dir={editing.direction}
                placeholder="Türkçe"
                value={editing.name ?? ''}
                onChange={(event) => crud.patch({ name: event.target.value })}
                required
              />
              <div className="form-text">{t('admin.locales.nameHelp')}</div>
            </div>

            <div className="col-sm-6">
              <label className="form-label" htmlFor="loc-en">{t('admin.fields.englishName')}</label>
              <input
                id="loc-en"
                className="form-control"
                dir="ltr"
                placeholder="Turkish"
                value={editing.english_name ?? ''}
                onChange={(event) => crud.patch({ english_name: event.target.value })}
                required
              />
            </div>

            <div className="col-sm-6">
              <label className="form-label" htmlFor="loc-dir">{t('admin.fields.direction')}</label>
              <select
                id="loc-dir"
                className="form-select"
                value={editing.direction}
                onChange={(event) => crud.patch({ direction: event.target.value })}
              >
                <option value="ltr">{t('admin.locales.ltr')}</option>
                <option value="rtl">{t('admin.locales.rtl')}</option>
              </select>
            </div>

            <div className="col-sm-4">
              <label className="form-label" htmlFor="loc-pos">{t('admin.fields.position')}</label>
              <input
                id="loc-pos"
                className="form-control"
                type="number"
                min="0"
                value={editing.position ?? 0}
                onChange={(event) => crud.patch({ position: Number(event.target.value) })}
              />
            </div>

            <div className="col-sm-8 d-flex align-items-end gap-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="loc-active"
                  checked={Boolean(editing.is_active)}
                  onChange={(event) => crud.patch({ is_active: event.target.checked })}
                />
                <label className="form-check-label" htmlFor="loc-active">{t('admin.fields.active')}</label>
              </div>

              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="loc-default"
                  checked={Boolean(editing.is_default)}
                  onChange={(event) => crud.patch({ is_default: event.target.checked })}
                />
                <label className="form-check-label" htmlFor="loc-default">{t('admin.fields.default')}</label>
              </div>
            </div>

            <div className="col-12">
              <div className="alert alert-info mb-0 small">{t('admin.locales.note')}</div>
            </div>
          </div>
        </Modal>
      )}
    </AdminPage>
  )
}
