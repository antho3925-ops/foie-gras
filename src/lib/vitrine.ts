import { createClient } from "@supabase/supabase-js";
import { PRODUITS_DEFAUT, REGLAGES_DEFAUT } from "./defauts";
import type { Produit, Reglages } from "./types";

/** Lecture côté serveur des réglages et produits pour la page publique */
export async function chargerVitrine(): Promise<{ reglages: Reglages; produits: Produit[] }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const cle = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !cle) return { reglages: REGLAGES_DEFAUT, produits: PRODUITS_DEFAUT };
  try {
    const sb = createClient(url, cle, { auth: { persistSession: false } });
    const [r, p] = await Promise.all([
      sb.from("reglages").select("*").eq("id", 1).single(),
      sb.from("produits").select("*").eq("actif", true).order("ordre"),
    ]);
    return {
      reglages: (r.data as Reglages) ?? REGLAGES_DEFAUT,
      produits: p.data?.length ? (p.data as Produit[]) : PRODUITS_DEFAUT,
    };
  } catch {
    return { reglages: REGLAGES_DEFAUT, produits: PRODUITS_DEFAUT };
  }
}
