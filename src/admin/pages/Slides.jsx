import { useTranslation } from 'react-i18next'
import useCrud from '../useCrud.js'
import Modal from '../components/Modal.jsx'
import TranslatableField from '../components/TranslatableField.jsx'
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
    <>
      <div className="admin-head">
        <h1>{t('admin.nav.slides')}</h1>
        <button type="button" className="btn btn-primary" onClick={crud.startCreate}>{t('admin.newSlide')}</button>
      </div>

      <QueryState query={list} empty={list.data?.length === 0}>
        <div className="table-wrap panel">
          <table className="table">
            <thead>
              <tr>
                <th>{t('admin.fields.screen')}</th>
                <th>{t('admin.fields.image')}</th>
                <th>{t('admin.fields.caption')}</th>
                <th>{t('admin.fields.position')}</th>
                <th>{t('admin.fields.active')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.data?.map((slide) => (
                <tr key={slide.id}>
                  <td>{slide.screen}</td>
                  <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} dir="ltr">
                    {slide.image}
                  </td>
                  <td>{pickTranslation(slide.caption, i18n.language)}</td>
                  <td className="tnum">{slide.position}</td>
                  <td>{slide.is_active ? t('common.yes') : t('common.no')}</td>
                  <td>
                    <span className="row" style={{ justifyContent: 'flex-end' }}>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => crud.startEdit(slide)}>
                        {t('actions.edit')}
                      </button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => crud.confirmRemove(slide.id)}>
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
          title={editing.id ? t('actions.edit') : t('admin.newSlide')}
          onClose={crud.cancel}
          onSubmit={() => crud.save.mutate(editing)}
          busy={crud.save.isPending}
          error={crud.error}
        >
          <div className="form-grid">
            <div className="field">
              <label htmlFor="screen">{t('admin.fields.screen')}</label>
              <select
                id="screen"
                className="select"
                value={editing.screen}
                onChange={(e) => crud.patch({ screen: e.target.value })}
              >
                {SCREENS.map((screen) => (
                  <option key={screen} value={screen}>{screen}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="slide-position">{t('admin.fields.position')}</label>
              <input
                id="slide-position"
                className="input"
                type="number"
                min="0"
                value={editing.position ?? 0}
                onChange={(e) => crud.patch({ position: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="slide-image">{t('admin.fields.image')}</label>
            <input
              id="slide-image"
              className="input"
              type="text"
              dir="ltr"
              value={editing.image ?? ''}
              onChange={(e) => crud.patch({ image: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="slide-href">{t('admin.fields.link')}</label>
            <input
              id="slide-href"
              className="input"
              type="text"
              dir="ltr"
              value={editing.href ?? ''}
              onChange={(e) => crud.patch({ href: e.target.value })}
            />
          </div>

          <TranslatableField
            label={t('admin.fields.caption')}
            value={editing.caption}
            onChange={(caption) => crud.patch({ caption })}
          />

          <label className="checkbox">
            <input
              type="checkbox"
              checked={Boolean(editing.is_active)}
              onChange={(e) => crud.patch({ is_active: e.target.checked })}
            />
            {t('admin.fields.active')}
          </label>
        </Modal>
      )}
    </>
  )
}
