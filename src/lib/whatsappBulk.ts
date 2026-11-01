import { WhatsAppClient } from './whatsappQueue';

export interface BulkRecipient { client_id: string | null; name: string; number: string }

const MAX_RECIPIENTS = 500;

/**
 * Build the payload for the whatsapp-bulk-send edge function.
 * Names are trimmed, capped at 100 chars, deduplicated numbers respected
 * upstream (prepareWhatsAppQueue) and the batch is capped at 500 recipients.
 */
export function buildRecipients(valid: (WhatsAppClient & { number: string })[]): BulkRecipient[] {
  return valid.slice(0, MAX_RECIPIENTS).map((c) => ({
    client_id: c.id || null,
    name: (c.name || 'Client').trim().slice(0, 100),
    number: c.number,
  }));
}

export function summarizeResults(results: { name: string; status: string; error_message?: string | null }[]) {
  const sent = results.filter((r) => r.status === 'sent');
  const failed = results.filter((r) => r.status !== 'sent');
  return { sent: sent.length, failed: failed.length, failedNames: failed.map((r) => `${r.name}${r.error_message ? ` — ${r.error_message}` : ''}`) };
}
