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
  const { data: claimsData, error: authError } = await supabaseAuth.auth.getClaims(token);
  if (authError || !claimsData?.claims?.sub) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }


  try {
    const { monthlySummary, businessType } = await req.json();

    if (typeof businessType !== "undefined" && (typeof businessType !== "string" || businessType.length > 100)) {
      return new Response(JSON.stringify({ error: "businessType invalido" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (monthlySummary && typeof monthlySummary !== "object") {
      return new Response(JSON.stringify({ error: "monthlySummary invalido" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!monthlySummary) {
      return new Response(JSON.stringify({ error: "Dados mensais não fornecidos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!monthlySummary.isValid) {
      return new Response(JSON.stringify({ error: monthlySummary.invalidReason || "Dados insuficientes para gerar relatório confiável." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const s = monthlySummary;

    const systemPrompt = `Você é um analista financeiro para microempreendedores brasileiros (${businessType || 'pequeno negócio'}).

REGRAS ABSOLUTAS:
1. USE APENAS os dados abaixo. NÃO invente, NÃO suponha, NÃO extrapole.
2. NUNCA mencione "clientes", "vendas", "ticket". Use "movimentações" e "entradas".
3. Linguagem simples e direta.
4. TODO insight DEVE conter pelo menos um valor em R$ ou %.
5. NÃO repita informações entre seções.

DADOS DO MÊS — ${s.monthLabel}:
- Faturamento: R$ ${s.revenue}
- Custos totais: R$ ${s.costs}
- Lucro: R$ ${s.profit}
- Margem: ${s.margin}%
- Custo sobre receita: ${s.costPercentage}%
- Média diária (receita): R$ ${s.avgDailyRevenue}
- Média diária (custo): R$ ${s.avgDailyCost}
- Média diária (lucro): R$ ${s.avgDailyProfit}
- Dias operacionais: ${s.operatingDays}
- Dias com movimentação: ${s.daysWithData}
${s.bestDay ? `- Melhor dia: ${s.bestDay.date} (lucro R$ ${s.bestDay.profit})` : ''}
${s.worstDay ? `- Pior dia: ${s.worstDay.date} (lucro R$ ${s.worstDay.profit})` : ''}
- Custos fixos: R$ ${s.totalFixed} (${s.fixedPercentage}%)
- Custos variáveis: R$ ${s.totalVariable} (${s.variablePercentage}%)
${s.topCategories?.length > 0 ? `- Maiores gastos: ${s.topCategories.map((c: { name: string; amount: number; percentage: number }) => `${c.name} R$ ${c.amount} (${c.percentage}%)`).join(', ')}` : ''}
${s.goalMonthlyProfit ? `- Meta de lucro: R$ ${s.goalMonthlyProfit} | Progresso: ${s.goalProgress}%` : ''}

Gere a análise usando a tool "generate_report".`;

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
          { role: "user", content: `Analise o mês ${s.monthLabel} e gere o relatório usando a tool "generate_report". Use APENAS os dados fornecidos.` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_report",
              description: "Gera relatório mensal estruturado para microempreendedor",
              parameters: {
                type: "object",
                properties: {
                  summary: {
                    type: "string",
                    description: "Resumo executivo do mês em 2-3 frases com os principais números",
                  },
                  diagnosis: {
                    type: "string",
                    description: "Diagnóstico financeiro em 2-3 frases: saúde do negócio baseada nos dados",
                  },
                  problems: {
                    type: "array",
                    items: { type: "string" },
                    description: "Até 3 problemas identificados, cada um com valor em R$ ou %. Se não houver problemas, array vazio.",
                  },
                  recommendations: {
                    type: "array",
                    items: { type: "string" },
                    description: "Até 3 recomendações práticas e acionáveis baseadas nos dados",
                  },
                  conclusion: {
                    type: "string",
                    description: "Conclusão em 1-2 frases respondendo: como foi o mês e o que fazer agora",
                  },
                },
                required: ["summary", "diagnosis", "problems", "recommendations", "conclusion"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_report" } },
      }),
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
      return new Response(JSON.stringify({ error: "Erro ao gerar relatório" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({
        summary: parsed.summary || '',
        diagnosis: parsed.diagnosis || '',
        problems: (parsed.problems || []).slice(0, 3),
        recommendations: (parsed.recommendations || []).slice(0, 3),
        conclusion: parsed.conclusion || '',
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Não foi possível gerar o relatório." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("monthly-report error:", e);
    return new Response(JSON.stringify({ error: "Erro interno. Tente novamente mais tarde." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
