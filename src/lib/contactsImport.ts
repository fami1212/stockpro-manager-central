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
  const lines = text.replace(/\r/g, '').split('\n').filter((l) => l.trim());
  if (!lines.length) return [];
  const sep = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(sep).map((h) => h.trim().toLowerCase().replace(/"/g, ''));
  const find = (...keys: string[]) => headers.findIndex((h) => keys.some((k) => h.includes(k)));
  const iName = find('nom', 'name');
  const iPhone = find('tel', 'tél', 'phone', 'mobile');
  const iEmail = find('mail');
  return lines.slice(1).map((l) => {
    const c = l.split(sep).map((v) => v.trim().replace(/^"|"$/g, ''));
    return {
      name: (c[iName] || c[iPhone] || '').slice(0, 100),
      phone: iPhone >= 0 ? c[iPhone] || null : null,
      email: iEmail >= 0 ? c[iEmail] || null : null,
    };
  }).filter((c) => c.name || c.phone);
}
