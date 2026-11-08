"use client";

import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { formatTelephone } from "@/lib/offre";
import { LogoLigne, Toque } from "../Logo";

/** Barre du haut qui apparaît quand on a quitté l'écran d'accueil */
export function Entete({ nom }: { nom: string }) {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setVisible(y > 500));
  return (
    <motion.header
      initial={false}
      animate={{ y: visible ? 0 : -90 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="no-print fixed inset-x-0 top-0 z-40 border-b border-bordeaux/10 bg-creme/90 backdrop-blur"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5">
        <a href="#" aria-label="Haut de page">
          <LogoLigne nom={nom} />
        </a>
        <a href="#commander" className="rounded-full bg-bordeaux px-5 py-2.5 text-sm font-semibold text-creme active:scale-95">
          Commander
        </a>
      </div>
    </motion.header>
  );
}

export function PiedDePage({ nom, telephone }: { nom: string; telephone: string }) {
  return (
    <footer className="relative overflow-hidden bg-bordeaux-fonce px-6 py-14 text-center text-creme/80">
      <div className="grain absolute inset-0" />
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative">
        <Toque className="mx-auto h-14 w-14 text-or" />
        <p className="texte-or mt-3 font-serif text-2xl italic">{nom}</p>
        {telephone && (
          <a href={`tel:${telephone}`} className="mt-3 inline-block text-lg text-or-clair underline-offset-4 hover:underline">
            {formatTelephone(telephone)}
          </a>
        )}
        <p className="mt-6 text-sm text-creme/50">
          © {new Date().getFullYear()} {nom} · Fait main avec amour ·{" "}
          <Link href="/admin" className="underline-offset-2 hover:underline">
            Espace producteur
          </Link>
        </p>
      </motion.div>
    </footer>
  );
}
