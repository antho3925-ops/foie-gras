"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { enregistrerReglages, envoyerPhoto } from "@/lib/donnees";
import type { Produit, Reglages } from "@/lib/types";
import { Champ, classeInput } from "../ui";

function ChampPhoto({ url, onChange }: { url: string; onChange: (u: string) => void }) {
  const [charge, setCharge] = useState(false);
  const [erreur, setErreur] = useState("");
  return (
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {url && <img src={url} alt="" className="h-16 w-16 rounded-2xl object-cover ring-1 ring-bordeaux/10" />}
      <label className="cursor-pointer rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-bordeaux ring-1 ring-bordeaux/15 active:scale-95">
        {charge ? "Envoi…" : "Changer la photo"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setCharge(true);
            setErreur("");
            try {
              onChange(await envoyerPhoto(f));
            } catch (ex) {
              setErreur(ex instanceof Error ? ex.message : "Envoi impossible");
            } finally {
              setCharge(false);
            }
          }}
        />
      </label>
      {erreur && <span className="text-sm text-red-700">{erreur}</span>}
    </div>
  );
}

/** Modifier les textes, les photos et les prix */
export function ReglagesPanneau({
  reglages,
  produits,
  onFermer,
  onEnregistre,
}: {
  reglages: Reglages;
  produits: Produit[];
  onFermer: () => void;
  onEnregistre: () => void;
}) {
  const [r, setR] = useState<Reglages>(reglages);
  const [ps, setPs] = useState<Produit[]>(produits);
  const [prix, setPrix] = useState<Record<string, string>>(Object.fromEntries(produits.map((p) => [p.id, String(p.prix_centimes / 100).replace(".", ",")])));
  const [erreur, setErreur] = useState("");
  const [charge, setCharge] = useState(false);
  const majR = (p: Partial<Reglages>) => setR((x) => ({ ...x, ...p }));
  const majP = (id: string, p: Partial<Produit>) => setPs((xs) => xs.map((x) => (x.id === id ? { ...x, ...p } : x)));

  const valider = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");
    const avecPrix = ps.map((p) => ({ ...p, prix_centimes: Math.round(parseFloat((prix[p.id] || "").replace(",", ".")) * 100) }));
    if (avecPrix.some((p) => !Number.isFinite(p.prix_centimes) || p.prix_centimes < 0)) return setErreur("Un prix est invalide.");
    setCharge(true);
    try {
      await enregistrerReglages(r, avecPrix);
      onEnregistre();
    } catch (ex) {
      setErreur(ex instanceof Error ? ex.message : "Enregistrement impossible");
    } finally {
      setCharge(false);
    }
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-bordeaux-fonce/60 backdrop-blur-sm" onClick={onFermer} />
      <motion.form
        onSubmit={valider}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="relative max-h-[94svh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-creme p-5 pb-8 shadow-2xl sm:rounded-[2rem] sm:p-7"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-bordeaux">Réglages du site</h2>
          <button type="button" onClick={onFermer} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-bordeaux shadow" aria-label="Fermer">
            ×
          </button>
        </div>

        <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-or-fonce">Prix</h3>
        <div className="mt-2 space-y-3">
          {ps.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3">
              <span className="font-semibold text-bordeaux">{p.nom.replace(/^Foie gras /i, "")}</span>
              <span className="flex items-center gap-1">
                <input
                  className="w-24 rounded-xl border-2 border-bordeaux/15 px-3 py-2 text-right text-lg outline-none focus:border-or"
                  inputMode="decimal"
                  value={prix[p.id]}
                  onChange={(e) => setPrix((x) => ({ ...x, [p.id]: e.target.value }))}
                />
                <span className="text-lg text-bordeaux">€</span>
              </span>
            </div>
          ))}
        </div>

        <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-or-fonce">Présentation</h3>
        <div className="mt-2 space-y-4">
          <Champ label="Nom du producteur">
            <input className={classeInput} value={r.nom_producteur} onChange={(e) => majR({ nom_producteur: e.target.value })} />
          </Champ>
          <Champ label="Phrase d'accueil">
            <input className={classeInput} value={r.slogan} onChange={(e) => majR({ slogan: e.target.value })} />
          </Champ>
          <Champ label="Titre de la présentation">
            <input className={classeInput} value={r.presentation_titre} onChange={(e) => majR({ presentation_titre: e.target.value })} />
          </Champ>
          <Champ label="Texte de présentation" aide="Laissez une ligne vide pour faire un nouveau paragraphe">
            <textarea className={`${classeInput} min-h-40`} value={r.presentation_texte} onChange={(e) => majR({ presentation_texte: e.target.value })} />
          </Champ>
          <div>
            <span className="mb-1.5 block text-sm font-semibold text-bordeaux">Photo du producteur</span>
            <ChampPhoto url={r.photo_producteur_url} onChange={(u) => majR({ photo_producteur_url: u })} />
          </div>
          <Champ label="Téléphone affiché en bas du site (facultatif)">
            <input className={classeInput} type="tel" value={r.telephone_producteur} onChange={(e) => majR({ telephone_producteur: e.target.value.replace(/\s/g, "") })} />
          </Champ>
          <Champ label="Infos de retrait (affichées après la commande)">
            <input className={classeInput} value={r.infos_retrait} onChange={(e) => majR({ infos_retrait: e.target.value })} />
          </Champ>
        </div>

        <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-or-fonce">Produits</h3>
        <div className="mt-2 space-y-4">
          {ps.map((p) => (
            <div key={p.id} className="space-y-3 rounded-2xl bg-white p-4">
              <Champ label="Nom">
                <input className={classeInput} value={p.nom} onChange={(e) => majP(p.id, { nom: e.target.value })} />
              </Champ>
              <Champ label="Description">
                <textarea className={`${classeInput} min-h-20`} value={p.description} onChange={(e) => majP(p.id, { description: e.target.value })} />
              </Champ>
              <ChampPhoto url={p.photo_url} onChange={(u) => majP(p.id, { photo_url: u })} />
            </div>
          ))}
        </div>

        {erreur && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-center text-red-800">{erreur}</p>}
        <motion.button whileTap={{ scale: 0.97 }} disabled={charge} className="fond-or mt-6 w-full rounded-2xl py-4 text-lg font-bold text-bordeaux-fonce shadow-lg disabled:opacity-60">
          {charge ? "Enregistrement…" : "Enregistrer"}
        </motion.button>
      </motion.form>
    </motion.div>
  );
}
