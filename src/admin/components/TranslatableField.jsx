import { useTranslation } from 'react-i18next'
import { LOCALES, localeCodes } from '../../i18n'

/**
 * One input per language for a translatable content field.
 *
 * The value is the locale => text map the API stores, so an author can fill in
 * whichever languages they have and leave the rest for later — the API falls
 * back per field, not per record.
 *
 * Each input carries its own `dir` and `lang`: an Arabic field has to lay out
 * right-to-left even while the dashboard itself is in English.
 */
export default function TranslatableField({ label, value = {}, onChange, textarea = false, rows = 4 }) {
  const { t } = useTranslation()

  const update = (locale, text) => onChange({ ...value, [locale]: text })

  return (
    <div className="mb-3">
      <label className="form-label fw-semibold">{label}</label>

      {localeCodes.map((code) => (
        <div className="input-group input-group-sm mb-1" key={code}>
          <span className="input-group-text text-uppercase" style={{ minWidth: 52 }}>{code}</span>
          {textarea ? (
            <textarea
              className="form-control"
              rows={rows}
              dir={LOCALES[code].dir}
              lang={code}
              value={value?.[code] ?? ''}
              onChange={(event) => update(code, event.target.value)}
              aria-label={`${label} — ${LOCALES[code].name}`}
            />
          ) : (
            <input
              type="text"
              className="form-control"
              dir={LOCALES[code].dir}
              lang={code}
              value={value?.[code] ?? ''}
              onChange={(event) => update(code, event.target.value)}
              aria-label={`${label} — ${LOCALES[code].name}`}
            />
          )}
        </div>
      ))}

      <div className="form-text">{t('admin.translationHint')}</div>
    </div>
  )
}
