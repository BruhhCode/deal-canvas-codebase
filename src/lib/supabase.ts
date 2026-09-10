import { createClient } from "@supabase/supabase-js";

const url = import.meta.env["VITE_SUPABASE_URL"];
const anonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"];

/** Browser/SSR-safe Supabase client. Uses the public anon key only — never the service role key. */
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
