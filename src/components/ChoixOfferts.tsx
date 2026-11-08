"use client";

import { motion } from "motion/react";
import type { Produit, Quantites } from "@/lib/types";
import { Compteur } from "./ui";

/**
 * Le client (ou l'admin) choisit le type de ses foies gras offerts.
 * Le total des offerts reste toujours égal au nombre auquel on a droit.
 */
export function ChoixOfferts({
  droit,
  produits,
  offerts,
  onChange,
}: {
  droit: number;
  produits: Produit[];
  offerts: Quantites;
  onChange: (o: Quantites) => void;
}) {
  if (droit <= 0) return null;

  const changer = (id: string, v: number) => {
    const res: Quantites = { ...offerts, [id]: v };
    let reste = droit - v;
    // on redistribue le reste sur les autres produits, dans l'ordre
    const autres = produits.filter((p) => p.id !== id);
    for (const p of autres) {
      const garde = Math.min(res[p.id] || 0, reste);
      res[p.id] = garde;
      reste -= garde;
    }
    if (reste > 0 && autres[0]) res[autres[0].id] += reste;
    onChange(res);
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, scale: 0.95 }}
      animate={{ opacity: 1, height: "auto", scale: 1 }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="rounded-3xl border-2 border-dashed border-or bg-gradient-to-br from-or-clair/30 to-creme p-5">
        <p className="mb-4 flex items-center gap-2 font-serif text-xl text-bordeaux">
          <motion.span animate={{ rotate: [0, -12, 12, 0] }} transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1.5 }}>
            🎁
          </motion.span>
          {droit === 1 ? "Choisissez votre foie gras offert" : `Choisissez vos ${droit} foies gras offerts`}
        </p>
        <div className="space-y-3">
          {produits.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3">
              <span className="text-base font-medium text-encre/80">{p.nom.replace(/^Foie gras /i, "")}</span>
              <Compteur
                petit
                label={`${p.nom} offert`}
                valeur={offerts[p.id] || 0}
                max={droit}
                onChange={(v) => changer(p.id, v)}
              />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
