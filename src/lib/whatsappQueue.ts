import { normalizePhone } from './phone';

export interface WhatsAppClient { id: string; name: string; phone?: string | null }
export function prepareWhatsAppQueue(clients: WhatsAppClient[], code: string) {
  const seen = new Set<string>();
  const valid: (WhatsAppClient & { number: string })[] = [];
  const invalid: WhatsAppClient[] = [];
  for (const client of clients) {
    const number = normalizePhone(client.phone, code);
    if (!number) { invalid.push(client); continue; }
    if (seen.has(number)) continue;
    seen.add(number);
    valid.push({ ...client, number });
  }
  return { valid, invalid };
}
export function whatsappLink(number: string, message: string, name: string) {
  const text = encodeURIComponent(message.replace(/\{nom\}/gi, name));
  // wa.me works on phones (opens the app) and computers (opens WhatsApp Web)
  return `https://wa.me/${number}?text=${text}`;
}