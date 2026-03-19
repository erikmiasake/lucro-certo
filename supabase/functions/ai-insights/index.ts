import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { summary, businessType, period, costBreakdown, goals } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Você é um copiloto financeiro inteligente para pequenos negócios brasileiros.
Seu papel é ANTECIPAR problemas, ALERTAR riscos e RECOMENDAR ações específicas com impacto em R$.
Nunca seja genérico. Sempre diga valores em reais e sugira ações práticas.

REGRAS:
- Cada insight deve mencionar um valor em R$ ou % real
- Recomendações devem ser ações que o usuário pode fazer AGORA
- Previsões devem ser baseadas na tendência dos dados
- Se há meta, relate o progresso
- Identifique o PRINCIPAL problema e o PRINCIPAL ponto forte
- Máximo 3 insights, 1 recomendação, 1 previsão. Cada um com no máximo 2 frases.

Retorne usando a tool "generate_insights".`;

    const costInfo = costBreakdown
      ? `\n- Top custo: ${costBreakdown.topCost || 'N/A'} (${costBreakdown.topPercentage || 0}% do total)
- Fixos: R$ ${costBreakdown.totalFixed?.toFixed(2) || '0'} | Variáveis: R$ ${costBreakdown.totalVariable?.toFixed(2) || '0'}`
      : '';

    const goalInfo = goals?.monthlyProfit
      ? `\n- Meta de lucro mensal: R$ ${goals.monthlyProfit.toFixed(2)}
- Progresso: ${goals.progress?.toFixed(0) || 0}%`
      : '';

    const userPrompt = `Dados do negócio (${businessType || 'genérico'}) - ${period || 'semana'}:
- Receita: R$ ${summary.totalRevenue?.toFixed(2) || '0'}
- Custos: R$ ${summary.totalRealCost?.toFixed(2) || '0'}
- Lucro: R$ ${summary.profit?.toFixed(2) || '0'}
- Margem: ${summary.margin?.toFixed(1) || '0'}%
- Quantidade de vendas: ${summary.totalEntries || 0}${costInfo}${goalInfo}

Gere insights ESPECÍFICOS com valores em R$, uma recomendação ACIONÁVEL e uma previsão baseada na tendência.`;

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
              description: "Retorna insights financeiros acionáveis com valores em R$",
              parameters: {
                type: "object",
                properties: {
                  insights: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de 1-3 insights específicos com valores em R$ e ações claras",
                  },
                  recommendation: {
                    type: "string",
                    description: "UMA ação específica que o usuário pode fazer agora, com impacto estimado em R$",
                  },
                  prediction: {
                    type: "string",
                    description: "Previsão baseada na tendência atual, com valor projetado em R$",
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
