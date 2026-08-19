import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useLocalizedQuery from '../api/useLocalizedQuery.js'
import Slider from '../components/Slider.jsx'
import QueryState from '../components/PageState.jsx'

export default function Read() {
  const { sectionId } = useParams()
  const { t } = useTranslation()

  const section = useLocalizedQuery(['section', sectionId], `/sections/${sectionId}`)

  const data = section.data?.data
  const meta = section.data?.meta

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

          <Slider screen="books" height={320} />

          <hr className="hr" />

          {/* The section body arrives as plain text with blank-line paragraph
              breaks, so it is split rather than rendered as HTML. */}
          <div className="justify" style={{ fontSize: 19, lineHeight: 2 }}>
            {(data.body ?? '').split(/\n{2,}/).filter(Boolean).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

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
            <Link to={`/sections/${sectionId}/quiz`} className="btn btn-primary">{t('actions.startSectionQuiz')}</Link>
          </div>
        </section>
      )}
    </QueryState>
  )
}
