import { parsePhoneNumberFromString, getCountries, getCountryCallingCode } from "libphonenumber-js/max";

/**
 * Normalize a phone number to WhatsApp digits (E.164 without "+").
 * - "+221 77 123 45 67" -> "221771234567"
 * - "00221771234567"   -> "221771234567"
 * - "77 123 45 67" with defaultCode "221" -> "221771234567"
 * Returns null when the number cannot be made precise.
 */
export function normalizePhone(raw: string | null | undefined, defaultCode = '221'): string | null {
  if (!raw) return null;
  let value = raw.trim().replace(/[\s\-().]/g, '');
  if (value.startsWith('00')) value = '+' + value.slice(2);
  if (!/^\+?\d+$/.test(value)) return null;
  const country = getCountries().find(c => getCountryCallingCode(c) === defaultCode);
  if (!value.startsWith('+') && value.startsWith(defaultCode)) {
    const international = parsePhoneNumberFromString('+' + value);
    if (international?.isValid()) return international.number.slice(1);
  }
  const phone = parsePhoneNumberFromString(value, country);
  return phone?.isValid() ? phone.number.slice(1) : null;
}

export const COUNTRY_CODES = [
  { code: '221', label: 'Sénégal (+221)' },
  { code: '223', label: 'Mali (+223)' },
  { code: '225', label: "Côte d'Ivoire (+225)" },
  { code: '224', label: 'Guinée (+224)' },
  { code: '222', label: 'Mauritanie (+222)' },
  { code: '220', label: 'Gambie (+220)' },
  { code: '226', label: 'Burkina Faso (+226)' },
  { code: '237', label: 'Cameroun (+237)' },
  { code: '212', label: 'Maroc (+212)' },
  { code: '33', label: 'France (+33)' },
  { code: '1', label: 'USA/Canada (+1)' },
];
