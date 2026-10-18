import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

// Retired: sending is now user-confirmed in their own WhatsApp application.
Deno.serve((req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  return new Response(JSON.stringify({ error: 'L’envoi automatique est désactivé. Utilisez le bouton Message groupé dans Clients, sans clé Meta.' }), {
    status: 410,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
