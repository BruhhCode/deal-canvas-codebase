import { supabase } from "./supabase";

/**
 * Fire-and-forget: records a real click on a deal's outbound affiliate link
 * via a narrowly-scoped RPC (increment_deal_clicks — see
 * scripts/migration-2026-10-click-tracking.sql) rather than a direct table
 * write, since RLS blocks anon writes to `deals` entirely. The RPC can only
 * ever increment that one counter by 1, nothing else about the row.
 * Never awaited by callers — a tracking failure must not delay or block the
 * actual navigation to the merchant.
 */
export function trackDealClick(dealId: string) {
  if (!supabase) return;
  supabase.rpc("increment_deal_clicks", { p_deal_id: dealId }).then(({ error }) => {
    if (error) console.warn("trackDealClick failed:", error.message);
  });
}
