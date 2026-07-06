import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function monthRange(month?: string) {
  const now = new Date();
  const [y, m] = month
    ? month.split("-").map(Number)
    : [now.getFullYear(), now.getMonth() + 1];
  const from = `${y}-${String(m).padStart(2, "0")}-01`;
  const last = new Date(y, m, 0).getDate();
  const to = `${y}-${String(m).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
  return { from, to };
}

export default defineTool({
  name: "get_summary",
  title: "Get financial summary",
  description: "Return revenue, costs, profit and margin for the given month (defaults to current month).",
  inputSchema: {
    month: z.string().optional().describe("Month as YYYY-MM. Defaults to current month."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ month }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { from, to } = monthRange(month);
    const sb = supabaseForUser(ctx);
    const uid = ctx.getUserId();
    const [entriesRes, costsRes] = await Promise.all([
      sb.from("entries").select("amount").eq("user_id", uid).gte("date", from).lte("date", to),
      sb.from("costs").select("amount").eq("user_id", uid).gte("date", from).lte("date", to),
    ]);
    if (entriesRes.error) return { content: [{ type: "text", text: entriesRes.error.message }], isError: true };
    if (costsRes.error) return { content: [{ type: "text", text: costsRes.error.message }], isError: true };
    const revenue = (entriesRes.data ?? []).reduce((s, r) => s + Number(r.amount ?? 0), 0);
    const costs = (costsRes.data ?? []).reduce((s, r) => s + Number(r.amount ?? 0), 0);
    const profit = revenue - costs;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const summary = { period: { from, to }, revenue, costs, profit, margin };
    return {
      content: [{ type: "text", text: JSON.stringify(summary) }],
      structuredContent: summary,
    };
  },
});
