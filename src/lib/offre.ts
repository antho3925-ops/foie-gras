import type { Commande, Produit, Quantites, Statut } from "./types";

/** Somme des valeurs d'un objet de quantités */
export const somme = (q: Quantites) => Object.values(q).reduce((a, b) => a + (b || 0), 0);

/** Nombre de foies gras offerts pour un nombre de foies gras achetés */
export const nbOfferts = (achetes: number, seuil = 10) => Math.floor(Math.max(0, achetes) / seuil);

/** Combien il en manque pour obtenir le prochain offert */
export const manquantPourOffert = (achetes: number, seuil = 10) => seuil - (Math.max(0, achetes) % seuil);

/**
 * Ajuste la répartition des offerts quand le nombre auquel on a droit change.
 * - si on a droit à plus : on ajoute sur le produit le plus acheté (le client peut changer)
 * - si on a droit à moins : on retire en partant du dernier produit
 */
export function ajusterOfferts(offerts: Quantites, achetes: Quantites, produits: Produit[], seuil = 10): Quantites {
  const droit = nbOfferts(somme(achetes), seuil);
  const res: Quantites = {};
  for (const p of produits) res[p.id] = Math.max(0, offerts[p.id] || 0);
  let actuel = somme(res);
  if (actuel < droit) {
    const favori = [...produits].sort((a, b) => (achetes[b.id] || 0) - (achetes[a.id] || 0))[0];
    if (favori) res[favori.id] += droit - actuel;
  }
  for (let i = produits.length - 1; i >= 0 && actuel > droit; i--) {
    const id = produits[i].id;
    const retire = Math.min(res[id], actuel - droit);
    res[id] -= retire;
    actuel -= retire;
  }
  return res;
}

/** Total en centimes (seuls les achetés sont payants) */
export function totalCentimes(achetes: Quantites, produits: Produit[]): number {
  return produits.reduce((t, p) => t + (achetes[p.id] || 0) * p.prix_centimes, 0);
}

export function formatEuros(centimes: number): string {
  const euros = centimes / 100;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(euros) ? 0 : 2,
  }).format(euros);
}

/** Normalise un numéro français, renvoie null s'il est invalide. "+33 6 12 34 56 78" -> "0612345678" */
export function normaliserTelephone(saisie: string): string | null {
  let t = saisie.replace(/[\s.\-()]/g, "");
  if (t.startsWith("+33")) t = "0" + t.slice(3);
  else if (t.startsWith("0033")) t = "0" + t.slice(4);
  return /^0[1-9]\d{8}$/.test(t) ? t : null;
}

/** "0612345678" -> "06 12 34 56 78" */
export const formatTelephone = (t: string) => t.replace(/(\d{2})(?=\d)/g, "$1 ").trim();

export const formatNumero = (n: number) => `n° ${String(n).padStart(4, "0")}`;

/** Message encourageant affiché sous les quantités */
export function messageOffre(achetes: number, seuil = 10): string {
  if (achetes <= 0) return `${seuil} foies gras achetés = 1 offert !`;
  const offerts = nbOfferts(achetes, seuil);
  const manque = manquantPourOffert(achetes, seuil);
  const suite = manque === 1 ? "Plus qu'1 pour en avoir un" : `Plus que ${manque} pour en avoir un`;
  if (offerts === 0) return `${suite} offert !`;
  const gagne = offerts === 1 ? "1 foie gras offert" : `${offerts} foies gras offerts`;
  return `Bravo, ${gagne} ! ${suite} de plus.`;
}

export interface Recap {
  commandes: number;
  parProduit: Record<string, number>;
  offerts: number;
  chiffreAffaires: number;
}

/** Statuts comptés comme « à préparer » : commandes confirmées uniquement */
export const STATUTS_A_PREPARER: Statut[] = ["confirmee"];

/**
 * Récap du tableau de bord.
 * - commandes : toutes sauf annulées
 * - foies gras à préparer (offerts compris) : commandes confirmées uniquement
 * - offerts et chiffre d'affaires : commandes confirmées, prêtes ou récupérées
 */
export function calculerRecap(commandes: Commande[]): Recap {
  const r: Recap = { commandes: 0, parProduit: {}, offerts: 0, chiffreAffaires: 0 };
  for (const c of commandes) {
    if (c.statut === "annulee") continue;
    r.commandes++;
    const confirmee = c.statut !== "a_appeler";
    if (confirmee) r.chiffreAffaires += c.total_centimes;
    for (const l of c.lignes) {
      if (confirmee) r.offerts += l.quantite_offerte;
      if (STATUTS_A_PREPARER.includes(c.statut)) {
        r.parProduit[l.produit_id] = (r.parProduit[l.produit_id] || 0) + l.quantite_achetee + l.quantite_offerte;
      }
    }
  }
  return r;
}
