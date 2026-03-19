import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { summary, businessType, period } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Você é um consultor financeiro inteligente para pequenos negócios brasileiros.
Seu papel é analisar os dados financeiros e gerar insights acionáveis, curtos e claros.
Responda SEMPRE em português brasileiro. Seja direto, empático e prático.
Formato: retorne um JSON com a estrutura: { "insights": ["insight1", "insight2"], "recommendation": "recomendação principal", "prediction": "previsão simples" }
Máximo 3 insights, 1 recomendação, 1 previsão. Cada um com no máximo 2 frases.`;

    const userPrompt = `Dados do negócio (${businessType || 'genérico'}) - ${period || 'semana'}:
- Receita: R$ ${summary.totalRevenue?.toFixed(2) || '0'}
- Custos: R$ ${summary.totalRealCost?.toFixed(2) || '0'}
- Lucro: R$ ${summary.profit?.toFixed(2) || '0'}
- Margem: ${summary.margin?.toFixed(1) || '0'}%
- Ticket médio: R$ ${summary.ticketMedio?.toFixed(2) || '0'}
- Quantidade de vendas: ${summary.totalEntries || 0}

Gere insights, uma recomendação e uma previsão simples.`;

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
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_insights",
              description: "Retorna insights financeiros estruturados",
              parameters: {
                type: "object",
                properties: {
                  insights: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de 1-3 insights curtos sobre o desempenho",
                  },
                  recommendation: {
                    type: "string",
                    description: "Uma recomendação acionável principal",
                  },
                  prediction: {
                    type: "string",
                    description: "Uma previsão simples baseada nos dados",
                  },
                },
                required: ["insights", "recommendation", "prediction"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_insights" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em alguns minutos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao gerar insights" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: try to parse content directly
    const content = data.choices?.[0]?.message?.content || "";
    try {
      const parsed = JSON.parse(content);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({
        insights: ["Não foi possível gerar insights detalhados neste momento."],
        recommendation: "Continue registrando suas vendas e custos diariamente.",
        prediction: "",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("ai-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
