import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { summary, businessType, period, costBreakdown, goals, operatingContext, performanceContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const opDays = operatingContext?.operatingDaysPerWeek ?? 6;
    const realPct = operatingContext?.realDataPercentage ?? 100;
    const estimatedDays = operatingContext?.estimatedRevenueDays ?? 0;
    const closedDays = 7 - opDays;

    const perf = performanceContext || {};
    const bestDay = perf.bestDay;
    const worstDay = perf.worstDay;
    const marginTrend = perf.marginTrend || 'stable';
    const projection = perf.monthlyProjection;
    const weeklyEvolution = perf.weeklyEvolution || [];

    // Pre-validate data consistency
    const revenue = Math.round(summary.totalRevenue || 0);
    const cost = Math.round(summary.totalRealCost || 0);
    const profit = Math.round(summary.profit || 0);
    const entries = summary.totalEntries || 0;
    const calculatedProfit = revenue - cost;
    const avgPerClient = entries > 0 ? Math.round(revenue / entries) : 0;
    const margin = revenue > 0 ? Math.round((calculatedProfit / revenue) * 100) : 0;

    // Cap projection growth at 30%
    let cappedProjection = projection;
    if (projection && revenue > 0) {
      const growthFactor = projection.revenue / (revenue * 4.3); // rough month/week
      if (growthFactor > 1.3) {
        cappedProjection = {
          revenue: Math.round(revenue * 4.3 * 1.3),
          cost: Math.round(cost * 4.3 * 1.3),
          profit: Math.round(calculatedProfit * 4.3 * 1.3),
          margin: margin,
        };
      }
    }

    // Detect dominant cost (>25%)
    const dominantCosts = (costBreakdown?.categories || []).filter((c: any) => c.pct >= 25);

    const systemPrompt = `Você é um consultor financeiro simples e confiável para microempreendedores brasileiros (${businessType || 'pequeno negócio'}).
Fale como se estivesse conversando com o dono do negócio. Seja direto, útil e realista.

REGRAS ABSOLUTAS:
1. NUNCA use termos técnicos. Use linguagem simples:
   - "valor médio por cliente" (nunca "ticket médio")
   - "quanto sobra no seu bolso" (nunca "margem operacional")
   - "seus gastos fixos" (nunca "custos fixos estruturais")
   - "o que você faturou" (nunca "receita bruta")

2. NUNCA gere números que conflitem entre si. Os dados corretos são:
   - Faturamento do período: R$ ${revenue}
   - Custos do período: R$ ${cost}
   - Lucro real: R$ ${calculatedProfit}
   - Margem: ${margin}%
   - Vendas/atendimentos: ${entries}
   - Valor médio por cliente: R$ ${avgPerClient}
   Use APENAS esses valores. Não invente outros.

3. Gere EXATAMENTE 3 insights categorizados + 1 ação + 1 previsão:
   - insight_receita: sobre faturamento, volume de clientes, valor por cliente
   - insight_custos: sobre gastos, onde está indo o dinheiro
   - insight_operacao: sobre dias de funcionamento, tendência, padrões
   Cada insight deve ter no máximo 2 frases.

4. NUNCA repita a mesma ideia em insights diferentes.
   ${closedDays > 0 ? `O negócio fecha ${closedDays} dia(s) por semana. Mencione isso NO MÁXIMO 1 vez na análise inteira, se relevante.` : ''}

5. Cada insight deve responder: "O que eu faço com isso?"
   Exemplos bons:
   - "Você fatura R$ ${avgPerClient} por cliente. Para ganhar mais sem aumentar preço, foque em vender mais serviços por visita."
   - "Seus gastos com X representam ${dominantCosts.length > 0 ? dominantCosts[0].pct + '%' : '...'} do total. Vale negociar com fornecedor ou reduzir desperdício."

6. PROJEÇÕES REALISTAS:
   - Base: média atual × dias operacionais do mês
   - Crescimento máximo projetado: 30%
   - Se dados são insuficientes (${realPct < 50 ? 'ATENÇÃO: apenas ' + realPct.toFixed(0) + '% dos dados são reais' : 'dados suficientes'}), diga claramente

7. Se o padrão for "valor alto por cliente + poucas vendas", diga:
   "Você ganha bem por cliente, mas atende poucos. Seu crescimento depende de aumentar o volume."

8. DETECÇÃO AUTOMÁTICA:
   - Melhor dia: ${bestDay ? bestDay.date + ' (R$ ' + bestDay.profit + ' de lucro)' : 'não identificado'}
   - Pior dia: ${worstDay ? worstDay.date + ' (R$ ' + worstDay.profit + ' de lucro)' : 'não identificado'}
   - Tendência: ${marginTrend === 'up' ? 'melhorando' : marginTrend === 'down' ? 'piorando' : 'estável'}
   ${dominantCosts.length > 0 ? '- Custo dominante (>25%): ' + dominantCosts.map((c: any) => c.name + ' (' + c.pct + '%)').join(', ') : ''}

CONTEXTO OPERACIONAL:
- Dias de funcionamento/semana: ${opDays}
- ${realPct.toFixed(0)}% dos dados são reais. ${estimatedDays > 0 ? estimatedDays + ' dias usam estimativas.' : ''}
- Tendência da margem: ${marginTrend === 'up' ? 'subindo' : marginTrend === 'down' ? 'caindo' : 'estável'}

Retorne usando a tool "generate_insights".`;

    const costInfo = costBreakdown
      ? `\n- Maior gasto mensal: ${costBreakdown.topCost || 'N/A'} (${costBreakdown.topPercentage || 0}% do total)
- Gastos fixos/mês: R$ ${Math.round(costBreakdown.totalFixed || 0)} | Gastos variáveis/mês: R$ ${Math.round(costBreakdown.totalVariable || 0)}${
  costBreakdown.categories?.length > 0 
    ? '\n- Detalhamento: ' + costBreakdown.categories.map((c: any) => `${c.name} R$${c.amount} (${c.pct}%)`).join(', ')
    : ''
}`
      : '';

    const goalInfo = goals?.monthlyProfit
      ? `\n- Meta de lucro mensal: R$ ${Math.round(goals.monthlyProfit)}
- Progresso: ${goals.progress?.toFixed(0) || 0}%${goals.onTrack === false ? ' (ABAIXO do esperado)' : goals.onTrack ? ' (no ritmo)' : ''}
- Dias restantes no mês: ${goals.daysRemaining || '?'}`
      : '';

    const perfInfo = [
      bestDay ? `- Melhor dia: ${bestDay.date} com lucro R$ ${bestDay.profit}` : '',
      worstDay ? `- Pior dia: ${worstDay.date} com lucro R$ ${worstDay.profit}` : '',
      cappedProjection ? `- Projeção mensal (limitada a +30%): receita R$ ${cappedProjection.revenue}, custos R$ ${cappedProjection.cost}, lucro R$ ${cappedProjection.profit}` : '',
      weeklyEvolution.length > 0 
        ? `- Evolução da semana: ${weeklyEvolution.map((d: any) => `${d.day}: R$${d.revenue} faturou, R$${d.cost} gastou, R$${d.profit} sobrou`).join(' | ')}`
        : '',
      perf.monthProfit !== undefined ? `- Lucro acumulado do mês: R$ ${perf.monthProfit}` : '',
    ].filter(Boolean).join('\n');

    const userPrompt = `Dados do negócio (${businessType || 'genérico'}) - ${period || 'semana'}:
- Faturamento: R$ ${revenue}
- Gastos: R$ ${cost}
- Sobrou no bolso: R$ ${calculatedProfit}
- Margem: ${margin}%
- Atendimentos/vendas: ${entries}
- Valor médio por cliente: R$ ${avgPerClient}
- Dias de funcionamento/semana: ${opDays}${costInfo}${goalInfo}
${perfInfo ? '\nDESEMPENHO:\n' + perfInfo : ''}

Analise esses dados e gere insights práticos categorizados (receita, custos, operação), uma ação recomendada e uma previsão realista.`;

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
              description: "Retorna análise financeira categorizada para microempreendedor",
              parameters: {
                type: "object",
                properties: {
                  insight_receita: {
                    type: "string",
                    description: "Insight sobre faturamento e clientes, linguagem simples, máximo 2 frases com valor em R$",
                  },
                  insight_custos: {
                    type: "string",
                    description: "Insight sobre gastos e onde o dinheiro está indo, linguagem simples, máximo 2 frases com valor em R$",
                  },
                  insight_operacao: {
                    type: "string",
                    description: "Insight sobre padrões operacionais (dias, tendência), linguagem simples, máximo 2 frases",
                  },
                  recommendation: {
                    type: "string",
                    description: "UMA ação simples e direta que o dono pode fazer AGORA para melhorar o resultado",
                  },
                  prediction: {
                    type: "string",
                    description: "Previsão realista para o mês baseada na média atual × dias operacionais, máximo crescimento +30%",
                  },
                },
                required: ["insight_receita", "insight_custos", "insight_operacao", "recommendation", "prediction"],
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
      
      // Transform to structured format for frontend
      const result = {
        insights: [
          { category: 'receita', text: parsed.insight_receita },
          { category: 'custos', text: parsed.insight_custos },
          { category: 'operacao', text: parsed.insight_operacao },
        ].filter(i => i.text),
        recommendation: parsed.recommendation || '',
        prediction: parsed.prediction || '',
      };
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      insights: [
        { category: 'receita', text: 'Dados insuficientes para análise de receita.' },
      ],
      recommendation: "Continue registrando suas vendas e gastos diariamente para análises mais precisas.",
      prediction: "",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
