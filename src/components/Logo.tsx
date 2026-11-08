"use client";

import { motion } from "motion/react";

/** La toque dorée. `anime` : le contour se dessine puis la toque se remplit. */
export function Toque({ className = "", anime = false }: { className?: string; anime?: boolean }) {
  const trace = anime
    ? { initial: { pathLength: 0, fillOpacity: 0 }, animate: { pathLength: 1, fillOpacity: 1 } }
    : {};
  return (
    <svg viewBox="70 66 180 140" className={className} aria-hidden>
      <defs>
        <linearGradient id="or-toque" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F3D58A" />
          <stop offset=".5" stopColor="#C9A043" />
          <stop offset="1" stopColor="#8E6A1E" />
        </linearGradient>
      </defs>
      <motion.path
        d="M110,150 C86,150 80,112 108,106 C110,82 142,74 156,92 C168,72 204,80 202,104 C232,106 232,148 208,150 L204,176 L116,176 Z"
        fill="#FFFDF8"
        stroke="currentColor"
        strokeWidth={6}
        strokeLinejoin="round"
        {...trace}
        transition={{ pathLength: { duration: 1.6, ease: "easeInOut" }, fillOpacity: { delay: 1.2, duration: 0.6 } }}
      />
      <motion.rect
        x="114" y="176" width="92" height="20" rx="4"
        fill="url(#or-toque)" stroke="currentColor" strokeWidth={5}
        initial={anime ? { scaleX: 0 } : undefined}
        animate={anime ? { scaleX: 1 } : undefined}
        style={{ originX: "50%" }}
        transition={{ delay: 1.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d="M140,150 L142,176 M160,140 L160,176 M180,150 L178,176"
        stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" opacity={0.45}
        initial={anime ? { pathLength: 0 } : undefined}
        animate={anime ? { pathLength: 1 } : undefined}
        transition={{ delay: 1.5, duration: 0.6 }}
      />
    </svg>
  );
}

/** Logo horizontal : toque + nom */
export function LogoLigne({ nom = "La Toque Dorée", clair = false }: { nom?: string; clair?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Toque className={`h-9 w-9 ${clair ? "text-creme" : "text-bordeaux"}`} />
      <span className={`font-serif text-xl italic ${clair ? "text-creme" : "text-bordeaux"}`}>{nom}</span>
    </span>
  );
}
