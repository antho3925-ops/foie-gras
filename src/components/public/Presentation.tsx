"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export function Presentation({ titre, texte, photo }: { titre: string; texte: string; photo: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yPhoto = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const rotation = useTransform(scrollYProgress, [0, 1], [-4, 3]);

  return (
    <section id="presentation" ref={ref} className="relative overflow-hidden px-5 py-20 sm:py-28">
      <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -60, rotate: -6 }}
          whileInView={{ opacity: 1, x: 0, rotate: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{ rotate: rotation }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="absolute -inset-3 rounded-[2rem] border-2 border-or/60" />
          <div className="absolute -inset-3 translate-x-4 translate-y-4 rounded-[2rem] bg-bordeaux/10" />
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.6rem] shadow-2xl">
            <motion.img src={photo} alt="Le producteur au travail" style={{ y: yPhoto, scale: 1.2 }} className="h-full w-full object-cover" />
          </div>
          <motion.div
            className="fond-or absolute -bottom-6 -right-4 flex h-24 w-24 items-center justify-center rounded-full text-center font-serif text-sm font-semibold leading-tight text-bordeaux-fonce shadow-xl"
            initial={{ scale: 0, rotate: -90 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.6, stiffness: 160, damping: 12 }}
          >
            <motion.span animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-1 rounded-full border border-dashed border-bordeaux/40" />
            Fait
            <br />
            maison
          </motion.div>
        </motion.div>

        <div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-or-fonce"
          >
            Le producteur
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-4xl leading-tight text-bordeaux sm:text-5xl"
          >
            {titre}
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="fond-or my-6 h-1 w-24 origin-left rounded-full"
          />
          {texte.split(/\n+/).map((para, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.35 + i * 0.12 }}
              className="mb-4 text-lg leading-relaxed text-encre/80"
            >
              {para}
            </motion.p>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Bandeau défilant de l'offre */
export function BandeauOffre({ seuil }: { seuil: number }) {
  const phrase = `${seuil} foies gras achetés = 1 offert`;
  const items = Array.from({ length: 8 }, (_, i) => (
    <span key={i} className="mx-6 inline-flex items-center gap-6">
      {phrase} <span className="text-or-clair">✦</span> Classique ou croûte de poivre <span className="text-or-clair">✦</span>
    </span>
  ));
  return (
    <div className="relative -rotate-2 overflow-hidden bg-bordeaux py-4 font-serif text-xl italic text-creme shadow-lg sm:text-2xl">
      <div className="animate-defile flex w-max whitespace-nowrap">
        {items}
        {items}
      </div>
    </div>
  );
}
