import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_costs",
  title: "List costs",
  description: "List the signed-in user's costs, optionally filtered by date range or classification (fixed/variable).",
  inputSchema: {
    from: z.string().optional().describe("Start date YYYY-MM-DD (inclusive)."),
    to: z.string().optional().describe("End date YYYY-MM-DD (inclusive)."),
    classification: z.enum(["fixed", "variable"]).optional(),
    limit: z.number().int().min(1).max(500).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ from, to, classification, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    let q = supabaseForUser(ctx)
      .from("costs")
      .select("id,date,amount,category,subcategory,classification,type,description,spread_days")
      .eq("user_id", ctx.getUserId())
      .order("date", { ascending: false })
      .limit(limit ?? 100);
    if (from) q = q.gte("date", from);
    if (to) q = q.lte("date", to);
    if (classification) q = q.eq("classification", classification);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { costs: data ?? [] },
    };
  },
});
