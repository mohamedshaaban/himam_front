import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createPortal } from 'react-dom'
import api, { errorMessage } from '../../api/client'

/**
 * An image field: shows the current picture, uploads a new one, or picks from
 * what has already been uploaded.
 *
 * The stored value stays a plain string so nothing else has to change — the
 * models, the API and the reader app all still just hold a URL. This only
 * replaces the way an administrator arrives at that string.
 */
export default function MediaInput({ label, value, onChange, help }) {
  const { t } = useTranslation()
  const [browsing, setBrowsing] = useState(false)
  const [error, setError] = useState(null)
  const fileRef = useRef(null)

  const upload = useMutation({
    mutationFn: async (file) => {
      const body = new FormData()
      body.append('file', file)
      // Let the browser set the multipart boundary; forcing the header breaks it.
      const { data } = await api.post('/admin/media', body)
      return data.data
    },
    onSuccess: (media) => {
      setError(null)
      onChange(media.url)
    },
    onError: (err) => setError(errorMessage(err)),
  })

  const pick = (event) => {
    const file = event.target.files?.[0]
    if (file) upload.mutate(file)
    // Reset so choosing the same file twice still fires a change.
    event.target.value = ''
  }

  return (
    <div className="mb-3">
      <label className="form-label fw-semibold">{label}</label>

      <div className="d-flex align-items-start gap-3">
        <div
          className="border rounded d-flex align-items-center justify-content-center bg-body-tertiary flex-shrink-0"
          style={{ width: 96, height: 96, overflow: 'hidden' }}
        >
          {value ? (
            <img src={value} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          ) : (
            <span className="text-secondary small">—</span>
          )}
        </div>

        <div className="flex-grow-1">
          <div className="d-flex flex-wrap gap-2 mb-2">
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => fileRef.current?.click()}
              disabled={upload.isPending}
            >
              {upload.isPending && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
              {t('admin.media.upload')}
            </button>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setBrowsing(true)}>
              {t('admin.media.browse')}
            </button>
            {value && (
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onChange('')}>
                {t('admin.media.clear')}
              </button>
            )}
          </div>

          {/* The path stays editable: existing records point at bundled assets
              like assets/badge.png that were never uploaded through here. */}
          <input
            type="text"
            className="form-control form-control-sm"
            dir="ltr"
            value={value ?? ''}
            onChange={(event) => onChange(event.target.value)}
            placeholder="assets/banner.svg"
          />

          {help && <div className="form-text">{help}</div>}
          {error && <div className="text-danger small mt-1">{error}</div>}
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={pick} />

      {browsing && (
        <MediaBrowser
          onClose={() => setBrowsing(false)}
          onPick={(url) => { onChange(url); setBrowsing(false) }}
        />
      )}
    </div>
  )
}

function MediaBrowser({ onClose, onPick }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const media = useQuery({
    queryKey: ['admin', 'media'],
    queryFn: async () => (await api.get('/admin/media')).data.data,
  })

  const remove = useMutation({
    mutationFn: async (path) => api.delete('/admin/media', { data: { path } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'media'] }),
    onError: (err) => window.alert(errorMessage(err)),
  })

  return createPortal(
    <>
      <div
        className="modal fade show d-block"
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.target === event.currentTarget && onClose()}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{t('admin.media.library')}</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label={t('actions.cancel')} />
            </div>

            <div className="modal-body">
              {media.isPending && <p className="text-secondary mb-0">{t('common.loading')}</p>}
              {media.isError && <p className="text-danger mb-0">{t('common.error')}</p>}
              {media.data?.length === 0 && <p className="text-secondary mb-0">{t('admin.media.empty')}</p>}

              <div className="row g-2">
                {media.data?.map((file) => (
                  <div className="col-6 col-md-3" key={file.path}>
                    <div className="card h-100">
                      <button
                        type="button"
                        className="btn p-2 border-0"
                        onClick={() => onPick(file.url)}
                        title={file.name}
                      >
                        <img
                          src={file.url}
                          alt=""
                          className="w-100"
                          style={{ height: 90, objectFit: 'contain' }}
                        />
                      </button>
                      <div className="card-footer p-1 d-flex justify-content-between align-items-center gap-1">
                        <small className="text-truncate" title={file.name}>{file.name}</small>
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-danger p-0"
                          onClick={() => window.confirm(t('admin.confirmDelete')) && remove.mutate(file.path)}
                          aria-label={t('actions.delete')}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>{t('actions.cancel')}</button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>,
    document.body,
  )
}
