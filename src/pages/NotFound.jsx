import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function NotFound() {
  const { t } = useTranslation()

  return (
    <div className="state">
      <h1 className="page-title" style={{ marginBottom: 'var(--space-4)' }}>{t('common.notFound')}</h1>
      <Link to="/" className="btn btn-primary">{t('common.goHome')}</Link>
    </div>
  )
}
