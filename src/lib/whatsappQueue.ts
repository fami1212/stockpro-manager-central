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
export function whatsappLink(number: string, message: string, name: string, web = false) {
  const text = encodeURIComponent(message.replace(/\{nom\}/gi, name));
  return `${web ? 'https://web.whatsapp.com/send' : 'whatsapp://send'}?phone=${number}&text=${text}`;
}