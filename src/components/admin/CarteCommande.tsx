"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { formatEuros, formatNumero, formatTelephone } from "@/lib/offre";
import { STATUTS, statutInfo, type Commande, type Produit, type Statut } from "@/lib/types";

const court = (nom: string) => nom.replace(/^Foie gras /i, "");

export function CarteCommande({
  c,
  produits,
  onStatut,
  onModifier,
  onSupprimer,
  onPdf,
}: {
  c: Commande;
  produits: Produit[];
  onStatut: (s: Statut) => void;
  onModifier: () => void;
  onSupprimer: () => void;
  onPdf: () => void;
}) {
  const [confirmer, setConfirmer] = useState(false);
  const info = statutInfo(c.statut);
  const nomProduit = (id: string) => court(produits.find((p) => p.id === id)?.nom ?? id);
  const offerts = c.lignes.filter((l) => l.quantite_offerte > 0);
  const date = new Date(c.created_at).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -80, transition: { duration: 0.25 } }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`relative overflow-hidden rounded-3xl bg-white p-4 shadow-sm ring-1 ring-bordeaux/10 ${c.statut === "annulee" ? "opacity-60" : ""}`}
    >
      <motion.span layout className={`absolute inset-y-0 left-0 w-1.5 ${info.point}`} />
      <div className="flex items-start justify-between gap-3 pl-1">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-encre/40">{formatNumero(c.numero)}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                c.origine === "en_ligne" ? "bg-bordeaux text-creme" : "fond-or text-bordeaux-fonce"
              }`}
            >
              {c.origine === "en_ligne" ? "En ligne" : "Directe"}
            </span>
            <span className="text-xs text-encre/40">{date}</span>
          </div>
          <h3 className="mt-1 truncate font-serif text-xl text-bordeaux">
            {c.prenom} {c.nom}
          </h3>
          <a href={`tel:${c.telephone}`} className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-base font-semibold text-emerald-800 active:scale-95">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 013 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
            </svg>
            {formatTelephone(c.telephone)}
          </a>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-serif text-2xl font-bold text-bordeaux">{formatEuros(c.total_centimes)}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 pl-1 text-sm">
        {c.lignes
          .filter((l) => l.quantite_achetee > 0)
          .map((l) => (
            <span key={l.produit_id} className="rounded-xl bg-creme px-2.5 py-1 font-medium text-encre/80">
              {l.quantite_achetee} × {nomProduit(l.produit_id)}
            </span>
          ))}
        {offerts.map((l) => (
          <span key={`o${l.produit_id}`} className="rounded-xl bg-or-clair/40 px-2.5 py-1 font-medium text-or-fonce">
            🎁 {l.quantite_offerte} × {nomProduit(l.produit_id)}
          </span>
        ))}
      </div>
      {c.commentaire && <p className="mt-2 pl-1 text-sm italic text-encre/60">« {c.commentaire} »</p>}

      {/* Statuts en un clic */}
      <div className="mt-3 flex flex-wrap gap-1.5 pl-1">
        {STATUTS.map((s) => {
          const actif = s.id === c.statut;
          return (
            <motion.button
              key={s.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => !actif && onStatut(s.id)}
              className={`relative rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition-colors ${
                actif ? `${s.classes} ring-2` : "bg-white text-encre/45 ring-bordeaux/10 hover:text-encre"
              }`}
            >
              {s.label}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-3 flex gap-2 border-t border-bordeaux/10 pt-3 pl-1">
        <button onClick={onPdf} className="flex-1 rounded-xl bg-creme py-2.5 text-sm font-semibold text-bordeaux active:scale-95">
          📄 Bon PDF
        </button>
        <button onClick={onModifier} className="flex-1 rounded-xl bg-creme py-2.5 text-sm font-semibold text-bordeaux active:scale-95">
          ✏️ Modifier
        </button>
        {confirmer ? (
          <button onClick={onSupprimer} onBlur={() => setConfirmer(false)} autoFocus className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white active:scale-95">
            Confirmer ?
          </button>
        ) : (
          <button onClick={() => setConfirmer(true)} className="rounded-xl bg-creme px-3 py-2.5 text-sm font-semibold text-red-700 active:scale-95" aria-label="Supprimer">
            🗑️
          </button>
        )}
      </div>
    </motion.article>
  );
}
