"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { formatEuros } from "@/lib/offre";
import type { Produit } from "@/lib/types";
import { ChiffreAnime } from "../ui";

export function CarteProduit({
  produit,
  index,
  quantite,
  onAjouter,
}: {
  produit: Produit;
  index: number;
  quantite: number;
  onAjouter: () => void;
}) {
  // inclinaison 3D qui suit le doigt / la souris
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [8, -8]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(px, [0, 1], [-8, 8]), { stiffness: 200, damping: 18 });
  const reflet = useTransform(px, (r) => `radial-gradient(circle at ${r * 100}% 30%, rgba(255,255,255,.35), transparent 50%)`);

  return (
    <motion.article
      initial={{ opacity: 0, y: 80, rotate: index ? 4 : -4 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.9, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1000 }}
    >
      <motion.div
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const r = e.currentTarget.getBoundingClientRect();
          px.set((e.clientX - r.left) / r.width);
          py.set((e.clientY - r.top) / r.height);
        }}
        onPointerLeave={() => {
          px.set(0.5);
          py.set(0.5);
        }}
        style={{ rotateX: rx, rotateY: ry }}
        className="group relative overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_60px_-20px_rgba(74,18,32,.35)] ring-1 ring-bordeaux/10"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <motion.img
            src={produit.photo_url}
            alt={produit.nom}
            className="h-full w-full object-cover"
            initial={{ scale: 1.25 }}
            whileInView={{ scale: 1.05 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: "easeOut" }}
            whileHover={{ scale: 1.12 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bordeaux-fonce/70 via-transparent to-transparent" />
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: reflet }}
          />
          <span className="absolute left-4 top-4 rounded-full bg-creme/95 px-3 py-1 text-sm font-semibold text-bordeaux shadow">
            {produit.poids_g} g
          </span>
          <motion.span
            className="fond-or absolute bottom-4 right-4 rounded-2xl px-4 py-2 font-serif text-2xl font-bold text-bordeaux-fonce shadow-lg"
            initial={{ scale: 0, rotate: -20 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.5 + index * 0.15, stiffness: 200, damping: 12 }}
          >
            {formatEuros(produit.prix_centimes)}
          </motion.span>
        </div>
        <div className="p-6">
          <h3 className="font-serif text-2xl text-bordeaux">{produit.nom}</h3>
          <p className="mt-2 text-base leading-relaxed text-encre/70">{produit.description}</p>
          <motion.button
            type="button"
            onClick={onAjouter}
            whileTap={{ scale: 0.94 }}
            className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-bordeaux py-4 text-lg font-semibold text-creme shadow-md transition-colors hover:bg-bordeaux-clair"
          >
            {quantite > 0 ? (
              <>
                Ajouter encore
                <span className="fond-or inline-flex min-w-8 items-center justify-center rounded-full px-2 text-base text-bordeaux-fonce">
                  <ChiffreAnime valeur={quantite} />
                </span>
              </>
            ) : (
              "Je le veux"
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.article>
  );
}
