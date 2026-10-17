/**
 * Normalize a phone number to WhatsApp digits (E.164 without "+").
 * - "+221 77 123 45 67" -> "221771234567"
 * - "00221771234567"   -> "221771234567"
 * - "77 123 45 67" with defaultCode "221" -> "221771234567"
 * Returns null when the number cannot be made precise.
 */
export function normalizePhone(raw: string | null | undefined, defaultCode = '221'): string | null {
  if (!raw) return null;
  let s = String(raw).trim().replace(/[\s\-().]/g, '');
  if (!s) return null;
  let hasCode = false;
  if (s.startsWith('+')) { s = s.slice(1); hasCode = true; }
  else if (s.startsWith('00')) { s = s.slice(2); hasCode = true; }
  if (!/^\d+$/.test(s)) return null;
  if (!hasCode) {
    const code = defaultCode.replace(/\D/g, '');
    if (s.startsWith(code) && s.length >= code.length + 8) {
      // already contains the country code
    } else {
      s = s.replace(/^0+/, '');
      s = code + s;
    }
  }
  if (s.length < 10 || s.length > 15) return null;
  return s;
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
