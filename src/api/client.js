import axios from 'axios'
import i18n from '../i18n'

const TOKEN_KEY = 'himam.token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

/**
 * In development this stays '/api' and Vite proxies it to the local backend.
 * In production VITE_API_URL points at the deployed API instead.
 *
 * The two halves can sit on completely different hosts because authentication
 * is a bearer token rather than a session cookie — there is no same-origin or
 * CSRF requirement to satisfy, only CORS on the API side.
 */
const baseURL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '')

const api = axios.create({
  baseURL,
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // A default for calls that don't pin a language themselves (mutations,
  // mostly). Reads go through useLocalizedQuery, which passes ?lang= explicitly
  // — see the note there for why the ambient value isn't trustworthy on its own.
  config.headers['Accept-Language'] = i18n.language
  config.headers['X-Locale'] = i18n.language

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // An expired or revoked token should drop the reader back to the landing
    // page rather than leaving them on a screen that silently fails to load.
    if (error.response?.status === 401 && getToken()) {
      clearToken()
      window.location.assign('/')
    }

    return Promise.reject(error)
  },
)

/**
 * Pulls a readable message out of a Laravel error response.
 */
export function errorMessage(error, fallback) {
  const data = error?.response?.data

  if (data?.errors) {
    const first = Object.values(data.errors)[0]
    if (Array.isArray(first) && first[0]) return first[0]
  }

  return data?.message || fallback || error?.message || 'Request failed'
}

/**
 * Field-level validation errors, keyed by field name.
 */
export function fieldErrors(error) {
  const errors = error?.response?.data?.errors ?? {}

  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [field, messages[0]]),
  )
}

export default api
