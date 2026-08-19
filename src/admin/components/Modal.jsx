import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

export default function Modal({ title, onClose, onSubmit, busy, error, children, submitLabel }) {
  const { t } = useTranslation()

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    // Stop the page behind from scrolling while the dialog is open.
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [onClose])

  return createPortal(
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
      >
        <h2 className="modal__title">{title}</h2>

        {error && <p className="notice notice--error" role="alert">{error}</p>}

        {children}

        <div className="modal__actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>{t('actions.cancel')}</button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? t('common.loading') : (submitLabel ?? t('actions.save'))}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  )
}
