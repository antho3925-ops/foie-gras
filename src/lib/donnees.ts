"use client";

import { supabase, supabaseConfigure } from "./supabase";
import { commandesExemple, PRODUITS_DEFAUT, REGLAGES_DEFAUT } from "./defauts";
import { nbOfferts, normaliserTelephone, somme, totalCentimes } from "./offre";
import type { Commande, Produit, Reglages, SaisieCommande, Statut } from "./types";

/* ------------------------------------------------------------------ *
 *  Mode démo : tout est stocké dans le navigateur (localStorage).    *
 *  Il sert à essayer le site avant d'avoir branché Supabase.         *
 * ------------------------------------------------------------------ */
const CLE_DEMO = "toque-doree-demo-v1";
interface EtatDemo {
  commandes: Commande[];
  reglages: Reglages;
  produits: Produit[];
}
function lireDemo(): EtatDemo {
  try {
    const brut = localStorage.getItem(CLE_DEMO);
    if (brut) return JSON.parse(brut);
  } catch {}
  return { commandes: commandesExemple(), reglages: REGLAGES_DEFAUT, produits: PRODUITS_DEFAUT };
}
function ecrireDemo(e: EtatDemo) {
  try {
    localStorage.setItem(CLE_DEMO, JSON.stringify(e));
  } catch {}
}
export function reinitialiserDemo() {
  try {
    localStorage.removeItem(CLE_DEMO);
  } catch {}
}

function lignesDepuisSaisie(s: Pick<SaisieCommande, "achetes" | "offerts">, produits: Produit[]) {
  return produits
    .map((p) => ({ produit_id: p.id, achetes: s.achetes[p.id] || 0, offerts: s.offerts[p.id] || 0 }))
    .filter((l) => l.achetes > 0 || l.offerts > 0);
}

/** Vérifications identiques à celles faites par la base */
function verifier(s: Pick<SaisieCommande, "nom" | "prenom" | "telephone" | "achetes" | "offerts">, seuil: number) {
  if (!s.nom.trim() || !s.prenom.trim()) throw new Error("Merci d'indiquer le nom et le prénom.");
  const tel = normaliserTelephone(s.telephone);
  if (!tel) throw new Error("Numéro de téléphone invalide.");
  const a = somme(s.achetes);
  if (a < 1) throw new Error("Il faut au moins un foie gras.");
  if (somme(s.offerts) !== nbOfferts(a, seuil)) throw new Error("Nombre de foies gras offerts incorrect.");
  return tel;
}

function commandeDemo(s: SaisieCommande, produits: Produit[], seuil: number, existante?: Commande): Commande {
  const tel = verifier(s, seuil);
  return {
    id: existante?.id ?? `demo-${Date.now()}`,
    numero: existante?.numero ?? 0,
    origine: existante?.origine ?? s.origine,
    statut: s.statut,
    nom: s.nom.trim(),
    prenom: s.prenom.trim(),
    telephone: tel,
    commentaire: s.commentaire.trim(),
    total_centimes: totalCentimes(s.achetes, produits),
    created_at: existante?.created_at ?? new Date().toISOString(),
    lignes: lignesDepuisSaisie(s, produits).map((l) => ({
      produit_id: l.produit_id,
      quantite_achetee: l.achetes,
      quantite_offerte: l.offerts,
      prix_unitaire_centimes: produits.find((p) => p.id === l.produit_id)!.prix_centimes,
    })),
  };
}

const prochainNumero = (cs: Commande[]) => cs.reduce((m, c) => Math.max(m, c.numero), 0) + 1;

/* ------------------------------------------------------------------ *
 *  Public                                                            *
 * ------------------------------------------------------------------ */
export async function passerCommande(
  s: Omit<SaisieCommande, "origine" | "statut">,
  produits: Produit[],
  seuil: number,
): Promise<number> {
  if (!supabaseConfigure) {
    const e = lireDemo();
    const c = commandeDemo({ ...s, origine: "en_ligne", statut: "a_appeler" }, produits, seuil);
    c.numero = prochainNumero(e.commandes);
    e.commandes.unshift(c);
    ecrireDemo(e);
    await new Promise((r) => setTimeout(r, 700));
    return c.numero;
  }
  verifier(s, seuil);
  const { data, error } = await supabase().rpc("passer_commande", {
    p_nom: s.nom,
    p_prenom: s.prenom,
    p_telephone: s.telephone,
    p_commentaire: s.commentaire,
    p_lignes: lignesDepuisSaisie(s, produits),
  });
  if (error) throw new Error(error.message);
  return data as number;
}

/* ------------------------------------------------------------------ *
 *  Admin : connexion                                                 *
 * ------------------------------------------------------------------ */
export async function sessionActive(): Promise<boolean> {
  if (!supabaseConfigure) return sessionStorage.getItem("toque-doree-demo-admin") === "1";
  const { data } = await supabase().auth.getSession();
  return Boolean(data.session);
}

export async function connexion(email: string, motDePasse: string) {
  if (!supabaseConfigure) {
    sessionStorage.setItem("toque-doree-demo-admin", "1");
    return;
  }
  const { error } = await supabase().auth.signInWithPassword({ email, password: motDePasse });
  if (error) throw new Error("Email ou mot de passe incorrect.");
  const { data } = await supabase().rpc("est_admin");
  if (!data) {
    await supabase().auth.signOut();
    throw new Error("Ce compte n'est pas administrateur.");
  }
}

export async function deconnexion() {
  if (!supabaseConfigure) {
    sessionStorage.removeItem("toque-doree-demo-admin");
    return;
  }
  await supabase().auth.signOut();
}

/* ------------------------------------------------------------------ *
 *  Admin : données                                                   *
 * ------------------------------------------------------------------ */
export async function chargerTout(): Promise<{ commandes: Commande[]; produits: Produit[]; reglages: Reglages }> {
  if (!supabaseConfigure) {
    const e = lireDemo();
    return { ...e, commandes: [...e.commandes].sort((a, b) => b.created_at.localeCompare(a.created_at)) };
  }
  const sb = supabase();
  const [c, p, r] = await Promise.all([
    sb
      .from("commandes")
      .select("*, lignes:lignes_commande(produit_id, quantite_achetee, quantite_offerte, prix_unitaire_centimes)")
      .order("created_at", { ascending: false }),
    sb.from("produits").select("*").order("ordre"),
    sb.from("reglages").select("*").eq("id", 1).single(),
  ]);
  const err = c.error || p.error || r.error;
  if (err) throw new Error(err.message);
  return { commandes: c.data as Commande[], produits: p.data as Produit[], reglages: r.data as Reglages };
}

export async function enregistrerCommande(s: SaisieCommande, produits: Produit[], seuil: number): Promise<void> {
  if (!supabaseConfigure) {
    const e = lireDemo();
    const i = e.commandes.findIndex((c) => c.id === s.id);
    const c = commandeDemo(s, produits, seuil, i >= 0 ? e.commandes[i] : undefined);
    if (i >= 0) e.commandes[i] = c;
    else {
      c.numero = prochainNumero(e.commandes);
      e.commandes.unshift(c);
    }
    ecrireDemo(e);
    return;
  }
  verifier(s, seuil);
  const { error } = await supabase().rpc("admin_enregistrer_commande", {
    p_id: s.id ?? null,
    p_origine: s.origine,
    p_statut: s.statut,
    p_nom: s.nom,
    p_prenom: s.prenom,
    p_telephone: s.telephone,
    p_commentaire: s.commentaire,
    p_lignes: lignesDepuisSaisie(s, produits),
  });
  if (error) throw new Error(error.message);
}

export async function changerStatut(id: string, statut: Statut) {
  if (!supabaseConfigure) {
    const e = lireDemo();
    e.commandes = e.commandes.map((c) => (c.id === id ? { ...c, statut } : c));
    ecrireDemo(e);
    return;
  }
  const { error } = await supabase().from("commandes").update({ statut, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function supprimerCommande(id: string) {
  if (!supabaseConfigure) {
    const e = lireDemo();
    e.commandes = e.commandes.filter((c) => c.id !== id);
    ecrireDemo(e);
    return;
  }
  const { error } = await supabase().from("commandes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function enregistrerReglages(r: Reglages, produits: Produit[]) {
  if (!supabaseConfigure) {
    const e = lireDemo();
    ecrireDemo({ ...e, reglages: r, produits });
    return;
  }
  const sb = supabase();
  const { error } = await sb
    .from("reglages")
    .update({ ...r, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) throw new Error(error.message);
  for (const p of produits) {
    const { error: e2 } = await sb
      .from("produits")
      .update({ nom: p.nom, description: p.description, prix_centimes: p.prix_centimes, photo_url: p.photo_url })
      .eq("id", p.id);
    if (e2) throw new Error(e2.message);
  }
}

/** Envoie une photo et renvoie son adresse publique */
export async function envoyerPhoto(fichier: File): Promise<string> {
  if (!supabaseConfigure) {
    return await new Promise((ok, ko) => {
      const lecteur = new FileReader();
      lecteur.onload = () => ok(String(lecteur.result));
      lecteur.onerror = () => ko(new Error("Lecture de la photo impossible"));
      lecteur.readAsDataURL(fichier);
    });
  }
  const ext = fichier.name.split(".").pop()?.toLowerCase() || "jpg";
  const chemin = `${Date.now()}.${ext}`;
  const sb = supabase();
  const { error } = await sb.storage.from("photos").upload(chemin, fichier, { contentType: fichier.type });
  if (error) throw new Error(error.message);
  return sb.storage.from("photos").getPublicUrl(chemin).data.publicUrl;
}
