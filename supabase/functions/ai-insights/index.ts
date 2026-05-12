import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Require authenticated user (JWT)
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const supabaseAuth = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );
  const token = authHeader.replace("Bearer ", "");
  const { data: userData, error: authError } = await supabaseAuth.auth.getUser(token);
  if (authError || !userData?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }


  try {
    const { financialSummary, businessType, mode, question, appMode } = await req.json();
    // appMode: 'business' | 'personal' (novo, opcional). Compat: deriva de businessType se ausente.
    const resolvedAppMode: 'business' | 'personal' =
      appMode === 'personal' || businessType === 'pessoal' ? 'personal' : 'business';

    if (typeof businessType !== "undefined" && (typeof businessType !== "string" || businessType.length > 100)) {
      return new Response(JSON.stringify({ error: "businessType invalido" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    let safeQuestion: string | undefined;
    if (typeof question !== "undefined" && question !== null) {
      if (typeof question !== "string" || question.trim().length === 0) {
        return new Response(JSON.stringify({ error: "Pergunta invalida" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (question.length > 500) {
        return new Response(JSON.stringify({ error: "Pergunta muito longa (max. 500 caracteres)" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      safeQuestion = question.replace(/[\x00-\x1F\x7F]/g, " ").replace(/`{3,}/g, "---").replace(/<\|/g, "<").replace(/#{3,}/g, "##").trim();
    }
    if (financialSummary && typeof financialSummary !== "object") {
      return new Response(JSON.stringify({ error: "financialSummary invalido" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!financialSummary) {
      return new Response(JSON.stringify({ error: "Dados financeiros não fornecidos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const s = financialSummary;

    // Validate data sufficiency
    if (!s.hasSufficientData) {
      return new Response(JSON.stringify({
        insights: [
          { category: 'receita', text: `Você tem ${s.entries} entrada(s) registrada(s). Registre mais movimentações para uma análise completa.` },
        ],
        recommendation: "Continue registrando suas entradas e saídas diariamente. Com pelo menos 2 dias de dados, a análise ficará precisa.",
        prediction: "",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cap projection growth at 30%
    let cappedProjection = s.monthlyProjection;
    if (cappedProjection && s.revenue > 0) {
      const growthFactor = cappedProjection.revenue / (s.revenue * 4.3);
      if (growthFactor > 1.3) {
        const cappedRevenue = Math.round(s.revenue * 4.3 * 1.3);
        const cappedCost = Math.round(s.costs * 4.3 * 1.3);
        cappedProjection = {
          revenue: cappedRevenue,
          cost: cappedCost,
          profit: cappedRevenue - cappedCost,
          margin: s.margin,
        };
      }
    }

    const isInteractive = mode === 'question' && safeQuestion;

    const systemPrompt = `Você é um consultor financeiro simples para microempreendedores brasileiros (${businessType || 'pequeno negócio'}).

REGRAS ABSOLUTAS — VIOLÁ-LAS É PROIBIDO:

1. USE APENAS os dados abaixo. NÃO invente, NÃO suponha, NÃO extrapole:
   - Faturamento: R$ ${s.revenue}
   - Custos: R$ ${s.costs}
   - Lucro: R$ ${s.profit}
   - Margem: ${s.margin}%
   - Entradas registradas: ${s.entries}
   - Valor médio por entrada: R$ ${s.avgPerEntry}
   - Dados reais: ${s.realDataPercentage}%

2. NUNCA mencione "clientes", "vendas", "ticket". Use "movimentações" e "entradas".

3. Linguagem simples:
   - "quanto sobra" (não "margem operacional")
   - "seus gastos" (não "custos estruturais")
   - "o que entrou" (não "receita bruta")

4. Cada insight DEVE conter pelo menos um valor em R$ ou %.

5. NÃO repita informação entre insights diferentes.

DADOS VALIDADOS DO PERÍODO (${s.period}):
- Faturamento: R$ ${s.revenue}
- Custos: R$ ${s.costs}  
- Lucro: R$ ${s.profit}
- Margem: ${s.margin}%
- Entradas: ${s.entries} | Média: R$ ${s.avgPerEntry}/entrada
- Dias de funcionamento/semana: ${s.operatingDaysPerWeek}
- Dados reais: ${s.realDataPercentage}%
${s.topCost ? `- Maior gasto: ${s.topCost.name} (${s.topCost.percentage}% do total)` : ''}
${s.totalFixed > 0 ? `- Fixos: R$ ${s.totalFixed} | Variáveis: R$ ${s.totalVariable}` : ''}
${s.bestDay ? `- Melhor dia: ${s.bestDay.date} (R$ ${s.bestDay.profit} lucro)` : ''}
${s.worstDay ? `- Pior dia: ${s.worstDay.date} (R$ ${s.worstDay.profit} lucro)` : ''}
- Tendência margem: ${s.marginTrend === 'up' ? 'subindo' : s.marginTrend === 'down' ? 'caindo' : 'estável'}
${cappedProjection ? `- Projeção mensal: R$ ${cappedProjection.revenue} receita, R$ ${cappedProjection.profit} lucro` : ''}
${s.goalMonthlyProfit ? `- Meta: R$ ${s.goalMonthlyProfit}/mês | Progresso: ${s.goalProgress}% | ${s.goalOnTrack ? 'No ritmo' : 'Abaixo'} | ${s.daysRemaining} dias restantes` : ''}
- Lucro acumulado mês: R$ ${s.monthProfit}

${isInteractive ? `O dono perguntou: "${safeQuestion}". Responda APENAS com base nos dados acima. Se a pergunta não puder ser respondida com os dados disponíveis, diga claramente. Use texto simples, sem markdown. Separe ideias em parágrafos curtos. Destaque valores em R$ e percentuais naturalmente no texto. Máximo 4 parágrafos.` : 'Gere a análise usando a tool "generate_insights".'}`;

    const tools = isInteractive ? undefined : [
      {
        type: "function",
        function: {
          name: "generate_insights",
          description: "Retorna análise financeira para microempreendedor",
          parameters: {
            type: "object",
            properties: {
              insight_receita: {
                type: "string",
                description: "1 insight sobre faturamento/movimentações com valor em R$, máximo 2 frases",
              },
              insight_custos: {
                type: "string",
                description: "1 insight sobre gastos com valor em R$, máximo 2 frases",
              },
              insight_lucro: {
                type: "string",
                description: "1 insight sobre lucro/margem com valor em R$ ou %, máximo 2 frases",
              },
              recommendation: {
                type: "string",
                description: "1 ação prática que o dono pode fazer AGORA, baseada nos dados",
              },
            },
            required: ["insight_receita", "insight_custos", "insight_lucro", "recommendation"],
            additionalProperties: false,
          },
        },
      },
    ];

    const requestBody: Record<string, unknown> = {
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: isInteractive ? safeQuestion : `Analise os dados financeiros do período e gere insights usando a tool "generate_insights". Use APENAS os dados fornecidos.` },
      ],
    };

    if (tools) {
      requestBody.tools = tools;
      requestBody.tool_choice = { type: "function", function: { name: "generate_insights" } };
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em alguns minutos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao gerar insights" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();

    // Interactive mode returns plain text
    if (isInteractive) {
      const answer = data.choices?.[0]?.message?.content || "Não foi possível responder com os dados disponíveis.";
      return new Response(JSON.stringify({ answer }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Automatic mode returns structured insights
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      const result = {
        insights: [
          { category: 'receita', text: parsed.insight_receita },
          { category: 'custos', text: parsed.insight_custos },
          { category: 'lucro', text: parsed.insight_lucro },
        ].filter(i => i.text),
        recommendation: parsed.recommendation || '',
      };
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      insights: [{ category: 'receita', text: 'Dados insuficientes para análise.' }],
      recommendation: "Continue registrando suas movimentações diariamente.",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-insights error:", e);
    return new Response(JSON.stringify({ error: "Erro interno. Tente novamente mais tarde." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
