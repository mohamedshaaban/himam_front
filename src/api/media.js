import { apiOrigin } from './client'

/**
 * Resolves a stored image reference to a URL the browser can fetch.
 *
 * Three kinds of value end up in these fields and each needs different
 * handling:
 *
 *   https://…/x.jpg    already absolute (remote disk, or an external image)
 *   /storage/x.jpg     uploaded — lives on the API's origin, not this app's
 *   assets/badge.svg   shipped with the frontend build
 *
 * The last case is why this exists at all: the app is served from a sub-path on
 * GitHub Pages, so a leading-slash '/assets/…' resolves against the domain root
 * and 404s. Going through BASE_URL keeps bundled assets working whether the app
 * sits at the root or under /himam_front/.
 */
export function mediaUrl(value) {
  if (!value) return ''

  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:')) {
    return value
  }

  const path = value.replace(/^\/+/, '')

  if (path.startsWith('storage/')) {
    return `${apiOrigin}/${path}`
  }

  // import.meta.env.BASE_URL always ends in a slash.
  return `${import.meta.env.BASE_URL}${path}`
}
