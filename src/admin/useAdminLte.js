import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { isRtl } from '../i18n'

import adminLteLtr from 'admin-lte/dist/css/adminlte.min.css?url'
import adminLteRtl from 'admin-lte/dist/css/adminlte.rtl.min.css?url'

const LINK_ID = 'adminlte-stylesheet'

/**
 * Loads AdminLTE only while the admin area is on screen.
 *
 * AdminLTE bundles Bootstrap, which defines .card, .btn, .table, .progress and
 * .modal — every one of which this project's own design system also defines.
 * Importing it normally would put those rules on every page and restyle the
 * reader app. Attaching the stylesheet on mount and removing it on unmount
 * keeps the two apart, which is safe because the reader and admin views are
 * never rendered at the same time.
 *
 * The link is appended to <head> so it wins over the design system wherever the
 * two genuinely collide inside the admin area.
 */
export default function useAdminLte() {
  const { i18n } = useTranslation()
  const rtl = isRtl(i18n.language)

  useEffect(() => {
    let link = document.getElementById(LINK_ID)

    if (!link) {
      link = document.createElement('link')
      link.id = LINK_ID
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }

    // AdminLTE ships a mirrored build; Bootstrap's logical properties alone
    // don't cover the sidebar and layout offsets.
    link.href = rtl ? adminLteRtl : adminLteLtr

    // AdminLTE's layout keys off body classes rather than a wrapper element.
    const bodyClasses = ['layout-fixed', 'sidebar-expand-lg', 'bg-body-tertiary']
    document.body.classList.add(...bodyClasses)

    return () => {
      document.getElementById(LINK_ID)?.remove()
      document.body.classList.remove(...bodyClasses, 'sidebar-open', 'sidebar-collapse')
    }
  }, [rtl])
}
