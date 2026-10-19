import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

export const GATEWAY_URL = 'https://connector-gateway.lovable.dev/whatsapp';
export const admin = () => createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
export const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

export async function caller(req: Request) {
  const token = (req.headers.get('Authorization') || '').replace('Bearer ', '');
  if (!token) return null;
  const sb = admin();
  const { data } = await sb.auth.getUser(token);
  if (!data.user) return null;
  const { data: isAdmin } = await sb.rpc('has_role', { _user_id: data.user.id, _role: 'admin' });
  return { user: data.user, isAdmin: !!isAdmin, sb };
}

export async function wa(path: string, init: RequestInit = {}) {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  const WHATSAPP_API_KEY = Deno.env.get('WHATSAPP_API_KEY');
  if (!LOVABLE_API_KEY || !WHATSAPP_API_KEY) throw new Error('WhatsApp non configuré');
  const res = await fetch(`${GATEWAY_URL}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'X-Connection-Api-Key': WHATSAPP_API_KEY, 'Content-Type': 'application/json' },
  });
  const text = await res.text();
  let body: any; try { body = JSON.parse(text); } catch { body = { raw: text }; }
  return { ok: res.ok, status: res.status, body };
}
