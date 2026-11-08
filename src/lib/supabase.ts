import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { SUPABASE_CLE_PUBLIQUE, SUPABASE_URL } from "./config";

const url = process.env.NEXT_PUBLIC_DEMO === "1" ? "" : SUPABASE_URL;
const cle = SUPABASE_CLE_PUBLIQUE;

/** Vrai quand les clés Supabase sont renseignées. Sinon le site tourne en « mode démo ». */
export const supabaseConfigure = Boolean(url && cle);

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!supabaseConfigure) throw new Error("Supabase n'est pas configuré");
  if (!client) client = createClient(url!, cle!);
  return client;
}
