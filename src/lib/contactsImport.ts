import Papa from 'papaparse';

export interface ImportedContact {
  name: string;
  phone: string | null;
  email: string | null;
}

/** Parse a vCard (.vcf) file exported from a phone. */
export function parseVCard(text: string): ImportedContact[] {
  const unfolded = text.replace(/\r\n[ \t]/g, '').replace(/\r/g, '');
  const cards = unfolded.split(/BEGIN:VCARD/i).slice(1);
  const out: ImportedContact[] = [];
  for (const card of cards) {
    let name = '', phone: string | null = null, email: string | null = null;
    for (const line of card.split('\n')) {
      const idx = line.indexOf(':');
      if (idx < 0) continue;
      const key = line.slice(0, idx).toUpperCase();
      const val = line.slice(idx + 1).trim();
      if (key.startsWith('FN')) name = val;
      else if (!name && key.startsWith('N') && !key.startsWith('NOTE') && !key.startsWith('NICK')) name = val.split(';').filter(Boolean).reverse().join(' ');
      else if (key.startsWith('TEL') && !phone) phone = val;
      else if (key.startsWith('EMAIL') && !email) email = val;
    }
    if (name || phone) out.push({ name: (name || phone || '').slice(0, 100), phone, email });
  }
  return out;
}

/** Parse a CSV with headers like name/nom, phone/téléphone, email. */
export function parseCSV(text: string): ImportedContact[] {
  const { data } = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true, transformHeader: h => h.trim().toLowerCase() });
  return data.map(row => {
    const get = (...keys: string[]) => Object.entries(row).find(([key]) => keys.some(k => key.includes(k)))?.[1]?.trim() || null;
    const phone = get('tel', 'tél', 'phone', 'mobile');
    return { name: (get('nom', 'name') || phone || '').slice(0, 100), phone, email: get('mail') };
  }).filter(c => c.name || c.phone);
}
