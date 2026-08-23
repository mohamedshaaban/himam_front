import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import {
  ClassicEditor,
  Autoformat,
  BlockQuote,
  Bold,
  Essentials,
  Heading,
  Italic,
  Link,
  List,
  Paragraph,
  SourceEditing,
  Table,
  TableToolbar,
} from 'ckeditor5'

import 'ckeditor5/ckeditor5.css'

import { useLocales } from '../../i18n/LocaleProvider.jsx'

/**
 * A rich-text editor per language, for content long enough to need structure.
 *
 * One editor instance per locale, each carrying its own direction — an Arabic
 * body has to compose right-to-left even while the dashboard is in English.
 * Instances are keyed by locale so adding a language in the dashboard produces
 * a new editor without remounting the others.
 *
 * Output is HTML. The reader app renders it through a sanitiser rather than
 * trusting it, because this content is written by administrators but read by
 * everyone.
 */
export default function RichTextField({ label, value = {}, onChange }) {
  const { t } = useTranslation()
  const { locales, codes } = useLocales()

  const config = useMemo(
    () => ({
      plugins: [
        Essentials, Paragraph, Heading, Bold, Italic, Link, List,
        BlockQuote, Autoformat, Table, TableToolbar, SourceEditing,
      ],
      toolbar: [
        'heading', '|',
        'bold', 'italic', 'link', '|',
        'bulletedList', 'numberedList', 'blockQuote', 'insertTable', '|',
        'sourceEditing', '|',
        'undo', 'redo',
      ],
      table: { contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'] },
    }),
    [],
  )

  return (
    <div className="mb-3">
      <label className="form-label fw-semibold">{label}</label>

      {codes.map((code) => (
        <div className="mb-2" key={code}>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge text-bg-secondary text-uppercase">{code}</span>
            <small className="text-secondary">{locales[code]?.name}</small>
          </div>

          <div dir={locales[code]?.dir ?? 'ltr'} lang={code}>
            <CKEditor
              editor={ClassicEditor}
              config={{ ...config, language: { ui: 'en', content: code } }}
              data={value?.[code] ?? ''}
              onChange={(_event, editor) => onChange({ ...value, [code]: editor.getData() })}
            />
          </div>
        </div>
      ))}

      <div className="form-text">{t('admin.translationHint')}</div>
    </div>
  )
}
