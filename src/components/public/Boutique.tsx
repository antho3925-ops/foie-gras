"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { passerCommande } from "@/lib/donnees";
import {
  ajusterOfferts, formatEuros, formatNumero, manquantPourOffert, messageOffre, nbOfferts,
  normaliserTelephone, somme, totalCentimes,
} from "@/lib/offre";
import type { Produit, Quantites } from "@/lib/types";
import { ChoixOfferts } from "../ChoixOfferts";
import { Toque } from "../Logo";
import { Champ, classeInput, Compteur, EurosAnimes, Explosion } from "../ui";
import { CarteProduit } from "./CarteProduit";

type Erreurs = Partial<Record<"nom" | "prenom" | "telephone" | "quantites" | "envoi", string>>;

export function Boutique({ produits, seuil, infosRetrait }: { produits: Produit[]; seuil: number; infosRetrait: string }) {
  const [achetes, setAchetes] = useState<Quantites>({});
  const [offerts, setOfferts] = useState<Quantites>({});
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [envoi, setEnvoi] = useState(false);
  const [numero, setNumero] = useState<number | null>(null);
  const [fete, setFete] = useState(0);
  const formRef = useRef<HTMLDivElement>(null);

  const nbAchetes = somme(achetes);
  const droit = nbOfferts(nbAchetes, seuil);
  const total = totalCentimes(achetes, produits);
  const progression = nbAchetes === 0 ? 0 : ((nbAchetes % seuil) / seuil) * 100;
  const droitPrecedent = useRef(0);

  // quand on gagne un offert : paillettes !
  useEffect(() => {
    if (droit > droitPrecedent.current) setFete((f) => f + 1);
    droitPrecedent.current = droit;
  }, [droit]);

  const changerQuantite = (id: string, v: number) => {
    const nouveaux = { ...achetes, [id]: v };
    setAchetes(nouveaux);
    setOfferts((o) => ajusterOfferts(o, nouveaux, produits, seuil));
    setErreurs((e) => ({ ...e, quantites: undefined }));
  };

  const ajouterDepuisCarte = (id: string) => {
    changerQuantite(id, (achetes[id] || 0) + 1);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Erreurs = {};
    if (!nom.trim()) err.nom = "Indiquez votre nom";
    if (!prenom.trim()) err.prenom = "Indiquez votre prénom";
    if (!normaliserTelephone(telephone)) err.telephone = "Numéro français à 10 chiffres, ex. 06 12 34 56 78";
    if (nbAchetes < 1) err.quantites = "Choisissez au moins un foie gras";
    setErreurs(err);
    if (Object.keys(err).length) return;
    setEnvoi(true);
    try {
      const n = await passerCommande({ nom, prenom, telephone, commentaire, achetes, offerts }, produits, seuil);
      setNumero(n);
      window.scrollTo({ top: (formRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY - 90, behavior: "smooth" });
    } catch (ex) {
      setErreurs({ envoi: ex instanceof Error ? ex.message : "Une erreur est survenue, réessayez." });
    } finally {
      setEnvoi(false);
    }
  };

  const recommencer = () => {
    setAchetes({});
    setOfferts({});
    setCommentaire("");
    setNumero(null);
  };

  return (
    <>
      {/* -------- Produits -------- */}
      <section id="produits" className="px-5 pb-10 pt-24 sm:pt-28">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-or-fonce">Nos foies gras</p>
            <h2 className="font-serif text-4xl text-bordeaux sm:text-5xl">Deux recettes, un même amour</h2>
          </motion.div>
          <div className="grid gap-10 md:grid-cols-2">
            {produits.map((p, i) => (
              <CarteProduit key={p.id} produit={p} index={i} quantite={achetes[p.id] || 0} onAjouter={() => ajouterDepuisCarte(p.id)} />
            ))}
          </div>
        </div>
      </section>

      {/* -------- Formulaire -------- */}
      <section id="commander" className="scroll-mt-4 px-5 pb-28 pt-10">
        <div ref={formRef} className="mx-auto max-w-xl scroll-mt-4">
          <AnimatePresence mode="wait">
            {numero !== null ? (
              <Merci key="merci" numero={numero} prenom={prenom} infosRetrait={infosRetrait} onRecommencer={recommencer} />
            ) : (
              <motion.form
                key="form"
                onSubmit={envoyer}
                noValidate
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                transition={{ duration: 0.6 }}
                className="relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-[0_30px_80px_-30px_rgba(74,18,32,.45)] ring-1 ring-bordeaux/10 sm:p-8"
              >
                <div className="fond-or absolute inset-x-0 top-0 h-2" />
                <h2 className="text-center font-serif text-3xl text-bordeaux sm:text-4xl">Ma commande</h2>
                <p className="mt-2 text-center text-encre/60">Pas de paiement en ligne : nous vous appelons pour confirmer.</p>

                {/* Quantités */}
                <div className="mt-8 space-y-4">
                  {produits.map((p) => (
                    <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-3xl bg-creme p-3 sm:flex-nowrap sm:pr-4">
                      <div className="flex min-w-0 flex-1 basis-full items-center gap-3 sm:basis-auto">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.photo_url} alt="" className="h-14 w-14 shrink-0 rounded-2xl object-cover" />
                        <div className="min-w-0">
                          <p className="font-semibold leading-tight text-bordeaux">{p.nom}</p>
                          <p className="text-sm text-encre/60">
                            {p.poids_g} g · {formatEuros(p.prix_centimes)}
                          </p>
                        </div>
                      </div>
                      <div className="ml-auto">
                        <Compteur petit label={p.nom} valeur={achetes[p.id] || 0} onChange={(v) => changerQuantite(p.id, v)} />
                      </div>
                    </div>
                  ))}
                  <AnimatePresence>
                    {erreurs.quantites && (
                      <motion.p initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: [0, -8, 8, 0] }} exit={{ opacity: 0 }} className="text-center font-medium text-red-700">
                        {erreurs.quantites}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Jauge de l'offre */}
                <div className="relative mt-6 rounded-3xl bg-bordeaux p-5 text-creme">
                  <Explosion declencheur={fete} />
                  <div className="flex items-center justify-between gap-3">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={messageOffre(nbAchetes, seuil)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="font-serif text-lg italic"
                      >
                        {messageOffre(nbAchetes, seuil)}
                      </motion.p>
                    </AnimatePresence>
                    <span className="shrink-0 text-sm text-or-clair">
                      {nbAchetes % seuil}/{seuil}
                    </span>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/15">
                    <motion.div
                      className="fond-or relative h-full rounded-full"
                      animate={{ width: `${droit > 0 && nbAchetes % seuil === 0 ? 100 : progression}%` }}
                      transition={{ type: "spring", stiffness: 120, damping: 18 }}
                    >
                      <span className="animate-brillance absolute inset-y-0 left-0 w-1/2 bg-white/40" />
                    </motion.div>
                  </div>
                  {nbAchetes > 0 && manquantPourOffert(nbAchetes, seuil) <= 3 && (
                    <motion.div className="mt-3 flex gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      {Array.from({ length: manquantPourOffert(nbAchetes, seuil) }, (_, i) => (
                        <motion.span key={i} className="h-2 w-2 rounded-full bg-or-clair" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                      ))}
                    </motion.div>
                  )}
                </div>

                <div className="mt-6">
                  <AnimatePresence>
                    {droit > 0 && <ChoixOfferts droit={droit} produits={produits} offerts={offerts} onChange={setOfferts} />}
                  </AnimatePresence>
                </div>

                {/* Coordonnées */}
                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  <Champ label="Prénom" erreur={erreurs.prenom}>
                    <input className={classeInput} value={prenom} onChange={(e) => setPrenom(e.target.value)} autoComplete="given-name" placeholder="Marie" />
                  </Champ>
                  <Champ label="Nom" erreur={erreurs.nom}>
                    <input className={classeInput} value={nom} onChange={(e) => setNom(e.target.value)} autoComplete="family-name" placeholder="Dupont" />
                  </Champ>
                  <div className="sm:col-span-2">
                    <Champ label="Téléphone" erreur={erreurs.telephone} aide="Pour vous appeler et confirmer la commande">
                      <input
                        className={classeInput}
                        value={telephone}
                        onChange={(e) => setTelephone(e.target.value)}
                        onBlur={() => {
                          const t = normaliserTelephone(telephone);
                          if (telephone && !t) setErreurs((x) => ({ ...x, telephone: "Numéro français à 10 chiffres, ex. 06 12 34 56 78" }));
                          else setErreurs((x) => ({ ...x, telephone: undefined }));
                        }}
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="06 12 34 56 78"
                      />
                    </Champ>
                  </div>
                  <div className="sm:col-span-2">
                    <Champ label="Commentaire (facultatif)">
                      <textarea
                        className={`${classeInput} min-h-24 resize-y`}
                        value={commentaire}
                        onChange={(e) => setCommentaire(e.target.value)}
                        maxLength={1000}
                        placeholder="Une date souhaitée, une question…"
                      />
                    </Champ>
                  </div>
                </div>

                {/* Total */}
                <div className="mt-8 space-y-2 rounded-3xl bg-creme p-5">
                  {produits.map((p) =>
                    achetes[p.id] ? (
                      <div key={p.id} className="flex justify-between text-encre/80">
                        <span>
                          {achetes[p.id]} × {p.nom.replace(/^Foie gras /i, "")}
                        </span>
                        <span className="tabular-nums">{formatEuros(achetes[p.id] * p.prix_centimes)}</span>
                      </div>
                    ) : null,
                  )}
                  <AnimatePresence>
                    {produits.map((p) =>
                      offerts[p.id] ? (
                        <motion.div
                          key={`o-${p.id}`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex justify-between font-medium text-or-fonce"
                        >
                          <span>
                            🎁 {offerts[p.id]} × {p.nom.replace(/^Foie gras /i, "")} offert{offerts[p.id] > 1 ? "s" : ""}
                          </span>
                          <span>0 €</span>
                        </motion.div>
                      ) : null,
                    )}
                  </AnimatePresence>
                  <div className="flex items-end justify-between border-t border-bordeaux/15 pt-3">
                    <span className="font-serif text-xl text-bordeaux">Total</span>
                    <EurosAnimes centimes={total} className="font-serif text-4xl font-bold text-bordeaux" />
                  </div>
                </div>

                {erreurs.envoi && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-center text-red-800">{erreurs.envoi}</p>}

                <motion.button
                  type="submit"
                  disabled={envoi}
                  whileTap={{ scale: 0.96 }}
                  className="fond-or relative mt-6 w-full overflow-hidden rounded-2xl py-5 text-xl font-bold text-bordeaux-fonce shadow-[0_15px_40px_-15px_rgba(201,160,67,.9)] disabled:opacity-70"
                >
                  <span className="relative z-10 inline-flex items-center gap-3">
                    {envoi ? (
                      <>
                        <motion.span className="inline-block h-5 w-5 rounded-full border-[3px] border-bordeaux-fonce/30 border-t-bordeaux-fonce" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
                        Envoi en cours…
                      </>
                    ) : (
                      "Envoyer ma commande"
                    )}
                  </span>
                  <span className="animate-brillance absolute inset-y-0 left-0 w-1/3 bg-white/50" />
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* -------- Mini panier flottant (mobile) -------- */}
      <AnimatePresence>
        {nbAchetes > 0 && numero === null && (
          <motion.a
            href="#commander"
            initial={{ y: 120 }}
            animate={{ y: 0 }}
            exit={{ y: 120 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="no-print fixed inset-x-4 bottom-4 z-40 flex items-center justify-between rounded-full bg-bordeaux-fonce/95 px-6 py-4 text-creme shadow-2xl backdrop-blur md:hidden"
          >
            <span className="font-medium">
              {nbAchetes} foie{nbAchetes > 1 ? "s" : ""} gras{droit > 0 ? ` + ${droit} 🎁` : ""}
            </span>
            <EurosAnimes centimes={total} className="font-serif text-xl font-bold text-or-clair" />
          </motion.a>
        )}
      </AnimatePresence>
    </>
  );
}

function Merci({ numero, prenom, infosRetrait, onRecommencer }: { numero: number; prenom: string; infosRetrait: string; onRecommencer: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 140, damping: 16 }}
      className="relative overflow-hidden rounded-[2rem] bg-bordeaux-fonce p-8 text-center text-creme shadow-2xl sm:p-12"
    >
      <div className="grain absolute inset-0" />
      <Explosion declencheur={1} nombre={30} />
      <motion.div initial={{ y: -30 }} animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="relative mx-auto w-fit">
        <Toque anime className="h-28 w-28 text-or" />
      </motion.div>
      <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="texte-or relative mt-4 font-serif text-5xl italic">
        Merci{prenom.trim() ? ` ${prenom.trim()}` : ""} !
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="relative mt-4 text-xl leading-relaxed">
        Nous vous appellerons pour confirmer votre commande.
      </motion.p>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="relative mt-3 text-creme/70">
        Commande {formatNumero(numero)}
        {infosRetrait ? ` · ${infosRetrait}` : ""}
      </motion.p>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        onClick={onRecommencer}
        className="relative mt-8 rounded-full border border-or/60 px-6 py-3 text-or-clair transition-colors hover:bg-white/10"
      >
        Passer une autre commande
      </motion.button>
    </motion.div>
  );
}
