import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

function normalizePhone(raw: string | null, defaultCode: string): string | null {
  if (!raw) return null;
  let s = raw.trim().replace(/[\s\-().]/g, '');
  let hasCode = false;
  if (s.startsWith('+')) { s = s.slice(1); hasCode = true; }
  else if (s.startsWith('00')) { s = s.slice(2); hasCode = true; }
  if (!/^\d+$/.test(s)) return null;
  if (!hasCode) {
    const code = defaultCode.replace(/\D/g, '');
    if (!(s.startsWith(code) && s.length >= code.length + 8)) s = code + s.replace(/^0+/, '');
  }
  return s.length >= 10 && s.length <= 15 ? s : null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Non autorisé' }, 401);
    const url = Deno.env.get('SUPABASE_URL')!;
    const userClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
    const { data: u, error: ue } = await userClient.auth.getUser(authHeader.replace('Bearer ', ''));
    if (ue || !u?.user) return json({ error: 'Non autorisé' }, 401);
    const userId = u.user.id;

    const body = await req.json().catch(() => ({}));
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!message || message.length > 1000) return json({ error: 'Message requis (1000 caractères max)' }, 400);
    const clientIds: string[] | null = Array.isArray(body.clientIds) ? body.clientIds.filter((x: unknown) => typeof x === 'string').slice(0, 1000) : null;

    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data: isAdmin } = await admin.rpc('has_role', { _user_id: userId, _role: 'admin' });
    if (!isAdmin) {
      const { data: fr } = await admin.from('feature_requests').select('status').eq('user_id', userId).eq('feature', 'whatsapp_bulk').maybeSingle();
      if (fr?.status !== 'approved') return json({ error: "Fonctionnalité Premium + non activée. Faites une demande d'accès." }, 403);
    }

    const { data: settings } = await admin.from('whatsapp_settings').select('*').eq('user_id', userId).maybeSingle();
    if (!settings) return json({ error: 'Connectez d\'abord votre WhatsApp Business dans les réglages.' }, 400);

    let q = admin.from('clients').select('id, name, phone').eq('user_id', userId).not('phone', 'is', null);
    if (clientIds?.length) q = q.in('id', clientIds);
    const { data: clients, error: ce } = await q;
    if (ce) throw ce;

    const results: { name: string; phone: string | null; ok: boolean; error?: string }[] = [];
    for (const c of clients || []) {
      const to = normalizePhone(c.phone, settings.default_country_code || '221');
      if (!to) { results.push({ name: c.name, phone: c.phone, ok: false, error: 'Numéro imprécis (indicatif manquant ou invalide)' }); continue; }
      const text = message.replace(/\{nom\}/gi, c.name);
      const payload = settings.template_name
        ? { messaging_product: 'whatsapp', to, type: 'template', template: { name: settings.template_name, language: { code: settings.template_language || 'fr' }, components: [{ type: 'body', parameters: [{ type: 'text', text }] }] } }
        : { messaging_product: 'whatsapp', to, type: 'text', text: { body: text } };
      const r = await fetch(`https://graph.facebook.com/v21.0/${encodeURIComponent(settings.phone_number_id)}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${settings.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (r.ok) results.push({ name: c.name, phone: to, ok: true });
      else {
        const t = await r.text();
        let msg = t;
        try { msg = JSON.parse(t)?.error?.message || t; } catch { /* keep raw */ }
        results.push({ name: c.name, phone: to, ok: false, error: msg.slice(0, 300) });
      }
    }

    const sent = results.filter((r) => r.ok).length;
    await admin.from('bulk_message_logs').insert({ user_id: userId, message, total: results.length, sent, failed: results.length - sent, details: results });
    return json({ total: results.length, sent, failed: results.length - sent, results });
  } catch (e) {
    console.error('whatsapp-bulk-send error', e);
    return json({ error: e instanceof Error ? e.message : 'Erreur inconnue' }, 500);
  }
});
