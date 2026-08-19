import { useTranslation } from 'react-i18next'
import { LOCALES, localeCodes } from '../../i18n'

/**
 * One input per language for a translatable content field.
 *
 * The value is the locale => text map the API stores, so an author can fill in
 * whichever languages they have and leave the rest for later — the API falls
 * back per field, not per record.
 */
export default function TranslatableField({ label, value = {}, onChange, textarea = false, rows = 5 }) {
  const { t } = useTranslation()

  const update = (locale, text) => onChange({ ...value, [locale]: text })

  return (
    <div className="trans-field">
      <label style={{ fontSize: 13, color: 'color-mix(in srgb, var(--color-text) 70%, transparent)' }}>
        {label}
      </label>

      {localeCodes.map((code) => (
        <div className="trans-field__row" key={code}>
          <span className="trans-field__locale">{code}</span>
          {textarea ? (
            <textarea
              className="input"
              rows={rows}
              dir={LOCALES[code].dir}
              lang={code}
              value={value?.[code] ?? ''}
              onChange={(e) => update(code, e.target.value)}
              aria-label={`${label} — ${LOCALES[code].name}`}
            />
          ) : (
            <input
              className="input"
              type="text"
              dir={LOCALES[code].dir}
              lang={code}
              value={value?.[code] ?? ''}
              onChange={(e) => update(code, e.target.value)}
              aria-label={`${label} — ${LOCALES[code].name}`}
            />
          )}
        </div>
      ))}

      <p className="muted" style={{ margin: 0, fontSize: 13 }}>{t('admin.translationHint')}</p>
    </div>
  )
}
