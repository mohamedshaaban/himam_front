import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { mediaUrl } from '../api/media'

/**
 * The section's document, shown inline.
 *
 * Deliberately an <object> over the browser's own PDF viewer rather than a
 * rendering library: every desktop browser already ships one, it handles
 * selection, search, zoom and printing better than anything we would build,
 * and it costs no bundle weight on a screen whose job is reading.
 *
 * What it cannot do is render on most mobile browsers, which refuse to display
 * a PDF in an embedded frame and show nothing at all. That is what the fallback
 * inside <object> is for — the browser renders it only when the embed fails, so
 * a reader on a phone gets a link that opens the file properly instead of a
 * blank rectangle.
 */
export default function PdfViewer({ src, title }) {
  const { t } = useTranslation()
  const [tall, setTall] = useState(false)

  if (!src) return null

  const url = mediaUrl(src)

  return (
    <figure className="pdf" style={{ margin: 'var(--space-6) 0' }}>
      <div className="pdf__frame" style={{ height: tall ? '85vh' : '70vh' }}>
        <object data={url} type="application/pdf" aria-label={title} width="100%" height="100%">
          <div className="pdf__fallback">
            <p style={{ margin: '0 0 var(--space-4)' }}>{t('read.pdfFallback')}</p>
            <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
              {t('read.openPdf')}
            </a>
          </div>
        </object>
      </div>

      <figcaption className="row" style={{ justifyContent: 'space-between', marginTop: 'var(--space-3)', gap: 'var(--space-3)' }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTall((v) => !v)}>
          {tall ? t('read.shrinkPdf') : t('read.expandPdf')}
        </button>

        {/* A download rather than a second viewer: a reader who wants the file
            offline, or whose browser will not embed it, needs the file. */}
        <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
          {t('read.openPdf')}
        </a>
      </figcaption>
    </figure>
  )
}
