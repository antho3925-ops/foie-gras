export type Origine = "en_ligne" | "directe";
export type Statut = "a_appeler" | "confirmee" | "prete" | "recuperee" | "annulee";

export interface Reglages {
  nom_producteur: string;
  slogan: string;
  presentation_titre: string;
  presentation_texte: string;
  photo_producteur_url: string;
  telephone_producteur: string;
  infos_retrait: string;
  offre_seuil: number;
}

export interface Produit {
  id: string;
  nom: string;
  description: string;
  poids_g: number;
  prix_centimes: number;
  photo_url: string;
  ordre: number;
  actif: boolean;
}

export interface LigneCommande {
  produit_id: string;
  quantite_achetee: number;
  quantite_offerte: number;
  prix_unitaire_centimes: number;
}

export interface Commande {
  id: string;
  numero: number;
  origine: Origine;
  statut: Statut;
  nom: string;
  prenom: string;
  telephone: string;
  commentaire: string;
  total_centimes: number;
  created_at: string;
  lignes: LigneCommande[];
}

/** Quantités saisies dans un formulaire, par produit */
export type Quantites = Record<string, number>;

export interface SaisieCommande {
  id?: string;
  origine: Origine;
  statut: Statut;
  nom: string;
  prenom: string;
  telephone: string;
  commentaire: string;
  achetes: Quantites;
  offerts: Quantites;
}

export const STATUTS: { id: Statut; label: string; classes: string; point: string }[] = [
  { id: "a_appeler", label: "À appeler", classes: "bg-amber-100 text-amber-900 ring-amber-300", point: "bg-amber-500" },
  { id: "confirmee", label: "Confirmée", classes: "bg-sky-100 text-sky-900 ring-sky-300", point: "bg-sky-500" },
  { id: "prete", label: "Prête", classes: "bg-violet-100 text-violet-900 ring-violet-300", point: "bg-violet-500" },
  { id: "recuperee", label: "Récupérée", classes: "bg-emerald-100 text-emerald-900 ring-emerald-300", point: "bg-emerald-500" },
  { id: "annulee", label: "Annulée", classes: "bg-stone-200 text-stone-600 ring-stone-300 line-through", point: "bg-stone-400" },
];

export const statutInfo = (s: Statut) => STATUTS.find((x) => x.id === s)!;

/** Statut suivant dans le parcours normal (Annulée et Récupérée n'ont pas de suite) */
export function statutSuivant(s: Statut): Statut | null {
  const ordre: Statut[] = ["a_appeler", "confirmee", "prete", "recuperee"];
  const i = ordre.indexOf(s);
  return i >= 0 && i < ordre.length - 1 ? ordre[i + 1] : null;
}
