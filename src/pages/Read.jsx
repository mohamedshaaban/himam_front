import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import api from '../api/client'
import useLocalizedQuery from '../api/useLocalizedQuery.js'
import Slider from '../components/Slider.jsx'
import QueryState from '../components/PageState.jsx'
import RichText from '../components/RichText.jsx'
import PdfViewer from '../components/PdfViewer.jsx'

export default function Read() {
  const { sectionId } = useParams()
  const { t } = useTranslation()

  const section = useLocalizedQuery(['section', sectionId], `/sections/${sectionId}`)

  const queryClient = useQueryClient()

  const data = section.data?.data
  const meta = section.data?.meta

  // Opening the section is what counts as reading it, and the API no longer
  // infers that from the fetch — a prefetch or a retry is not a reader.
  useEffect(() => {
    if (!section.isSuccess) return

    let cancelled = false

    api.post(`/sections/${sectionId}/read`)
      .then(() => {
        // The book screen shows which sections are read, so it is now stale.
        if (!cancelled) queryClient.invalidateQueries({ queryKey: ['book'] })
      })
      .catch(() => {
        // Failing to record the read must not stop the reader reading.
      })

    return () => { cancelled = true }
  }, [section.isSuccess, sectionId, queryClient])

  return (
    <QueryState query={section}>
      {data && (
        <section style={{ maxWidth: 720, margin: '0 auto' }}>
          <Link to={`/books/${data.book_id}`} className="btn btn-ghost btn-sm">{t('actions.backToBook')}</Link>

          <p className="kicker" style={{ margin: 'var(--space-4) 0 0' }}>
            {meta?.book?.title} — {data.title}
          </p>
          <h1 className="page-title" style={{ margin: 'var(--space-2) 0 var(--space-4)', fontSize: 'clamp(28px, 3.6vw, 40px)' }}>
            {data.title}
          </h1>

          {/* The decorative slider earns its place on a text section; on a
              document one it only pushes the thing being read below the fold. */}
          {!data.pdf && <Slider screen="books" height={320} />}

          <hr className="hr" />

          <PdfViewer src={data.pdf} title={data.title} />

          {/* Section bodies are authored in a rich-text editor now, but older
              content is still plain text — RichText handles both, and sanitises
              the markup before it reaches the page. */}
          {/* A section may carry both: the document is the reading material
              and the text is the introduction to it. */}
          <RichText
            html={data.body}
            className="justify"
            style={{ fontSize: 19, lineHeight: 2 }}
          />

          <div
            className="row"
            style={{
              marginTop: 'var(--space-8)',
              paddingTop: 'var(--space-4)',
              borderTop: '1px solid var(--color-divider)',
              justifyContent: 'space-between',
            }}
          >
            <span className="muted" style={{ fontSize: 14 }}>
              {t('read.sectionCounter', { current: meta?.position, total: meta?.sections_total })}
            </span>
            {/* The exam is the book's, and it opens only once every section
                has been read — so from here it appears on the last one. */}
            {meta?.book?.quiz_button?.visible && (
              <Link to={`/books/${data.book_id}/quiz`} className="btn btn-primary">
                {meta.book.quiz_button.label}
              </Link>
            )}
          </div>
        </section>
      )}
    </QueryState>
  )
}
