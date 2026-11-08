"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { Toque } from "../Logo";

/** Paillettes dorées qui flottent dans le fond */
// positions pseudo-aléatoires mais identiques serveur / navigateur
const hasard = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return Math.round((x - Math.floor(x)) * 1000) / 1000;
};
const POINTS = Array.from({ length: 28 }, (_, i) => ({
  x: hasard(i + 1) * 100,
  y: hasard(i + 101) * 100,
  t: 5 + hasard(i + 201) * 7,
  d: hasard(i + 301) * 5,
  s: 2 + hasard(i + 401) * 4,
}));

function Paillettes() {
  const points = POINTS;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {points.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-or-clair"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, boxShadow: "0 0 8px 2px rgba(243,213,138,.5)" }}
          animate={{ y: [0, -40, 0], opacity: [0, 0.9, 0], scale: [0.6, 1.2, 0.6] }}
          transition={{ duration: p.t, delay: p.d, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

const montee = {
  cache: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.4 + i * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } }),
};

export function Hero({ nom, slogan, seuil }: { nom: string; slogan: string; seuil: number }) {
  const { scrollY } = useScroll();
  const decalage = useTransform(scrollY, [0, 600], [0, 160]);
  const fondu = useTransform(scrollY, [0, 450], [1, 0]);
  const mots = nom.split(" ");

  return (
    <section className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden bg-bordeaux-fonce text-creme">
      {/* halos lumineux animés */}
      <motion.div
        className="absolute -left-1/3 -top-1/4 h-[70vmax] w-[70vmax] rounded-full bg-bordeaux-clair/50 blur-3xl"
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-1/3 -right-1/4 h-[60vmax] w-[60vmax] rounded-full bg-or/25 blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="grain absolute inset-0" />
      <Paillettes />

      <motion.div style={{ y: decalage, opacity: fondu }} className="relative z-10 flex flex-col items-center px-6 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: -12 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 12 }}
        >
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}>
            <Toque anime className="h-32 w-32 text-or drop-shadow-[0_10px_30px_rgba(201,160,67,.45)] sm:h-40 sm:w-40" />
          </motion.div>
        </motion.div>

        <h1 className="mt-6 font-serif text-5xl leading-tight sm:text-7xl">
          {mots.map((m, i) => (
            <motion.span
              key={i}
              className="texte-or mr-3 inline-block italic last:mr-0"
              initial={{ opacity: 0, y: 40, rotateX: -80, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
              transition={{ delay: 1.2 + i * 0.18, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              {m}
            </motion.span>
          ))}
        </h1>

        <motion.p custom={6} variants={montee} initial="cache" animate="visible" className="mt-4 max-w-md text-lg text-creme/85 sm:text-xl">
          {slogan}
        </motion.p>

        <motion.div custom={7} variants={montee} initial="cache" animate="visible" className="mt-8 flex flex-col items-center gap-4">
          <a
            href="#commander"
            className="fond-or relative overflow-hidden rounded-full px-10 py-4 text-lg font-semibold text-bordeaux-fonce shadow-[0_10px_40px_-10px_rgba(201,160,67,.8)] transition-transform active:scale-95"
          >
            <span className="relative z-10">Commander mon foie gras</span>
            <span className="animate-brillance absolute inset-y-0 left-0 w-1/3 bg-white/50" />
          </a>
          <motion.span
            className="rounded-full border border-or/50 px-4 py-1.5 text-sm tracking-wide text-or-clair"
            animate={{ boxShadow: ["0 0 0 0 rgba(201,160,67,0)", "0 0 0 8px rgba(201,160,67,.12)", "0 0 0 0 rgba(201,160,67,0)"] }}
            transition={{ duration: 2.4, repeat: Infinity }}
          >
            ✦ {seuil} achetés = 1 offert ✦
          </motion.span>
        </motion.div>
      </motion.div>

      <motion.a
        href="#presentation"
        aria-label="Découvrir"
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-or-clair/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ opacity: { delay: 2.6 }, y: { duration: 1.8, repeat: Infinity } }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </motion.a>
    </section>
  );
}
