"use client";

import { useEffect, useState } from "react";
import { Connexion } from "@/components/admin/Connexion";
import { Tableau } from "@/components/admin/Tableau";
import { sessionActive } from "@/lib/donnees";

export default function Admin() {
  const [etat, setEtat] = useState<"chargement" | "connecte" | "deconnecte">("chargement");
  useEffect(() => {
    sessionActive().then((ok) => setEtat(ok ? "connecte" : "deconnecte"));
  }, []);
  if (etat === "chargement") return <div className="min-h-[100svh] bg-bordeaux-fonce" />;
  if (etat === "deconnecte") return <Connexion onConnecte={() => setEtat("connecte")} />;
  return <Tableau onDeconnecte={() => setEtat("deconnecte")} />;
}
