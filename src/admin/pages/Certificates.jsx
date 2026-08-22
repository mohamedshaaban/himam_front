import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api, { errorMessage } from '../../api/client'
import Modal from '../components/Modal.jsx'
import AdminPage from '../components/AdminPage.jsx'
import QueryState from '../../components/PageState.jsx'
import { pickTranslation } from '../translate.js'

export default function Certificates() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()

  const [issuing, setIssuing] = useState(null)
  const [error, setError] = useState(null)

  const key = ['admin', 'certificates']

  const certificates = useQuery({
    queryKey: key,
    queryFn: async () => (await api.get('/admin/certificates')).data,
  })

  const levels = useQuery({
    queryKey: ['admin', 'levels'],
    queryFn: async () => (await api.get('/admin/levels')).data.data,
  })

  const users = useQuery({
    queryKey: ['admin', 'users', ''],
    queryFn: async () => (await api.get('/admin/users')).data.data,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: key })

  const issue = useMutation({
    mutationFn: async (payload) => api.post('/admin/certificates', payload),
    onSuccess: () => { setIssuing(null); setError(null); invalidate() },
    onError: (err) => setError(errorMessage(err)),
  })

  const revoke = useMutation({
    mutationFn: async (id) => api.delete(`/admin/certificates/${id}`),
    onSuccess: invalidate,
    onError: (err) => window.alert(errorMessage(err)),
  })

  return (
    <AdminPage
      title={t('admin.nav.certificates')}
      actions={
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => { setError(null); setIssuing({ user_id: '', level_id: '' }) }}
        >
          {t('admin.issueCertificate')}
        </button>
      }
    >
      <QueryState query={certificates} empty={certificates.data?.data?.length === 0}>
        <div className="card">
          <div className="card-body p-0 table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>{t('admin.fields.serial')}</th>
                  <th>{t('admin.fields.holder')}</th>
                  <th>{t('admin.fields.level')}</th>
                  <th>{t('admin.fields.issuedAt')}</th>
                  <th className="text-end" />
                </tr>
              </thead>
              <tbody>
                {certificates.data?.data?.map((certificate) => (
                  <tr key={certificate.id}>
                    <td dir="ltr"><code>{certificate.serial}</code></td>
                    <td>{certificate.holder?.name}</td>
                    <td>{certificate.level?.name ?? '—'}</td>
                    <td>{certificate.issued_at}</td>
                    <td className="text-end text-nowrap">
                      <a
                        className="btn btn-sm btn-outline-secondary me-1"
                        href={certificate.verification_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t('certificates.verify')}
                      </a>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => window.confirm(t('admin.confirmDelete')) && revoke.mutate(certificate.id)}
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

      {issuing && (
        <Modal
          title={t('admin.issueCertificate')}
          onClose={() => setIssuing(null)}
          onSubmit={() => issue.mutate(issuing)}
          busy={issue.isPending}
          error={error}
          size="md"
        >
          <div className="mb-3">
            <label className="form-label" htmlFor="c-user">{t('admin.fields.holder')}</label>
            <select
              id="c-user"
              className="form-select"
              value={issuing.user_id}
              onChange={(event) => setIssuing({ ...issuing, user_id: event.target.value })}
              required
            >
              <option value="">—</option>
              {users.data?.map((user) => (
                <option key={user.id} value={user.id}>{user.name} — {user.email}</option>
              ))}
            </select>
          </div>

          <div className="mb-1">
            <label className="form-label" htmlFor="c-level">{t('admin.fields.level')}</label>
            <select
              id="c-level"
              className="form-select"
              value={issuing.level_id}
              onChange={(event) => setIssuing({ ...issuing, level_id: event.target.value })}
            >
              <option value="">—</option>
              {levels.data?.map((level) => (
                <option key={level.id} value={level.id}>
                  {pickTranslation(level.name, i18n.language)}
                </option>
              ))}
            </select>
          </div>
        </Modal>
      )}
    </AdminPage>
  )
}
