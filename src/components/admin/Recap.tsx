"use client";

import { motion } from "motion/react";
import { calculerRecap, formatEuros } from "@/lib/offre";
import type { Commande, Produit } from "@/lib/types";
import { ChiffreAnime, EurosAnimes } from "../ui";

/** Récap en haut du tableau de bord, avec le détail en ligne / directes / total */
export function Recap({ commandes, produits }: { commandes: Commande[]; produits: Produit[] }) {
  const tout = calculerRecap(commandes);
  const enLigne = calculerRecap(commandes.filter((c) => c.origine === "en_ligne"));
  const directes = calculerRecap(commandes.filter((c) => c.origine === "directe"));

  const tuiles: { titre: string; aide?: string; val: (r: typeof tout) => number; euros?: boolean }[] = [
    { titre: "Commandes", aide: "hors annulées", val: (r) => r.commandes },
    ...produits.map((p) => ({
      titre: p.nom.replace(/^Foie gras /i, "").replace(/^./, (x) => x.toUpperCase()),
      aide: "à préparer · confirmées, offerts compris",
      val: (r: typeof tout) => r.parProduit[p.id] || 0,
    })),
    { titre: "Offerts", aide: "commandes confirmées", val: (r) => r.offerts },
    { titre: "Chiffre d'affaires", aide: "confirmées, prêtes, récupérées", val: (r) => r.chiffreAffaires, euros: true },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {tuiles.map((t, i) => (
        <motion.div
          key={t.titre}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className={`rounded-3xl p-4 ${t.euros ? "col-span-2 bg-bordeaux text-creme lg:col-span-1" : "bg-white ring-1 ring-bordeaux/10"}`}
        >
          <p className={`text-xs font-semibold uppercase tracking-wide ${t.euros ? "text-or-clair" : "text-or-fonce"}`}>{t.titre}</p>
          <p className={`mt-1 font-serif text-3xl font-bold ${t.euros ? "text-creme" : "text-bordeaux"}`}>
            {t.euros ? <EurosAnimes centimes={t.val(tout)} /> : <ChiffreAnime valeur={t.val(tout)} />}
          </p>
          <div className={`mt-2 flex gap-3 text-xs ${t.euros ? "text-creme/70" : "text-encre/55"}`}>
            <span>En ligne : <b>{t.euros ? formatEuros(t.val(enLigne)) : t.val(enLigne)}</b></span>
            <span>Directes : <b>{t.euros ? formatEuros(t.val(directes)) : t.val(directes)}</b></span>
          </div>
          {t.aide && <p className={`mt-1 text-[11px] ${t.euros ? "text-creme/45" : "text-encre/35"}`}>{t.aide}</p>}
        </motion.div>
      ))}
    </div>
  );
}
