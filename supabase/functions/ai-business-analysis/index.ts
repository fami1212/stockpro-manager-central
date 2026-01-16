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
    items: Array<{ product: string; quantity: number }>;
  }>;
  clients: Array<{
    name: string;
    status: string;
    totalOrders: number;
    totalAmount: number;
    lastOrder?: string;
  }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json() as { type: string; data: BusinessData };
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "comprehensive":
        systemPrompt = `Tu es un expert en analyse business et gestion d'inventaire. Analyse les données fournies et donne des insights actionnables en français.
        
Règles:
- Sois concis et précis
- Donne des chiffres concrets
- Priorise les recommandations par impact
- Identifie les opportunités et les risques`;

        userPrompt = `Analyse ces données business et donne-moi:
1. Les 3 insights les plus importants
2. Les 3 recommandations prioritaires
3. Les risques à surveiller
4. Les opportunités à saisir

Données:
- Produits: ${data.products.length} (${data.products.filter(p => p.stock <= p.alertThreshold).length} en alerte stock)
- Ventes: ${data.sales.length} transactions, CA total: ${data.sales.reduce((a, s) => a + s.total, 0).toLocaleString()} CFA
- Clients: ${data.clients.length} (${data.clients.filter(c => c.status === 'Actif').length} actifs)
- Marge moyenne: ${data.products.length > 0 ? Math.round(data.products.reduce((a, p) => a + (p.sellPrice > 0 ? ((p.sellPrice - p.buyPrice) / p.sellPrice) * 100 : 0), 0) / data.products.length) : 0}%
- Panier moyen: ${data.sales.length > 0 ? Math.round(data.sales.reduce((a, s) => a + s.total, 0) / data.sales.length).toLocaleString() : 0} CFA

Produits en alerte: ${data.products.filter(p => p.stock <= p.alertThreshold).map(p => `${p.name} (${p.stock} restants)`).slice(0, 5).join(', ')}

Réponds en JSON avec cette structure exacte:
{
  "insights": [{"title": "...", "description": "...", "impact": "high|medium|low"}],
  "recommendations": [{"title": "...", "action": "...", "priority": "urgent|high|medium"}],
  "risks": [{"title": "...", "description": "...", "severity": "critical|warning|info"}],
  "opportunities": [{"title": "...", "description": "...", "potential": "high|medium|low"}],
  "summary": "..."
}`;
        break;

      case "stock-prediction":
        systemPrompt = `Tu es un expert en gestion de stock et prévisions. Analyse les données et prédis les besoins de réapprovisionnement.`;

        userPrompt = `Analyse le stock et les ventes pour prédire les besoins:

Produits avec leur stock actuel et seuil d'alerte:
${data.products.slice(0, 20).map(p => `- ${p.name}: ${p.stock} unités (seuil: ${p.alertThreshold}), prix vente: ${p.sellPrice} CFA`).join('\n')}

Dernières ventes:
${data.sales.slice(-10).map(s => `- ${new Date(s.date).toLocaleDateString('fr-FR')}: ${s.total.toLocaleString()} CFA`).join('\n')}

Réponds en JSON:
{
  "predictions": [{"product": "...", "currentStock": 0, "predictedDemand": 0, "recommendedOrder": 0, "urgency": "immediate|soon|planned", "daysUntilStockout": 0}],
  "globalTrend": "up|stable|down",
  "summary": "..."
}`;
        break;

      case "client-analysis":
        systemPrompt = `Tu es un expert en relation client et fidélisation. Analyse les données clients pour identifier les opportunités.`;

        userPrompt = `Analyse ces clients pour des opportunités de fidélisation:

${data.clients.slice(0, 20).map(c => `- ${c.name}: ${c.status}, ${c.totalOrders} commandes, ${c.totalAmount?.toLocaleString() || 0} CFA, dernière commande: ${c.lastOrder || 'N/A'}`).join('\n')}

Réponds en JSON:
{
  "segments": [{"name": "...", "count": 0, "characteristics": "...", "strategy": "..."}],
  "atRisk": [{"name": "...", "reason": "...", "action": "..."}],
  "vip": [{"name": "...", "value": 0, "recommendation": "..."}],
  "summary": "..."
}`;
        break;

      default:
        throw new Error("Type d'analyse non supporté");
    }

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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte, réessayez plus tard." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés. Ajoutez des crédits dans les paramètres." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erreur du service IA");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Réponse IA vide");
    }

    // Parse JSON from response
    let parsedContent;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      parsedContent = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      parsedContent = { raw: content, parseError: true };
    }

    return new Response(JSON.stringify({ success: true, data: parsedContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("AI analysis error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Erreur inconnue" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
