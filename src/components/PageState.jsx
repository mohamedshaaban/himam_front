import { useTranslation } from 'react-i18next'

export function Loading({ label }) {
  const { t } = useTranslation()

  return (
    <p className="state" role="status" aria-live="polite">
      {label ?? t('common.loading')}
    </p>
  )
}

export function ErrorState({ message, onRetry }) {
  const { t } = useTranslation()

  return (
    <div className="state state--error" role="alert">
      <p>{message ?? t('common.error')}</p>
      {onRetry && (
        <button type="button" className="btn btn-ghost" onClick={onRetry}>
          {t('actions.retry')}
        </button>
      )}
    </div>
  )
}

export function EmptyState({ message }) {
  const { t } = useTranslation()

  return <p className="state">{message ?? t('common.empty')}</p>
}

/**
 * Renders the right state for a react-query result, or the children once data
 * has arrived. Keeps every screen's loading/error handling identical.
 */
export default function QueryState({ query, empty, children }) {
  if (query.isPending) return <Loading />
  if (query.isError) return <ErrorState onRetry={query.refetch} />
  if (empty) return <EmptyState message={typeof empty === 'string' ? empty : undefined} />

  return children
}
