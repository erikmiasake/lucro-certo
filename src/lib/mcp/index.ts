import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listEntries from "./tools/list-entries";
import createEntry from "./tools/create-entry";
import listCosts from "./tools/list-costs";
import createCost from "./tools/create-cost";
import getSummary from "./tools/get-summary";

// The OAuth issuer MUST be the direct Supabase host built from the project ref.
// Vite inlines VITE_SUPABASE_PROJECT_ID at build time so this stays import-safe.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "lucro-real-mcp",
  title: "Lucro Real",
  version: "0.1.0",
  instructions:
    "Tools for Lucro Real, a financial tracker. Use `get_summary` for monthly revenue/costs/profit/margin. Use `list_entries` / `list_costs` to read movements and `create_entry` / `create_cost` to add them for the signed-in user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listEntries, createEntry, listCosts, createCost, getSummary],
});
