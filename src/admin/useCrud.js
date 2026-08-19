import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import api, { errorMessage } from '../api/client'

/**
 * The shared plumbing behind every admin list screen: fetch the collection,
 * drive a create/edit dialog, and save or delete against a REST resource.
 *
 * Each screen supplies its own fields and rows; only this wiring is common.
 */
export default function useCrud(resource, { emptyRecord = {}, queryKey } = {}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const key = queryKey ?? ['admin', resource]

  const [editing, setEditing] = useState(null)
  const [error, setError] = useState(null)

  const list = useQuery({
    queryKey: key,
    queryFn: async () => (await api.get(`/admin/${resource}`)).data.data,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: key })

  const save = useMutation({
    mutationFn: async (record) => {
      const payload = { ...record }
      return record.id
        ? (await api.put(`/admin/${resource}/${record.id}`, payload)).data
        : (await api.post(`/admin/${resource}`, payload)).data
    },
    onSuccess: () => {
      setEditing(null)
      setError(null)
      invalidate()
    },
    onError: (err) => setError(errorMessage(err)),
  })

  const remove = useMutation({
    mutationFn: async (id) => api.delete(`/admin/${resource}/${id}`),
    onSuccess: invalidate,
    onError: (err) => window.alert(errorMessage(err)),
  })

  return {
    t,
    list,
    editing,
    error,
    setError,
    invalidate,
    startCreate: () => {
      setError(null)
      setEditing({ ...emptyRecord })
    },
    startEdit: (record) => {
      setError(null)
      setEditing({ ...record })
    },
    cancel: () => {
      setError(null)
      setEditing(null)
    },
    patch: (changes) => setEditing((current) => ({ ...current, ...changes })),
    save,
    remove,
    confirmRemove: (id) => {
      if (window.confirm(t('admin.confirmDelete'))) remove.mutate(id)
    },
  }
}
