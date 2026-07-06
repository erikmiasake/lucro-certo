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
  name: "create_cost",
  title: "Create cost",
  description: "Insert a cost (expense) for the signed-in user.",
  inputSchema: {
    amount: z.number(),
    date: z.string().describe("Date YYYY-MM-DD."),
    classification: z.enum(["fixed", "variable"]).describe("Fixed spreads over spread_days; variable is a one-off."),
    category: z.string().optional(),
    subcategory: z.string().optional(),
    description: z.string().optional(),
    type: z.string().optional(),
    spread_days: z.number().int().min(1).max(365).optional().describe("For fixed costs, number of days to spread (default 30)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  handler: async ({ amount, date, classification, category, subcategory, description, type, spread_days }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await supabaseForUser(ctx)
      .from("costs")
      .insert({
        user_id: ctx.getUserId(),
        amount, date, classification,
        category, subcategory, description,
        type: type ?? classification,
        spread_days: spread_days ?? (classification === "fixed" ? 30 : 1),
      })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { cost: data },
    };
  },
});
