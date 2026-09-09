import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import api from '../api/client'
import useLocalizedQuery from '../api/useLocalizedQuery.js'
import Slider from '../components/Slider.jsx'
import QueryState from '../components/PageState.jsx'
import { mediaUrl } from '../api/media'

export default function NotificationDetail() {
  const { announcementId } = useParams()
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()

  const announcement = useLocalizedQuery(['announcement', announcementId], `/announcements/${announcementId}`, {
    select: (body) => body.data,
  })

  // Mark it read explicitly rather than leaning on the GET's side effect: a
  // cached or repeated read may never reach the server, and this is the moment
  // we actually know the reader has opened it.
  useEffect(() => {
    if (!announcement.isSuccess) return

    let cancelled = false

    api.post(`/announcements/${announcementId}/read`)
      .then(() => {
        if (!cancelled) queryClient.invalidateQueries({ queryKey: ['announcements'] })
      })
      .catch(() => {
        // Failing to record the read shouldn't stop the reader seeing the
        // notification they just opened.
      })

    return () => { cancelled = true }
  }, [announcement.isSuccess, announcementId, queryClient])

  const item = announcement.data

  return (
    <QueryState query={announcement}>
      {item && (
        <section style={{ maxWidth: 760 }}>
          <Link to="/notifications" className="btn btn-ghost btn-sm">{t('actions.back')}</Link>

          {item.tag && (
            <span className="tag tag-accent" style={{ display: 'inline-block', marginTop: 'var(--space-4)' }}>
              {item.tag}
            </span>
          )}

          <h1 className="page-title" style={{ margin: 'var(--space-3) 0 var(--space-2)', fontSize: 'clamp(28px, 3.6vw, 40px)' }}>
            {item.title}
          </h1>

          <p className="muted" style={{ margin: '0 0 var(--space-6)', fontSize: 15 }}>
            {item.published_at ? new Date(item.published_at).toLocaleDateString(i18n.language) : ''}
          </p>

          {item.image ? (
            <div className="plate">
              <img src={mediaUrl(item.image)} alt="" style={{ width: '100%' }} />
            </div>
          ) : (
            <Slider screen="notifications" height={320} />
          )}

          <p className="justify muted" style={{ marginTop: 'var(--space-6)' }}>{item.body}</p>
        </section>
      )}
    </QueryState>
  )
}
