import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api, { errorMessage } from '../../api/client'
import Modal from '../components/Modal.jsx'
import AdminPage from '../components/AdminPage.jsx'
import QueryState from '../../components/PageState.jsx'
import { LOCALES, localeCodes } from '../../i18n'

export default function Users() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [term, setTerm] = useState('')
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState(null)

  const users = useQuery({
    queryKey: ['admin', 'users', term],
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
    <AdminPage
      title={t('admin.nav.users')}
      actions={
        <form
          className="d-flex gap-2"
          onSubmit={(event) => { event.preventDefault(); setTerm(search) }}
        >
          <input
            className="form-control"
            type="search"
            placeholder={t('actions.search')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button type="submit" className="btn btn-outline-secondary text-nowrap">{t('actions.search')}</button>
        </form>
      }
    >
      <QueryState query={users} empty={users.data?.data?.length === 0}>
        <div className="card">
          <div className="card-body p-0 table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>{t('admin.fields.name')}</th>
                  <th>{t('admin.fields.email')}</th>
                  <th>{t('admin.fields.role')}</th>
                  <th>{t('admin.fields.level')}</th>
                  <th>{t('admin.fields.points')}</th>
                  <th>{t('admin.nav.badges')}</th>
                  <th>{t('admin.nav.certificates')}</th>
                  <th className="text-end" />
                </tr>
              </thead>
              <tbody>
                {users.data?.data?.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <span className="d-flex align-items-center gap-2">
                        <img src={user.avatar || '/assets/avatar-1.svg'} alt="" className="rounded-circle" style={{ width: 28, height: 28 }} />
                        {user.name}
                      </span>
                    </td>
                    <td dir="ltr">{user.email}</td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'text-bg-danger' : 'text-bg-secondary'}`}>
                        {t(`admin.roles.${user.role}`, { defaultValue: user.role })}
                      </span>
                    </td>
                    <td>{user.level?.name ?? '—'}</td>
                    <td><strong>{user.points}</strong></td>
                    <td>{user.badges_count}</td>
                    <td>{user.certificates_count}</td>
                    <td className="text-end text-nowrap">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary me-1"
                        onClick={() => recalculate.mutate(user.id)}
                        disabled={recalculate.isPending}
                      >
                        {t('admin.recalculate')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary me-1"
                        onClick={() => { setError(null); setEditing({ ...user, level_id: user.level?.id ?? null, password: '' }) }}
                      >
                        {t('actions.edit')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => window.confirm(t('admin.confirmDelete')) && remove.mutate(user.id)}
                      >
                        {t('actions.delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
          <div className="row g-3">
            <Field id="u-name" label={t('admin.fields.name')} value={editing.name}
              onChange={(name) => setEditing({ ...editing, name })} />
            <Field id="u-email" label={t('admin.fields.email')} type="email" dir="ltr" value={editing.email}
              onChange={(email) => setEditing({ ...editing, email })} />
            <Field id="u-phone" label={t('admin.fields.phone')} dir="ltr" value={editing.phone}
              onChange={(phone) => setEditing({ ...editing, phone })} />
            <Field id="u-city" label={t('admin.fields.city')} value={editing.city}
              onChange={(city) => setEditing({ ...editing, city })} />

            <div className="col-sm-6">
              <label className="form-label" htmlFor="u-role">{t('admin.fields.role')}</label>
              <select
                id="u-role"
                className="form-select"
                value={editing.role}
                onChange={(event) => setEditing({ ...editing, role: event.target.value })}
              >
                <option value="student">{t('admin.roles.student')}</option>
                <option value="admin">{t('admin.roles.admin')}</option>
              </select>
            </div>

            <div className="col-sm-6">
              <label className="form-label" htmlFor="u-locale">{t('admin.fields.locale')}</label>
              <select
                id="u-locale"
                className="form-select"
                value={editing.locale}
                onChange={(event) => setEditing({ ...editing, locale: event.target.value })}
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
    </AdminPage>
  )
}

function Field({ id, label, value, onChange, type = 'text', dir }) {
  return (
    <div className="col-sm-6">
      <label className="form-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        className="form-control"
        type={type}
        dir={dir}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
