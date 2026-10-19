import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';
import { caller, json, wa } from '../_shared/wa.ts';

const Create = z.object({
  action: z.literal('create'),
  name: z.string().regex(/^[a-z0-9_]{1,512}$/, 'Nom : minuscules, chiffres et _ uniquement'),
  language: z.string().min(2).max(10),
  category: z.enum(['MARKETING', 'UTILITY']),
  body: z.string().min(10).max(1024),
  example: z.string().min(1).max(60).default('Awa'),
});
const Del = z.object({ action: z.literal('delete'), name: z.string().regex(/^[a-z0-9_]+$/) });
const List = z.object({ action: z.literal('list') });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const c = await caller(req);
    if (!c) return json({ error: 'Connexion requise' }, 401);
    const input = await req.json().catch(() => ({}));
    if (input.action === 'list') {
      List.parse(input);
      const r = await wa('/message_templates?fields=name,status,language,category,components&limit=200');
      if (!r.ok) return json({ error: 'Lecture des modèles impossible', details: r.body }, r.status);
      const data = (r.body.data || []).filter((t: any) => c.isAdmin || t.status === 'APPROVED');
      return json({ data });
    }
    if (!c.isAdmin) return json({ error: 'Réservé à l’administrateur' }, 403);
    if (input.action === 'create') {
      const p = Create.safeParse(input);
      if (!p.success) return json({ error: p.error.issues[0].message }, 400);
      const { name, language, category, body, example } = p.data;
      const hasVar = body.includes('{{1}}');
      const r = await wa('/message_templates', { method: 'POST', body: JSON.stringify({
        name, language, category,
        components: [{ type: 'BODY', text: body, ...(hasVar ? { example: { body_text: [[example]] } } : {}) }],
      }) });
      return r.ok ? json(r.body) : json({ error: r.body?.error?.error_user_msg || r.body?.error?.message || 'Création refusée', details: r.body }, r.status);
    }
    if (input.action === 'delete') {
      const p = Del.safeParse(input);
      if (!p.success) return json({ error: 'Nom invalide' }, 400);
      const r = await wa(`/message_templates?name=${encodeURIComponent(p.data.name)}`, { method: 'DELETE' });
      return r.ok ? json(r.body) : json({ error: r.body?.error?.message || 'Suppression refusée', details: r.body }, r.status);
    }
    return json({ error: 'Action inconnue' }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Erreur' }, 500);
  }
});
