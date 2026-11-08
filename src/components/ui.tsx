"use client";

import { animate, AnimatePresence, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";
import { formatEuros } from "@/lib/offre";

/** Chiffre qui glisse quand il change */
export function ChiffreAnime({ valeur, className = "" }: { valeur: number; className?: string }) {
  return (
    <span className={`relative inline-flex justify-center overflow-hidden tabular-nums ${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={valeur}
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
        >
          {valeur}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Montant en euros qui défile jusqu'à sa nouvelle valeur */
export function EurosAnimes({ centimes, className = "" }: { centimes: number; className?: string }) {
  const mv = useMotionValue(centimes);
  const texte = useTransform(mv, (v) => formatEuros(Math.round(v / 100) * 100));
  useEffect(() => {
    const c = animate(mv, centimes, { duration: 0.6, ease: "easeOut" });
    return c.stop;
  }, [centimes, mv]);
  return <motion.span className={`tabular-nums ${className}`}>{texte}</motion.span>;
}

/** Gros boutons + / − */
export function Compteur({
  valeur,
  onChange,
  min = 0,
  max = 999,
  label,
  petit = false,
}: {
  valeur: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label: string;
  petit?: boolean;
}) {
  const taille = petit ? "h-11 w-11 text-xl" : "h-14 w-14 text-2xl";
  return (
    <div className="inline-flex items-center gap-3" role="group" aria-label={label}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.85 }}
        disabled={valeur <= min}
        onClick={() => onChange(Math.max(min, valeur - 1))}
        className={`${taille} flex items-center justify-center rounded-full border-2 border-bordeaux/25 bg-white font-semibold text-bordeaux shadow-sm transition-colors disabled:opacity-30 active:bg-creme-fonce`}
        aria-label={`Retirer un ${label}`}
      >
        −
      </motion.button>
      <ChiffreAnime valeur={valeur} className={`${petit ? "w-8 text-xl" : "w-10 text-3xl"} font-serif font-semibold text-bordeaux`} />
      <motion.button
        type="button"
        whileTap={{ scale: 0.85 }}
        disabled={valeur >= max}
        onClick={() => onChange(Math.min(max, valeur + 1))}
        className={`${taille} flex items-center justify-center rounded-full bg-bordeaux font-semibold text-creme shadow-md transition-colors disabled:opacity-30 active:bg-bordeaux-fonce`}
        aria-label={`Ajouter un ${label}`}
      >
        +
      </motion.button>
    </div>
  );
}

/** Explosion de paillettes (quand on gagne un offert, ou à l'envoi) */
export function Explosion({ declencheur, nombre = 18 }: { declencheur: number; nombre?: number }) {
  return (
    <AnimatePresence>
      {declencheur > 0 && (
        <motion.div key={declencheur} className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center" aria-hidden>
          {Array.from({ length: nombre }, (_, i) => {
            const angle = (i / nombre) * Math.PI * 2;
            const dist = 70 + (i % 3) * 30;
            return (
              <motion.span
                key={i}
                className={`absolute ${i % 2 ? "h-2 w-2 rounded-full bg-or" : "h-3 w-1 rounded bg-bordeaux"}`}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
                animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: 0, scale: 0.4, rotate: 180 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Champ({
  label,
  erreur,
  children,
  aide,
}: {
  label: string;
  erreur?: string;
  aide?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-bordeaux">{label}</span>
      {children}
      <AnimatePresence>
        {erreur ? (
          <motion.span
            initial={{ opacity: 0, height: 0, x: -6 }}
            animate={{ opacity: 1, height: "auto", x: [0, -6, 6, -3, 0] }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1 block text-sm font-medium text-red-700"
          >
            {erreur}
          </motion.span>
        ) : aide ? (
          <span className="mt-1 block text-xs text-encre/50">{aide}</span>
        ) : null}
      </AnimatePresence>
    </label>
  );
}

export const classeInput =
  "w-full rounded-2xl border-2 border-bordeaux/15 bg-white px-4 py-3.5 text-lg text-encre outline-none transition-all placeholder:text-encre/30 focus:border-or focus:ring-4 focus:ring-or/20";
