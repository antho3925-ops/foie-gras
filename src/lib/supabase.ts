import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const cle = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Vrai quand les clés Supabase sont renseignées. Sinon le site tourne en « mode démo ». */
export const supabaseConfigure = Boolean(url && cle);

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!supabaseConfigure) throw new Error("Supabase n'est pas configuré");
  if (!client) client = createClient(url!, cle!);
  return client;
}
