import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import useLocalizedQuery from '../api/useLocalizedQuery.js'
import Slider from '../components/Slider.jsx'
import QueryState from '../components/PageState.jsx'

export default function NotificationDetail() {
  const { announcementId } = useParams()
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()

  const announcement = useLocalizedQuery(['announcement', announcementId], `/announcements/${announcementId}`, {
    select: (body) => body.data,
  })

  // Opening one marks it read server-side; refresh the header's unread count.
  useEffect(() => {
    if (announcement.isSuccess) {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
    }
  }, [announcement.isSuccess, queryClient])

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
              <img src={item.image} alt="" style={{ width: '100%' }} />
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
