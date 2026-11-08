import type { Commande, Produit, Reglages } from "./types";

/** Valeurs utilisées tant que Supabase n'est pas configuré (mode démo) */
export const REGLAGES_DEFAUT: Reglages = {
  nom_producteur: "La Toque Dorée",
  slogan: "Foie gras maison, préparé avec passion",
  presentation_titre: "Un savoir-faire de famille",
  presentation_texte:
    "Dans notre petite cuisine, chaque foie gras est déveiné à la main, assaisonné simplement puis cuit doucement, comme on le fait depuis toujours à la maison. Pas d'additif, pas de raccourci : juste du bon produit, du temps et beaucoup d'amour du métier.",
  photo_producteur_url: "/photos/producteur.jpeg",
  telephone_producteur: "",
  infos_retrait: "Retrait sur place, nous vous appelons pour convenir du jour.",
  offre_seuil: 10,
};

export const PRODUITS_DEFAUT: Produit[] = [
  {
    id: "classique",
    nom: "Foie gras classique",
    description: "Mi-cuit, fondant, assaisonné au sel et au poivre. Le grand classique des fêtes.",
    poids_g: 500,
    prix_centimes: 7000,
    photo_url: "/photos/classique.jpeg",
    ordre: 1,
    actif: true,
  },
  {
    id: "poivre",
    nom: "Foie gras en croûte de poivre",
    description: "Enrobé d'une croûte de poivres concassés pour une note chaude et parfumée.",
    poids_g: 500,
    prix_centimes: 7000,
    photo_url: "/photos/croute-poivre.png",
    ordre: 2,
    actif: true,
  },
];

const il = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
const l = (produit_id: string, a: number, o = 0) => ({
  produit_id,
  quantite_achetee: a,
  quantite_offerte: o,
  prix_unitaire_centimes: 7000,
});

/** Les 5 mêmes commandes d'exemple que supabase/exemples.sql */
export function commandesExemple(): Commande[] {
  return [
    { id: "demo-1", numero: 1, origine: "en_ligne", statut: "a_appeler", nom: "Martin", prenom: "Claire", telephone: "0612345678", commentaire: "Pour le réveillon du 24, merci !", total_centimes: 21000, created_at: il(72), lignes: [l("classique", 2), l("poivre", 1)] },
    { id: "demo-2", numero: 2, origine: "en_ligne", statut: "confirmee", nom: "Bernard", prenom: "Lucas", telephone: "0798765432", commentaire: "Comité d'entreprise", total_centimes: 84000, created_at: il(48), lignes: [l("classique", 6, 1), l("poivre", 6)] },
    { id: "demo-3", numero: 3, origine: "en_ligne", statut: "prete", nom: "Petit", prenom: "Sophie", telephone: "0556123456", commentaire: "", total_centimes: 28000, created_at: il(24), lignes: [l("poivre", 4)] },
    { id: "demo-4", numero: 4, origine: "directe", statut: "confirmee", nom: "Dubois", prenom: "Jean", telephone: "0611223344", commentaire: "Pris au marché samedi", total_centimes: 70000, created_at: il(20), lignes: [l("classique", 10), l("poivre", 0, 1)] },
    { id: "demo-5", numero: 5, origine: "directe", statut: "recuperee", nom: "Moreau", prenom: "Élise", telephone: "0688776655", commentaire: "Appel du voisin", total_centimes: 14000, created_at: il(5), lignes: [l("classique", 1), l("poivre", 1)] },
  ];
}
