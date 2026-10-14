import { useTranslation } from 'react-i18next'
import { useLocales } from '../../i18n/LocaleProvider.jsx'
import MediaInput from './MediaInput.jsx'

/**
 * One file field per language, for media that differs between them.
 *
 * A section's document is the case this exists for: a programme taught in four
 * languages needs four documents, not one translated caption. The value is the
 * same locale => value map every other translatable field stores, so nothing
 * downstream has to know this is a file rather than text.
 *
 * Languages are not required to be filled. The API falls back per field, so a
 * section with only an Arabic document still shows it to an English reader —
 * better than an empty frame while the translation is being prepared.
 */
export default function TranslatableMediaField({ label, value = {}, onChange, kind = 'pdf', help }) {
  const { t } = useTranslation()
  const { locales, codes } = useLocales()

  const update = (code, next) => {
    const merged = { ...value, [code]: next }

    // Drop emptied languages rather than storing a blank, so the fallback can
    // take over instead of resolving to an empty string.
    if (!next) delete merged[code]

    onChange(merged)
  }

  return (
    <div className="mb-3">
      <label className="form-label fw-semibold">{label}</label>

      {codes.map((code) => (
        <div className="border rounded p-2 mb-2" key={code}>
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge text-bg-secondary text-uppercase">{code}</span>
            <small className="text-secondary">{locales[code]?.name}</small>
          </div>

          <MediaInput
            kind={kind}
            label=""
            value={value?.[code] ?? ''}
            onChange={(next) => update(code, next)}
          />
        </div>
      ))}

      <div className="form-text">{help ?? t('admin.translationHint')}</div>
    </div>
  )
}
