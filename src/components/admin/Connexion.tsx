"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";
import { connexion } from "@/lib/donnees";
import { supabaseConfigure } from "@/lib/supabase";
import { Toque } from "../Logo";
import { Champ, classeInput } from "../ui";

export function Connexion({ onConnecte }: { onConnecte: () => void }) {
  const [email, setEmail] = useState("");
  const [mdp, setMdp] = useState("");
  const [erreur, setErreur] = useState("");
  const [charge, setCharge] = useState(false);

  const valider = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");
    setCharge(true);
    try {
      await connexion(email.trim(), mdp);
      onConnecte();
    } catch (ex) {
      setErreur(ex instanceof Error ? ex.message : "Connexion impossible");
    } finally {
      setCharge(false);
    }
  };

  return (
    <div className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-bordeaux-fonce p-5">
      <div className="grain absolute inset-0" />
      <motion.div
        className="absolute -right-1/4 -top-1/4 h-[60vmax] w-[60vmax] rounded-full bg-or/20 blur-3xl"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.form
        onSubmit={valider}
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 140, damping: 18 }}
        className="relative w-full max-w-sm rounded-[2rem] bg-creme p-7 shadow-2xl"
      >
        <Toque anime className="mx-auto h-20 w-20 text-bordeaux" />
        <h1 className="mt-3 text-center font-serif text-3xl italic text-bordeaux">Espace producteur</h1>
        {!supabaseConfigure && (
          <p className="mt-3 rounded-2xl bg-or-clair/40 p-3 text-center text-sm text-bordeaux-fonce">
            Mode démo : Supabase n&apos;est pas encore branché. Cliquez simplement sur « Se connecter ».
          </p>
        )}
        <div className="mt-6 space-y-4">
          <Champ label="Email">
            <input className={classeInput} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required={supabaseConfigure} />
          </Champ>
          <Champ label="Mot de passe">
            <input className={classeInput} type="password" autoComplete="current-password" value={mdp} onChange={(e) => setMdp(e.target.value)} required={supabaseConfigure} />
          </Champ>
        </div>
        {erreur && (
          <motion.p initial={{ x: -8 }} animate={{ x: [0, -8, 8, -4, 0] }} className="mt-4 rounded-2xl bg-red-50 p-3 text-center text-red-800">
            {erreur}
          </motion.p>
        )}
        <motion.button
          whileTap={{ scale: 0.96 }}
          disabled={charge}
          className="mt-6 w-full rounded-2xl bg-bordeaux py-4 text-lg font-semibold text-creme shadow-lg disabled:opacity-60"
        >
          {charge ? "Connexion…" : "Se connecter"}
        </motion.button>
        <Link href="/" className="mt-4 block text-center text-sm text-encre/50 hover:underline">
          ← Retour au site
        </Link>
      </motion.form>
    </div>
  );
}
