import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from '@tanstack/react-query'
import api, { errorMessage } from '../../api/client'
import TranslatableField from '../components/TranslatableField.jsx'
import AdminPage from '../components/AdminPage.jsx'
import QueryState from '../../components/PageState.jsx'

const PLATFORMS = ['x', 'facebook', 'instagram', 'youtube', 'telegram', 'whatsapp', 'linkedin', 'tiktok', 'snapchat']

/**
 * The contact and support details behind /api/contact.
 *
 * A single row rather than a list, so this is a form on a page instead of the
 * table-and-dialog every other admin screen uses.
 */
export default function Contact() {
  const { t } = useTranslation()
  const [form, setForm] = useState(null)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  const query = useQuery({
    queryKey: ['admin', 'contact'],
    queryFn: async () => (await api.get('/admin/contact')).data.data,
  })

  useEffect(() => {
    if (query.data) setForm({ ...query.data, social: query.data.social ?? [] })
  }, [query.data])

  const save = useMutation({
    mutationFn: async (payload) => (await api.put('/admin/contact', payload)).data.data,
    onSuccess: (data) => {
      setForm({ ...data, social: data.social ?? [] })
      setError(null)
      setSaved(true)
    },
    onError: (err) => {
      setError(errorMessage(err))
      setSaved(false)
    },
  })

  const patch = (changes) => {
    setSaved(false)
    setForm((current) => ({ ...current, ...changes }))
  }

  const patchSocial = (index, changes) =>
    patch({ social: form.social.map((row, i) => (i === index ? { ...row, ...changes } : row)) })

  const submit = (event) => {
    event.preventDefault()
    // An empty row would fail validation on the server for a field the author
    // never meant to fill, so blanks are dropped rather than rejected.
    save.mutate({
      ...form,
      social: form.social.filter((row) => row.platform && row.url),
    })
  }

  const text = (name, type = 'text', dir) => (
    <div className="col-md-6">
      <label className="form-label" htmlFor={`contact-${name}`}>{t(`admin.fields.${name}`)}</label>
      <input
        id={`contact-${name}`}
        type={type}
        dir={dir}
        className="form-control"
        value={form[name] ?? ''}
        onChange={(event) => patch({ [name]: event.target.value })}
      />
    </div>
  )

  return (
    <AdminPage title={t('admin.nav.contact')} subtitle={t('admin.contactHint')}>
      <QueryState query={query}>
        {form && (
          <form onSubmit={submit}>
            <div className="card mb-3">
              <div className="card-body">
                <div className="row g-3 mb-3">
                  {text('email', 'email', 'ltr')}
                  {text('website', 'url', 'ltr')}
                  {text('phone', 'text', 'ltr')}
                  {text('whatsapp', 'text', 'ltr')}
                </div>

                <TranslatableField
                  label={t('admin.fields.address')}
                  value={form.address}
                  onChange={(address) => patch({ address })}
                />
                <TranslatableField
                  label={t('admin.fields.workingHours')}
                  value={form.working_hours}
                  onChange={(working_hours) => patch({ working_hours })}
                />
                <TranslatableField
                  label={t('admin.fields.note')}
                  value={form.note}
                  onChange={(note) => patch({ note })}
                  textarea
                  rows={3}
                />
              </div>
            </div>

            <div className="card mb-3">
              <div className="card-header d-flex align-items-center justify-content-between">
                <span className="fw-semibold">{t('admin.fields.social')}</span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => patch({ social: [...form.social, { platform: PLATFORMS[0], url: '' }] })}
                >
                  {t('admin.addLink')}
                </button>
              </div>
              <div className="card-body">
                {form.social.length === 0 && <p className="text-secondary mb-0">{t('common.empty')}</p>}

                {form.social.map((row, index) => (
                  <div className="row g-2 mb-2 align-items-center" key={index}>
                    <div className="col-sm-4">
                      <select
                        className="form-select"
                        value={row.platform}
                        onChange={(event) => patchSocial(index, { platform: event.target.value })}
                        aria-label={t('admin.fields.platform')}
                      >
                        {PLATFORMS.map((platform) => (
                          <option key={platform} value={platform}>{platform}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-sm">
                      <input
                        type="url"
                        dir="ltr"
                        className="form-control"
                        placeholder="https://"
                        value={row.url}
                        onChange={(event) => patchSocial(index, { url: event.target.value })}
                        aria-label={t('admin.fields.url')}
                      />
                    </div>
                    <div className="col-sm-auto">
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => patch({ social: form.social.filter((_, i) => i !== index) })}
                      >
                        {t('actions.delete')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {saved && <div className="alert alert-success">{t('admin.saved')}</div>}

            <button type="submit" className="btn btn-primary" disabled={save.isPending}>
              {save.isPending ? t('common.loading') : t('actions.save')}
            </button>
          </form>
        )}
      </QueryState>
    </AdminPage>
  )
}
