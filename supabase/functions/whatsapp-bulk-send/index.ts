import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';
import { caller, json, wa } from '../_shared/wa.ts';

const Body = z.object({
  template: z.string().regex(/^[a-z0-9_]+$/),
  language: z.string().min(2).max(10),
  recipients: z.array(z.object({ client_id: z.string().uuid().nullable().optional(), name: z.string().min(1).max(100), number: z.string().regex(/^\d{8,15}$/) })).min(1).max(500),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const c = await caller(req);
    if (!c) return json({ error: 'Connexion requise' }, 401);
    if (!c.isAdmin) {
      const { data } = await c.sb.from('feature_requests').select('status').eq('user_id', c.user.id).eq('feature', 'whatsapp_bulk').maybeSingle();
      if (data?.status !== 'approved') return json({ error: 'Accès Premium + requis' }, 403);
    }
    const p = Body.safeParse(await req.json());
    if (!p.success) return json({ error: p.error.issues[0].message }, 400);
    const { template, language, recipients } = p.data;

    // Read the template to know if it expects a {{1}} name parameter
    const t = await wa(`/message_templates?name=${template}&fields=name,status,components`);
    const tpl = t.body?.data?.find((x: any) => x.name === template);
    if (!tpl || tpl.status !== 'APPROVED') return json({ error: 'Modèle non approuvé par Meta' }, 400);
    const bodyText: string = tpl.components?.find((x: any) => x.type === 'BODY')?.text || '';
    const usesName = bodyText.includes('{{1}}');

    const rows: any[] = [];
    for (const r of recipients) {
      const res = await wa('/messages', { method: 'POST', body: JSON.stringify({
        messaging_product: 'whatsapp', to: r.number, type: 'template',
        template: { name: template, language: { code: language }, ...(usesName ? { components: [{ type: 'body', parameters: [{ type: 'text', text: r.name }] }] } : {}) },
      }) });
      rows.push({
        user_id: c.user.id, client_id: r.client_id ?? null, client_name: r.name, phone: r.number, template_name: template,
        status: res.ok ? 'sent' : 'failed',
        error_message: res.ok ? null : (res.body?.error?.error_data?.details || res.body?.error?.message || `Erreur ${res.status}`).slice(0, 500),
        wa_message_id: res.body?.messages?.[0]?.id ?? null,
      });
    }
    await c.sb.from('whatsapp_sends').insert(rows);
    const sent = rows.filter((x) => x.status === 'sent').length;
    await c.sb.from('bulk_message_logs').insert({ user_id: c.user.id, message: `Modèle ${template}`, total: rows.length, sent, failed: rows.length - sent, details: rows.map(({ client_name, status, error_message }) => ({ client_name, status, error_message })) });
    return json({ sent, failed: rows.length - sent, results: rows.map(({ client_name, status, error_message }) => ({ client_name, status, error_message })) });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Erreur' }, 500);
  }
});
