/**
 * Country choices for the registration form.
 *
 * Only the ISO 3166-1 codes are stored here; the names come from the browser's
 * own locale data, so the list reads correctly in Arabic, English, French and
 * Urdu — and in any language added later — without four hardcoded translations
 * to maintain.
 */
const CODES = [
  'AF', 'AL', 'DZ', 'AR', 'AM', 'AU', 'AT', 'AZ', 'BH', 'BD', 'BY', 'BE', 'BJ', 'BA', 'BR', 'BN',
  'BG', 'BF', 'BI', 'KH', 'CM', 'CA', 'TD', 'CN', 'KM', 'CI', 'HR', 'CY', 'CZ', 'DK', 'DJ', 'EG',
  'ER', 'EE', 'ET', 'FI', 'FR', 'GM', 'GE', 'DE', 'GH', 'GR', 'GN', 'GW', 'HU', 'IN', 'ID', 'IR',
  'IQ', 'IE', 'IT', 'JP', 'JO', 'KZ', 'KE', 'KW', 'KG', 'LB', 'LR', 'LY', 'MY', 'MV', 'ML', 'MR',
  'MA', 'MZ', 'MM', 'NL', 'NZ', 'NE', 'NG', 'NO', 'OM', 'PK', 'PS', 'PH', 'PL', 'PT', 'QA', 'RO',
  'RU', 'RW', 'SA', 'SN', 'RS', 'SL', 'SG', 'SK', 'SI', 'SO', 'ZA', 'KR', 'ES', 'LK', 'SD', 'SE',
  'CH', 'SY', 'TJ', 'TZ', 'TH', 'TG', 'TN', 'TR', 'TM', 'UG', 'UA', 'AE', 'GB', 'US', 'UZ', 'YE',
  'ZM', 'ZW',
]

/**
 * Localised, alphabetically sorted country list for the given language.
 *
 * Sorting uses the same locale as the labels, so Arabic names order by the
 * Arabic alphabet rather than by their underlying codes.
 */
export function countryOptions(locale = 'ar') {
  let display

  try {
    display = new Intl.DisplayNames([locale], { type: 'region' })
  } catch {
    display = null
  }

  const collator = new Intl.Collator(locale)

  return CODES
    .map((code) => ({ code, name: display?.of(code) ?? code }))
    .sort((a, b) => collator.compare(a.name, b.name))
}

export default CODES
