import { useTranslation } from 'react-i18next'
import useLocalizedQuery from '../api/useLocalizedQuery.js'
import Slider from '../components/Slider.jsx'
import QueryState from '../components/PageState.jsx'

export default function Badges() {
  const { t } = useTranslation()

  const badges = useLocalizedQuery(['badges'], '/badges', { select: (body) => body.data })

  return (
    <>
      <h1 className="page-title">{t('badges.title')}</h1>
      <p className="page-lead">{t('badges.body')}</p>

      <div style={{ marginBottom: 'var(--space-8)' }}>
        <Slider screen="badges" />
      </div>

      <QueryState query={badges} empty={badges.data?.length === 0}>
        <div className="grid-auto" style={{ '--min': '180px' }}>
          {badges.data?.map((badge) => (
            <div
              key={badge.id}
              className={`card badge-tile${badge.earned ? '' : ' badge-tile--locked'}`}
            >
              <img src={badge.image || '/assets/badge.png'} alt="" />
              <div style={{ fontSize: 17 }}>{badge.name}</div>
              <div className="muted" style={{ fontSize: 14 }}>
                {badge.earned ? t('badges.earned') : t('badges.locked')}
              </div>
              <div className="muted" style={{ fontSize: 13 }}>
                {badge.criteria_type === 'manual'
                  ? t('badges.criteria.manual')
                  : t(`badges.criteria.${badge.criteria_type}`, { count: badge.criteria_value })}
              </div>
            </div>
          ))}
        </div>
      </QueryState>
    </>
  )
}
