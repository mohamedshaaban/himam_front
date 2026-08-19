import { useTranslation } from 'react-i18next'
import useLocalizedQuery from '../api/useLocalizedQuery.js'
import Slider from '../components/Slider.jsx'
import QueryState from '../components/PageState.jsx'

export default function Certificates() {
  const { t } = useTranslation()

  const certificates = useLocalizedQuery(['certificates'], '/certificates', {
    select: (body) => body.data,
  })

  return (
    <>
      <h1 className="page-title">{t('certificates.title')}</h1>
      <p className="page-lead">{t('certificates.body')}</p>

      <div style={{ marginBottom: 'var(--space-8)' }}>
        <Slider screen="certificates" />
      </div>

      <QueryState query={certificates} empty={certificates.data?.length === 0 ? t('certificates.empty') : false}>
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          {certificates.data?.map((certificate) => (
            <article
              key={certificate.id}
              className="card"
              style={{
                padding: 'var(--space-4)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: 'var(--space-6)',
                alignItems: 'center',
              }}
            >
              <div className="plate" style={{ maxWidth: 160 }}>
                <img src="/assets/certificate.png" alt="" />
              </div>

              <div>
                {certificate.level?.name && <span className="tag tag-outline">{certificate.level.name}</span>}
                <h3 style={{ margin: 'var(--space-2) 0', fontSize: 24 }}>
                  {certificate.title ?? t('certificates.certificateTitle')}
                </h3>
                <p className="muted" style={{ margin: 0, fontSize: 15 }}>
                  {t('certificates.date')} {certificate.issued_at}
                </p>
                <p className="muted" style={{ margin: 0, fontSize: 15 }} dir="ltr">
                  {t('certificates.number')} {certificate.serial}
                </p>
                <p style={{ margin: 'var(--space-2) 0 0', fontSize: 14 }}>
                  <a href={certificate.verification_url} target="_blank" rel="noopener noreferrer">
                    {t('certificates.verify')}
                  </a>
                </p>
              </div>

              <img
                src="/assets/qr.png"
                alt="QR"
                style={{ width: 96, height: 96, border: '1px solid var(--color-divider)' }}
              />
            </article>
          ))}
        </div>
      </QueryState>
    </>
  )
}
