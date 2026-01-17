import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BusinessData {
  products: Array<{
    name: string;
    stock: number;
    alertThreshold: number;
    sellPrice: number;
    buyPrice: number;
    category?: string;
  }>;
  sales: Array<{
    total: number;
    date: string;
    reference?: string;
    items?: Array<{ product: string; quantity: number }>;
  }>;
  clients: Array<{
    name: string;
    status: string;
    totalOrders: number;
    totalAmount: number;
    lastOrder?: string;
  }>;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, data } = await req.json() as { 
      messages: ChatMessage[]; 
      data: BusinessData;
    };
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build business context summary
    const totalRevenue = data.sales.reduce((a, s) => a + (s.total || 0), 0);
    const avgBasket = data.sales.length > 0 ? totalRevenue / data.sales.length : 0;
    const activeClients = data.clients.filter(c => c.status === 'Actif').length;
    const lowStockProducts = data.products.filter(p => (p.stock || 0) <= (p.alertThreshold || 0));
    const avgMargin = data.products.length > 0 
      ? data.products.reduce((a, p) => a + (p.sellPrice > 0 ? ((p.sellPrice - p.buyPrice) / p.sellPrice) * 100 : 0), 0) / data.products.length 
      : 0;

    // Top selling categories
    const topProducts = data.products
      .sort((a, b) => (b.sellPrice * (100 - b.stock)) - (a.sellPrice * (100 - a.stock)))
      .slice(0, 5);

    // Recent sales trend
    const recentSales = data.sales.slice(-10);
    const salesTrend = recentSales.length >= 2 
      ? (recentSales[recentSales.length - 1]?.total || 0) > (recentSales[0]?.total || 0) ? "en hausse" : "en baisse"
      : "stable";

    const systemPrompt = `Tu es un assistant IA expert en gestion commerciale et analyse business. Tu aides les utilisateurs à comprendre leurs données business en temps réel.

CONTEXTE BUSINESS ACTUEL:
- 📦 Produits: ${data.products.length} produits au catalogue
- 🛒 Ventes: ${data.sales.length} ventes, CA total: ${totalRevenue.toLocaleString()} CFA
- 👥 Clients: ${data.clients.length} clients (${activeClients} actifs)
- ⚠️ Alertes stock: ${lowStockProducts.length} produits en rupture ou critique
- 📊 Marge moyenne: ${avgMargin.toFixed(1)}%
- 🛍️ Panier moyen: ${avgBasket.toLocaleString()} CFA
- 📈 Tendance ventes: ${salesTrend}

PRODUITS EN ALERTE STOCK:
${lowStockProducts.slice(0, 10).map(p => `- ${p.name}: ${p.stock} restants (seuil: ${p.alertThreshold})`).join('\n') || 'Aucun'}

TOP 5 PRODUITS:
${topProducts.map(p => `- ${p.name}: ${p.sellPrice.toLocaleString()} CFA, stock: ${p.stock}`).join('\n')}

CLIENTS VIP (top par montant):
${data.clients.sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0)).slice(0, 5).map(c => `- ${c.name}: ${(c.totalAmount || 0).toLocaleString()} CFA, ${c.totalOrders} commandes`).join('\n')}

RÈGLES DE RÉPONSE:
- Réponds toujours en français
- Sois concis et précis (max 3-4 phrases par point)
- Utilise des emojis pour rendre les réponses plus lisibles
- Donne des conseils actionnables quand pertinent
- Si tu ne peux pas répondre avec les données disponibles, dis-le clairement
- Utilise des chiffres concrets des données ci-dessus`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte, réessayez dans quelques minutes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés. Ajoutez des crédits dans les paramètres Lovable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erreur du service IA");
    }

    // Stream the response
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("AI chat error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
