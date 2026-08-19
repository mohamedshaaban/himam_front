import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useLocalizedQuery from '../api/useLocalizedQuery.js'
import Slider from '../components/Slider.jsx'
import QueryState from '../components/PageState.jsx'

export default function Honor() {
  const { t } = useTranslation()
  const [scope, setScope] = useState('all')

  const board = useLocalizedQuery(['honor', scope], '/honor-board', {
    params: { scope, limit: 20 },
    select: (body) => body.data,
  })

  const scopes = [
    { key: 'all', label: t('honor.scopeAll') },
    { key: 'month', label: t('honor.scopeMonth') },
    { key: 'year', label: t('honor.scopeYear') },
  ]

  return (
    <>
      <h1 className="page-title">{t('honor.title')}</h1>
      <p className="page-lead">{t('honor.body')}</p>

      <div style={{ marginBottom: 'var(--space-8)' }}>
        <Slider screen="honor" />
      </div>

      <div className="row" style={{ marginBottom: 'var(--space-4)' }}>
        {scopes.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`btn btn-sm ${scope === item.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setScope(item.key)}
            aria-pressed={scope === item.key}
          >
            {item.label}
          </button>
        ))}
      </div>

      <QueryState query={board} empty={board.data?.length === 0}>
        <div className="table-wrap">
          <table className="table" style={{ minWidth: 560 }}>
            <thead>
              <tr>
                <th>{t('honor.rank')}</th>
                <th>{t('honor.student')}</th>
                <th>{t('honor.level')}</th>
                <th>{t('honor.books')}</th>
                <th>{t('honor.points')}</th>
              </tr>
            </thead>
            <tbody>
              {board.data?.map((row) => (
                <tr key={row.id}>
                  <td className="tnum" style={{ fontSize: 19, color: 'var(--color-accent-700)' }}>{row.rank}</td>
                  <td>
                    <span className="row" style={{ gap: 'var(--space-3)', flexWrap: 'nowrap' }}>
                      <img src={row.avatar || '/assets/avatar-1.svg'} alt="" style={{ width: 34, height: 34, borderRadius: '50%' }} />
                      <span>{row.name}</span>
                    </span>
                  </td>
                  <td>{row.level}</td>
                  <td className="tnum">{row.books}</td>
                  <td className="tnum">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </QueryState>
    </>
  )
}
