"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { enregistrerCommande } from "@/lib/donnees";
import { ajusterOfferts, formatEuros, formatTelephone, messageOffre, nbOfferts, normaliserTelephone, somme, totalCentimes } from "@/lib/offre";
import { STATUTS, type Commande, type Produit, type Quantites, type SaisieCommande } from "@/lib/types";
import { ChoixOfferts } from "../ChoixOfferts";
import { Champ, classeInput, Compteur, EurosAnimes } from "../ui";

/** Fenêtre d'ajout (commande directe) ou de modification d'une commande */
export function FormCommande({
  commande,
  produits,
  seuil,
  onFermer,
  onEnregistre,
}: {
  commande: Commande | null;
  produits: Produit[];
  seuil: number;
  onFermer: () => void;
  onEnregistre: (message: string) => void;
}) {
  const depuis = (cle: "quantite_achetee" | "quantite_offerte"): Quantites =>
    Object.fromEntries((commande?.lignes ?? []).map((l) => [l.produit_id, l[cle]]));

  const [s, setS] = useState<SaisieCommande>({
    id: commande?.id,
    origine: commande?.origine ?? "directe",
    statut: commande?.statut ?? "confirmee",
    nom: commande?.nom ?? "",
    prenom: commande?.prenom ?? "",
    telephone: commande ? formatTelephone(commande.telephone) : "",
    commentaire: commande?.commentaire ?? "",
    achetes: depuis("quantite_achetee"),
    offerts: depuis("quantite_offerte"),
  });
  const [erreur, setErreur] = useState("");
  const [charge, setCharge] = useState(false);

  const nb = somme(s.achetes);
  const droit = nbOfferts(nb, seuil);
  const maj = (p: Partial<SaisieCommande>) => setS((x) => ({ ...x, ...p }));

  const changerQuantite = (id: string, v: number) => {
    const achetes = { ...s.achetes, [id]: v };
    maj({ achetes, offerts: ajusterOfferts(s.offerts, achetes, produits, seuil) });
  };

  const valider = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");
    if (!s.nom.trim() || !s.prenom.trim()) return setErreur("Nom et prénom obligatoires.");
    if (!normaliserTelephone(s.telephone)) return setErreur("Téléphone invalide (ex. 06 12 34 56 78).");
    if (nb < 1) return setErreur("Il faut au moins un foie gras.");
    setCharge(true);
    try {
      await enregistrerCommande(s, produits, seuil);
      onEnregistre(commande ? "Commande modifiée" : "Commande directe ajoutée");
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
        noValidate
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="relative max-h-[94svh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-creme p-5 pb-8 shadow-2xl sm:rounded-[2rem] sm:p-7"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-bordeaux/20 sm:hidden" />
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-bordeaux">{commande ? "Modifier la commande" : "Nouvelle commande directe"}</h2>
          <button type="button" onClick={onFermer} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-bordeaux shadow" aria-label="Fermer">
            ×
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Champ label="Prénom">
            <input className={classeInput} value={s.prenom} onChange={(e) => maj({ prenom: e.target.value })} />
          </Champ>
          <Champ label="Nom">
            <input className={classeInput} value={s.nom} onChange={(e) => maj({ nom: e.target.value })} />
          </Champ>
          <div className="col-span-2">
            <Champ label="Téléphone">
              <input className={classeInput} type="tel" inputMode="tel" value={s.telephone} onChange={(e) => maj({ telephone: e.target.value })} placeholder="06 12 34 56 78" />
            </Champ>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {produits.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3">
              <div>
                <p className="font-semibold leading-tight text-bordeaux">{p.nom.replace(/^Foie gras /i, "")}</p>
                <p className="text-sm text-encre/50">{formatEuros(p.prix_centimes)}</p>
              </div>
              <Compteur petit label={p.nom} valeur={s.achetes[p.id] || 0} onChange={(v) => changerQuantite(p.id, v)} />
            </div>
          ))}
          <p className="text-center text-sm italic text-or-fonce">{messageOffre(nb, seuil)}</p>
          <AnimatePresence>
            {droit > 0 && <ChoixOfferts droit={droit} produits={produits} offerts={s.offerts} onChange={(o) => maj({ offerts: o })} />}
          </AnimatePresence>
        </div>

        <div className="mt-5">
          <span className="mb-1.5 block text-sm font-semibold text-bordeaux">Statut</span>
          <div className="flex flex-wrap gap-2">
            {STATUTS.map((st) => (
              <button
                type="button"
                key={st.id}
                onClick={() => maj({ statut: st.id })}
                className={`rounded-full px-3.5 py-2 text-sm font-semibold ring-1 transition-all ${
                  s.statut === st.id ? `${st.classes} scale-105 ring-2` : "bg-white text-encre/50 ring-bordeaux/10"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <Champ label="Commentaire">
            <textarea className={`${classeInput} min-h-20`} value={s.commentaire} onChange={(e) => maj({ commentaire: e.target.value })} />
          </Champ>
        </div>

        <div className="mt-5 flex items-center justify-between rounded-2xl bg-bordeaux p-4 text-creme">
          <span>
            Total{droit > 0 ? ` (+ ${droit} offert${droit > 1 ? "s" : ""})` : ""}
          </span>
          <EurosAnimes centimes={totalCentimes(s.achetes, produits)} className="font-serif text-2xl font-bold text-or-clair" />
        </div>

        {erreur && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-center text-red-800">{erreur}</p>}

        <motion.button whileTap={{ scale: 0.97 }} disabled={charge} className="fond-or mt-5 w-full rounded-2xl py-4 text-lg font-bold text-bordeaux-fonce shadow-lg disabled:opacity-60">
          {charge ? "Enregistrement…" : commande ? "Enregistrer les modifications" : "Ajouter la commande"}
        </motion.button>
      </motion.form>
    </motion.div>
  );
}
