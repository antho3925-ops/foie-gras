import { describe, expect, it } from "vitest";
import {
  ajusterOfferts, calculerRecap, formatEuros, formatTelephone, manquantPourOffert,
  messageOffre, nbOfferts, normaliserTelephone, totalCentimes,
} from "./offre";
import type { Commande, Produit } from "./types";

const produits: Produit[] = [
  { id: "classique", nom: "Classique", description: "", poids_g: 500, prix_centimes: 7000, photo_url: "", ordre: 1, actif: true },
  { id: "poivre", nom: "Poivre", description: "", poids_g: 500, prix_centimes: 7000, photo_url: "", ordre: 2, actif: true },
];

describe("offre 10 achetés = 1 offert", () => {
  it("compte les offerts, les deux types cumulés", () => {
    expect(nbOfferts(9)).toBe(0);
    expect(nbOfferts(10)).toBe(1);
    expect(nbOfferts(19)).toBe(1);
    expect(nbOfferts(20)).toBe(2);
    expect(nbOfferts(6 + 4)).toBe(1);
  });
  it("indique combien il en manque", () => {
    expect(manquantPourOffert(8)).toBe(2);
    expect(manquantPourOffert(10)).toBe(10);
    expect(messageOffre(8)).toBe("Plus que 2 pour en avoir un offert !");
    expect(messageOffre(9)).toBe("Plus qu'1 pour en avoir un offert !");
    expect(messageOffre(10)).toContain("Bravo, 1 foie gras offert");
    expect(messageOffre(22)).toContain("2 foies gras offerts");
  });
  it("répartit les offerts et respecte le choix du client", () => {
    expect(ajusterOfferts({}, { classique: 7, poivre: 3 }, produits)).toEqual({ classique: 1, poivre: 0 });
    // le client a choisi poivre, on garde son choix
    expect(ajusterOfferts({ poivre: 1 }, { classique: 8, poivre: 3 }, produits)).toEqual({ classique: 0, poivre: 1 });
    // passe à 20 : un offert de plus
    expect(ajusterOfferts({ poivre: 1 }, { classique: 17, poivre: 3 }, produits)).toEqual({ classique: 1, poivre: 1 });
    // redescend sous 10 : plus d'offert
    expect(ajusterOfferts({ classique: 1, poivre: 1 }, { classique: 5 }, produits)).toEqual({ classique: 0, poivre: 0 });
  });
  it("ne fait payer que les achetés", () => {
    expect(totalCentimes({ classique: 10, poivre: 0 }, produits)).toBe(70000);
    expect(formatEuros(70000)).toMatch(/^700\s€$/);
    expect(formatEuros(7050)).toMatch(/^70,50\s€$/);
  });
});

describe("téléphone français", () => {
  it.each([
    ["06 12 34 56 78", "0612345678"],
    ["06.12.34.56.78", "0612345678"],
    ["+33 6 12 34 56 78", "0612345678"],
    ["0033612345678", "0612345678"],
    ["01-23-45-67-89", "0123456789"],
  ])("accepte %s", (saisie, attendu) => expect(normaliserTelephone(saisie)).toBe(attendu));
  it.each(["12345", "0012345678", "06123456789", "+44 7911 123456", "abcdefghij"])("refuse %s", (s) =>
    expect(normaliserTelephone(s)).toBeNull(),
  );
  it("formate pour l'affichage", () => expect(formatTelephone("0612345678")).toBe("06 12 34 56 78"));
});

describe("récap", () => {
  const c = (statut: Commande["statut"], cl: number, po: number, offCl = 0, offPo = 0): Commande => ({
    id: statut + cl, numero: 1, origine: "en_ligne", statut, nom: "", prenom: "", telephone: "", commentaire: "",
    total_centimes: (cl + po) * 7000, created_at: "",
    lignes: [
      { produit_id: "classique", quantite_achetee: cl, quantite_offerte: offCl, prix_unitaire_centimes: 7000 },
      { produit_id: "poivre", quantite_achetee: po, quantite_offerte: offPo, prix_unitaire_centimes: 7000 },
    ],
  });
  it("compte les foies gras à préparer des commandes confirmées, offerts compris", () => {
    const r = calculerRecap([c("confirmee", 6, 4, 1, 0), c("a_appeler", 2, 0), c("annulee", 5, 5), c("recuperee", 1, 1)]);
    expect(r.commandes).toBe(3);
    expect(r.parProduit).toEqual({ classique: 7, poivre: 4 });
    expect(r.offerts).toBe(1);
    expect(r.chiffreAffaires).toBe(12 * 7000);
  });
});
