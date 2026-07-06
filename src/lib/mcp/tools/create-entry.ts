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
  name: "create_entry",
  title: "Create revenue entry",
  description: "Insert a revenue (income) entry for the signed-in user.",
  inputSchema: {
    amount: z.number().describe("Amount in the user's currency."),
    date: z.string().describe("Date YYYY-MM-DD."),
    category: z.string().optional(),
    description: z.string().optional(),
    source: z.string().optional().describe("Origin: manual, auto, estimated."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  handler: async ({ amount, date, category, description, source }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await supabaseForUser(ctx)
      .from("entries")
      .insert({ user_id: ctx.getUserId(), amount, date, category, description, source: source ?? "manual" })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { entry: data },
    };
  },
});
