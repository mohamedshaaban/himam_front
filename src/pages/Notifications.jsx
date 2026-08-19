import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../api/client'
import useLocalizedQuery from '../api/useLocalizedQuery.js'
import Slider from '../components/Slider.jsx'
import QueryState from '../components/PageState.jsx'

export default function Notifications() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()

  const feed = useLocalizedQuery(['announcements'], '/announcements')

  const preferences = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => (await api.get('/notification-preferences')).data.data,
  })

  const togglePreference = useMutation({
    mutationFn: async ({ category, enabled }) =>
      (await api.put('/notification-preferences', { category, enabled })).data.data,
    onSuccess: (data) => {
      queryClient.setQueryData(['notification-preferences'], data)
      // Muting a category removes it from the feed, so refetch that too.
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
    },
  })

  const markAllRead = useMutation({
    mutationFn: async () => api.post('/announcements/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  })

  const items = feed.data?.data ?? []

  return (
    <section className="grid-auto" style={{ '--min': '300px', gap: 'var(--space-8)' }}>
      <div>
        <div className="section-head">
          <h1 className="page-title">{t('notifications.title')}</h1>
          {items.some((item) => !item.read) && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              {t('actions.markAllRead')}
            </button>
          )}
        </div>

        <p className="page-lead">{t('notifications.body')}</p>

        <Slider screen="notifications" height={320} />

        <QueryState query={feed} empty={items.length === 0 ? t('notifications.empty') : false}>
          <ul className="rule-list" style={{ marginTop: 'var(--space-6)' }}>
            {items.map((item) => (
              <li key={item.id}>
                <Link to={`/notifications/${item.id}`} className={`notif-row${item.read ? ' notif-row--read' : ''}`}>
                  <span>
                    {item.tag && <span className="tag tag-accent">{item.tag}</span>}
                    <span className="notif-row__title">{item.title}</span>
                    <span className="notif-row__body">{item.body}</span>
                  </span>
                  <span className="notif-row__time">
                    {item.published_at ? new Date(item.published_at).toLocaleDateString(i18n.language) : ''}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </QueryState>
      </div>

      <aside className="card" style={{ padding: 'var(--space-6)', alignSelf: 'start' }}>
        <h2 style={{ margin: '0 0 var(--space-3)', fontSize: 22 }}>{t('notifications.preferences')}</h2>

        <ul className="list-reset" style={{ display: 'grid', gap: 'var(--space-3)' }}>
          {preferences.data?.map((preference) => (
            <li key={preference.category} style={{ borderBottom: '1px solid var(--color-divider)', paddingBottom: 'var(--space-2)' }}>
              <button
                type="button"
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  background: 'none',
                  border: 0,
                  padding: 0,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 16,
                  color: 'inherit',
                }}
                aria-pressed={preference.enabled}
                onClick={() =>
                  togglePreference.mutate({ category: preference.category, enabled: !preference.enabled })
                }
              >
                <span>{t(`notifications.category.${preference.category}`)}</span>
                <span
                  style={{
                    fontSize: 14,
                    color: preference.enabled ? 'var(--color-accent-700)' : 'var(--color-neutral-600)',
                  }}
                >
                  {preference.enabled ? t('notifications.on') : t('notifications.off')}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </section>
  )
}
