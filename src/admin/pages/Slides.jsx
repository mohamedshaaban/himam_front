import { useTranslation } from 'react-i18next'
import useCrud from '../useCrud.js'
import Modal from '../components/Modal.jsx'
import TranslatableField from '../components/TranslatableField.jsx'
import AdminPage from '../components/AdminPage.jsx'
import QueryState from '../../components/PageState.jsx'
import { pickTranslation } from '../translate.js'

// The screens the reader app asks for slides by name.
const SCREENS = ['home', 'books', 'badges', 'certificates', 'honor', 'notifications', 'account']

const EMPTY = { screen: 'home', image: 'assets/banner.svg', caption: {}, href: '', position: 0, is_active: true }

export default function Slides() {
  const { i18n } = useTranslation()
  const crud = useCrud('slides', { emptyRecord: EMPTY })
  const { t, list, editing } = crud

  return (
    <AdminPage
      title={t('admin.nav.slides')}
      actions={
        <button type="button" className="btn btn-primary" onClick={crud.startCreate}>
          {t('admin.newSlide')}
        </button>
      }
    >
      <QueryState query={list} empty={list.data?.length === 0}>
        <div className="card">
          <div className="card-body p-0 table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>{t('admin.fields.screen')}</th>
                  <th>{t('admin.fields.image')}</th>
                  <th>{t('admin.fields.caption')}</th>
                  <th>{t('admin.fields.position')}</th>
                  <th>{t('admin.fields.active')}</th>
                  <th className="text-end" />
                </tr>
              </thead>
              <tbody>
                {list.data?.map((slide) => (
                  <tr key={slide.id}>
                    <td><span className="badge text-bg-primary">{slide.screen}</span></td>
                    <td className="text-truncate" style={{ maxWidth: 240 }} dir="ltr">{slide.image}</td>
                    <td>{pickTranslation(slide.caption, i18n.language)}</td>
                    <td>{slide.position}</td>
                    <td>
                      <span className={`badge ${slide.is_active ? 'text-bg-success' : 'text-bg-secondary'}`}>
                        {slide.is_active ? t('common.yes') : t('common.no')}
                      </span>
                    </td>
                    <td className="text-end text-nowrap">
                      <button type="button" className="btn btn-sm btn-outline-primary me-1" onClick={() => crud.startEdit(slide)}>
                        {t('actions.edit')}
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => crud.confirmRemove(slide.id)}>
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
          title={editing.id ? t('actions.edit') : t('admin.newSlide')}
          onClose={crud.cancel}
          onSubmit={() => crud.save.mutate(editing)}
          busy={crud.save.isPending}
          error={crud.error}
        >
          <div className="row g-3 mb-3">
            <div className="col-sm-6">
              <label className="form-label" htmlFor="screen">{t('admin.fields.screen')}</label>
              <select
                id="screen"
                className="form-select"
                value={editing.screen}
                onChange={(event) => crud.patch({ screen: event.target.value })}
              >
                {SCREENS.map((screen) => <option key={screen} value={screen}>{screen}</option>)}
              </select>
            </div>

            <div className="col-6 col-sm-3">
              <label className="form-label" htmlFor="slide-position">{t('admin.fields.position')}</label>
              <input
                id="slide-position"
                className="form-control"
                type="number"
                min="0"
                value={editing.position ?? 0}
                onChange={(event) => crud.patch({ position: Number(event.target.value) })}
              />
            </div>

            <div className="col-sm-auto d-flex align-items-end">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="slide-active"
                  checked={Boolean(editing.is_active)}
                  onChange={(event) => crud.patch({ is_active: event.target.checked })}
                />
                <label className="form-check-label" htmlFor="slide-active">{t('admin.fields.active')}</label>
              </div>
            </div>

            <div className="col-12">
              <label className="form-label" htmlFor="slide-image">{t('admin.fields.image')}</label>
              <input
                id="slide-image"
                className="form-control"
                type="text"
                dir="ltr"
                value={editing.image ?? ''}
                onChange={(event) => crud.patch({ image: event.target.value })}
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label" htmlFor="slide-href">{t('admin.fields.link')}</label>
              <input
                id="slide-href"
                className="form-control"
                type="text"
                dir="ltr"
                value={editing.href ?? ''}
                onChange={(event) => crud.patch({ href: event.target.value })}
              />
            </div>
          </div>

          <TranslatableField
            label={t('admin.fields.caption')}
            value={editing.caption}
            onChange={(caption) => crud.patch({ caption })}
          />
        </Modal>
      )}
    </AdminPage>
  )
}
