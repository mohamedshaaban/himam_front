import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

/**
 * A Bootstrap dialog, driven by React rather than Bootstrap's own JS.
 *
 * Bootstrap ships `.modal { display: none }` and reveals it from JavaScript.
 * Rendering it conditionally instead means adding `d-block` by hand and drawing
 * the backdrop ourselves — which keeps the dialog's visibility owned by React
 * state, with no second source of truth to fall out of step.
 */
export default function Modal({ title, onClose, onSubmit, busy, error, children, submitLabel, size = 'lg' }) {
  const { t } = useTranslation()

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    // Bootstrap's own class, so the scrollbar compensation matches its CSS.
    document.body.classList.add('modal-open')

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.classList.remove('modal-open')
    }
  }, [onClose])

  return createPortal(
    <>
      <div
        className="modal fade show d-block"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.target === event.currentTarget && onClose()}
      >
        <div className={`modal-dialog modal-${size} modal-dialog-centered modal-dialog-scrollable`}>
          <form
            className="modal-content"
            onSubmit={(event) => {
              event.preventDefault()
              onSubmit()
            }}
          >
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label={t('actions.cancel')} />
            </div>

            <div className="modal-body">
              {error && <div className="alert alert-danger" role="alert">{error}</div>}
              {children}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                {t('actions.cancel')}
              </button>
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {busy && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
                {submitLabel ?? t('actions.save')}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="modal-backdrop fade show" />
    </>,
    document.body,
  )
}
