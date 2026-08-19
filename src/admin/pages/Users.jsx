import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api, { errorMessage } from '../../api/client'
import Modal from '../components/Modal.jsx'
import QueryState from '../../components/PageState.jsx'
import { LOCALES, localeCodes } from '../../i18n'

export default function Users() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [term, setTerm] = useState('')
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState(null)

  const key = ['admin', 'users', term]

  const users = useQuery({
    queryKey: key,
    queryFn: async () => (await api.get('/admin/users', { params: term ? { search: term } : {} })).data,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })

  const save = useMutation({
    mutationFn: async (user) => api.put(`/admin/users/${user.id}`, user),
    onSuccess: () => { setEditing(null); setError(null); invalidate() },
    onError: (err) => setError(errorMessage(err)),
  })

  const remove = useMutation({
    mutationFn: async (id) => api.delete(`/admin/users/${id}`),
    onSuccess: invalidate,
    onError: (err) => window.alert(errorMessage(err)),
  })

  const recalculate = useMutation({
    mutationFn: async (id) => api.post(`/admin/users/${id}/recalculate`),
    onSuccess: invalidate,
    onError: (err) => window.alert(errorMessage(err)),
  })

  return (
    <>
      <div className="admin-head">
        <h1>{t('admin.nav.users')}</h1>
        <form
          className="row"
          onSubmit={(event) => { event.preventDefault(); setTerm(search) }}
        >
          <input
            className="input"
            type="search"
            placeholder={t('actions.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 240 }}
          />
          <button type="submit" className="btn btn-secondary">{t('actions.search')}</button>
        </form>
      </div>

      <QueryState query={users} empty={users.data?.data?.length === 0}>
        <div className="table-wrap panel">
          <table className="table">
            <thead>
              <tr>
                <th>{t('admin.fields.name')}</th>
                <th>{t('admin.fields.email')}</th>
                <th>{t('admin.fields.role')}</th>
                <th>{t('admin.fields.level')}</th>
                <th>{t('admin.fields.points')}</th>
                <th>{t('admin.nav.badges')}</th>
                <th>{t('admin.nav.certificates')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.data?.data?.map((user) => (
                <tr key={user.id}>
                  <td>
                    <span className="row" style={{ flexWrap: 'nowrap' }}>
                      <img src={user.avatar || '/assets/avatar-1.svg'} alt="" style={{ width: 30, height: 30, borderRadius: '50%' }} />
                      {user.name}
                    </span>
                  </td>
                  <td dir="ltr">{user.email}</td>
                  <td>
                    <span className={`tag ${user.role === 'admin' ? 'tag-accent' : 'tag-neutral'}`}>
                      {t(`admin.roles.${user.role}`, { defaultValue: user.role })}
                    </span>
                  </td>
                  <td>{user.level?.name ?? '—'}</td>
                  <td className="tnum">{user.points}</td>
                  <td className="tnum">{user.badges_count}</td>
                  <td className="tnum">{user.certificates_count}</td>
                  <td>
                    <span className="row" style={{ justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => recalculate.mutate(user.id)}
                        disabled={recalculate.isPending}
                      >
                        {t('admin.recalculate')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => { setError(null); setEditing({ ...user, level_id: user.level?.id ?? null, password: '' }) }}
                      >
                        {t('actions.edit')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => window.confirm(t('admin.confirmDelete')) && remove.mutate(user.id)}
                      >
                        {t('actions.delete')}
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </QueryState>

      {editing && (
        <Modal
          title={t('actions.edit')}
          onClose={() => setEditing(null)}
          onSubmit={() => save.mutate(editing)}
          busy={save.isPending}
          error={error}
        >
          <div className="form-grid">
            <Field id="u-name" label={t('admin.fields.name')} value={editing.name}
              onChange={(name) => setEditing({ ...editing, name })} />
            <Field id="u-email" label={t('admin.fields.email')} type="email" dir="ltr" value={editing.email}
              onChange={(email) => setEditing({ ...editing, email })} />
            <Field id="u-phone" label={t('admin.fields.phone')} dir="ltr" value={editing.phone}
              onChange={(phone) => setEditing({ ...editing, phone })} />
            <Field id="u-city" label={t('admin.fields.city')} value={editing.city}
              onChange={(city) => setEditing({ ...editing, city })} />

            <div className="field">
              <label htmlFor="u-role">{t('admin.fields.role')}</label>
              <select
                id="u-role"
                className="select"
                value={editing.role}
                onChange={(e) => setEditing({ ...editing, role: e.target.value })}
              >
                <option value="student">{t('admin.roles.student')}</option>
                <option value="admin">{t('admin.roles.admin')}</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="u-locale">{t('admin.fields.locale')}</label>
              <select
                id="u-locale"
                className="select"
                value={editing.locale}
                onChange={(e) => setEditing({ ...editing, locale: e.target.value })}
              >
                {localeCodes.map((code) => (
                  <option key={code} value={code}>{LOCALES[code].name}</option>
                ))}
              </select>
            </div>

            <Field id="u-points" label={t('admin.fields.points')} type="number" value={editing.points}
              onChange={(points) => setEditing({ ...editing, points: Number(points) })} />
            <Field id="u-password" label={t('account.newPassword')} type="password" dir="ltr" value={editing.password}
              onChange={(password) => setEditing({ ...editing, password })} />
          </div>
        </Modal>
      )}
    </>
  )
}

function Field({ id, label, value, onChange, type = 'text', dir }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        className="input"
        type={type}
        dir={dir}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
