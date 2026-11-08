"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { changerStatut, chargerTout, deconnexion, reinitialiserDemo, supprimerCommande } from "@/lib/donnees";
import { telechargerBon } from "@/lib/pdf";
import { supabaseConfigure } from "@/lib/supabase";
import { STATUTS, type Commande, type Produit, type Reglages, type Statut } from "@/lib/types";
import { LogoLigne } from "../Logo";
import { CarteCommande } from "./CarteCommande";
import { FormCommande } from "./FormCommande";
import { Recap } from "./Recap";
import { ReglagesPanneau } from "./Reglages";

type Onglet = "en_ligne" | "directe" | "toutes";
const ONGLETS: { id: Onglet; label: string }[] = [
  { id: "en_ligne", label: "Commandes en ligne" },
  { id: "directe", label: "Commandes directes" },
  { id: "toutes", label: "Toutes les commandes" },
];

const sansAccents = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function Tableau({ onDeconnecte }: { onDeconnecte: () => void }) {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [reglages, setReglages] = useState<Reglages | null>(null);
  const [erreur, setErreur] = useState("");
  const [onglet, setOnglet] = useState<Onglet>("toutes");
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState<Statut | "tous">("tous");
  const [edition, setEdition] = useState<Commande | null | "nouvelle">(null);
  const [voirReglages, setVoirReglages] = useState(false);
  const [toast, setToast] = useState("");

  const recharger = useCallback(async () => {
    try {
      const d = await chargerTout();
      setCommandes(d.commandes);
      setProduits(d.produits);
      setReglages(d.reglages);
      setErreur("");
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Chargement impossible");
    }
  }, []);

  useEffect(() => {
    // chargement initial des données
    // eslint-disable-next-line react-hooks/set-state-in-effect
    recharger();
  }, [recharger]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const visibles = useMemo(() => {
    const q = sansAccents(recherche.trim());
    return commandes.filter(
      (c) =>
        (onglet === "toutes" || c.origine === onglet) &&
        (filtre === "tous" || c.statut === filtre) &&
        (!q || sansAccents(`${c.prenom} ${c.nom} ${c.nom} ${c.prenom}`).includes(q) || c.telephone.includes(q.replace(/\s/g, ""))),
    );
  }, [commandes, onglet, filtre, recherche]);

  const compte = (o: Onglet) => commandes.filter((c) => o === "toutes" || c.origine === o).length;

  const statut = async (c: Commande, s: Statut) => {
    setCommandes((cs) => cs.map((x) => (x.id === c.id ? { ...x, statut: s } : x))); // affichage immédiat
    try {
      await changerStatut(c.id, s);
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Erreur");
      recharger();
    }
  };

  const supprimer = async (c: Commande) => {
    setCommandes((cs) => cs.filter((x) => x.id !== c.id));
    try {
      await supprimerCommande(c.id);
      setToast("Commande supprimée");
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Erreur");
      recharger();
    }
  };

  if (!reglages) {
    return (
      <div className="flex min-h-[100svh] items-center justify-center bg-creme">
        {erreur ? (
          <p className="max-w-sm rounded-2xl bg-red-50 p-4 text-center text-red-800">{erreur}</p>
        ) : (
          <motion.div className="h-12 w-12 rounded-full border-4 border-bordeaux/20 border-t-bordeaux" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-creme pb-28">
      {/* En-tête */}
      <header className="sticky top-0 z-30 border-b border-bordeaux/10 bg-creme/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-2.5">
          <LogoLigne nom={reglages.nom_producteur} />
          <div className="flex gap-2">
            <button onClick={() => setVoirReglages(true)} className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-bordeaux shadow-sm ring-1 ring-bordeaux/10" aria-label="Réglages">
              ⚙️<span className="hidden sm:inline"> Réglages</span>
            </button>
            <button
              onClick={async () => {
                await deconnexion();
                onDeconnecte();
              }}
              className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-encre/60 shadow-sm ring-1 ring-bordeaux/10"
            >
              Quitter
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4">
        {!supabaseConfigure && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-or-clair/40 p-3 text-sm text-bordeaux-fonce">
            <span>Mode démo : les données restent dans ce navigateur.</span>
            <button
              className="font-semibold underline"
              onClick={() => {
                reinitialiserDemo();
                recharger();
              }}
            >
              Remettre les exemples
            </button>
          </div>
        )}
        {erreur && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-red-800">{erreur}</p>}

        <h1 className="mb-4 mt-6 font-serif text-3xl text-bordeaux">Tableau de bord</h1>
        <Recap commandes={commandes} produits={produits} />

        {/* Onglets */}
        <div className="sticky top-[57px] z-20 -mx-4 mt-8 bg-creme/95 px-4 pb-3 pt-2 backdrop-blur">
          <div className="grid grid-cols-3 gap-1 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-bordeaux/10">
            {ONGLETS.map((o) => (
              <button
                key={o.id}
                onClick={() => setOnglet(o.id)}
                className={`relative rounded-xl px-1 py-3 text-[13px] font-semibold leading-tight transition-colors sm:text-base ${onglet === o.id ? "text-creme" : "text-bordeaux"}`}
              >
                {onglet === o.id && <motion.span layoutId="onglet" className="absolute inset-0 rounded-xl bg-bordeaux" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                <span className="relative">
                  {o.label}
                  <span className={`ml-1 inline-block rounded-full px-1.5 text-xs ${onglet === o.id ? "bg-or text-bordeaux-fonce" : "bg-creme"}`}>{compte(o.id)}</span>
                </span>
              </button>
            ))}
          </div>

          {/* Recherche et filtre */}
          <div className="mt-3 flex gap-2">
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="🔍 Rechercher un nom…"
              className="min-w-0 flex-1 rounded-2xl border-2 border-bordeaux/10 bg-white px-4 py-3 text-base outline-none focus:border-or"
            />
            <select
              value={filtre}
              onChange={(e) => setFiltre(e.target.value as Statut | "tous")}
              className="rounded-2xl border-2 border-bordeaux/10 bg-white px-3 py-3 text-base text-bordeaux outline-none focus:border-or"
              aria-label="Filtrer par statut"
            >
              <option value="tous">Tous statuts</option>
              {STATUTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Liste */}
        <motion.div layout className="mt-2 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visibles.map((c) => (
              <CarteCommande
                key={c.id}
                c={c}
                produits={produits}
                onStatut={(s) => statut(c, s)}
                onModifier={() => setEdition(c)}
                onSupprimer={() => supprimer(c)}
                onPdf={() => telechargerBon(c, produits, reglages.nom_producteur, reglages.telephone_producteur)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
        {visibles.length === 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 text-center text-encre/50">
            Aucune commande ici pour le moment.
          </motion.p>
        )}
      </main>

      {/* Bouton + Ajouter */}
      <motion.button
        onClick={() => setEdition("nouvelle")}
        initial={{ scale: 0, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", delay: 0.4 }}
        className="fond-or fixed bottom-5 left-1/2 z-40 -translate-x-1/2 whitespace-nowrap rounded-full px-7 py-4 text-lg font-bold text-bordeaux-fonce shadow-[0_15px_40px_-10px_rgba(107,30,46,.6)]"
      >
        + Ajouter une commande
      </motion.button>

      <AnimatePresence>
        {edition && (
          <FormCommande
            key="form"
            commande={edition === "nouvelle" ? null : edition}
            produits={produits}
            seuil={reglages.offre_seuil}
            onFermer={() => setEdition(null)}
            onEnregistre={(m) => {
              setEdition(null);
              setToast(m);
              if (edition === "nouvelle") setOnglet((o) => (o === "en_ligne" ? "directe" : o));
              recharger();
            }}
          />
        )}
        {voirReglages && (
          <ReglagesPanneau
            key="reglages"
            reglages={reglages}
            produits={produits}
            onFermer={() => setVoirReglages(false)}
            onEnregistre={() => {
              setVoirReglages(false);
              setToast("Réglages enregistrés");
              recharger();
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="fixed inset-x-0 top-3 z-[60] mx-auto w-fit rounded-full bg-bordeaux-fonce px-5 py-3 font-semibold text-creme shadow-xl"
          >
            ✓ {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
