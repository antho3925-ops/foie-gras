"use client";

import { formatEuros, formatNumero, formatTelephone } from "./offre";
import type { Commande, Produit } from "./types";

// jsPDF ne connaît pas les espaces insécables fines utilisées par Intl
const t = (s: string) => s.replace(/[  ]/g, " ");

const BORDEAUX: [number, number, number] = [107, 30, 46];
const OR: [number, number, number] = [201, 160, 67];
const ENCRE: [number, number, number] = [43, 26, 23];

/** Génère et télécharge le bon de commande PDF (A4) */
export async function telechargerBon(c: Commande, produits: Produit[], nomProducteur: string, telProducteur: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const L = 210;
  const m = 18;

  // bandeau
  doc.setFillColor(...BORDEAUX);
  doc.rect(0, 0, L, 38, "F");
  doc.setFillColor(...OR);
  doc.rect(0, 38, L, 1.5, "F");
  doc.setTextColor(243, 213, 138);
  doc.setFont("times", "bolditalic");
  doc.setFontSize(26);
  doc.text(t(nomProducteur), m, 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(251, 246, 238);
  doc.text(t(`Foie gras maison${telProducteur ? ` · ${formatTelephone(telProducteur)}` : ""}`), m, 29);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("BON DE COMMANDE", L - m, 18, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(t(formatNumero(c.numero)), L - m, 26, { align: "right" });

  // infos
  let y = 54;
  const date = new Date(c.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const ligneInfo = (label: string, valeur: string, x: number) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 100, 95);
    doc.text(label.toUpperCase(), x, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...ENCRE);
    doc.text(t(valeur), x, y + 6);
  };
  ligneInfo("Client", `${c.prenom} ${c.nom}`, m);
  ligneInfo("Téléphone", formatTelephone(c.telephone), 110);
  y += 16;
  ligneInfo("Date", date, m);
  ligneInfo("Origine", c.origine === "en_ligne" ? "Commande en ligne" : "Commande directe", 110);

  // tableau
  y += 20;
  doc.setFillColor(243, 232, 214);
  doc.rect(m, y - 6, L - 2 * m, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BORDEAUX);
  const cols = [m + 3, 120, 150, L - m - 3];
  doc.text("Produit", cols[0], y);
  doc.text("Qté", cols[1], y, { align: "right" });
  doc.text("Prix unit.", cols[2], y, { align: "right" });
  doc.text("Total", cols[3], y, { align: "right" });
  y += 11;

  doc.setTextColor(...ENCRE);
  const nomDe = (id: string) => produits.find((p) => p.id === id)?.nom ?? id;
  const poidsDe = (id: string) => produits.find((p) => p.id === id)?.poids_g ?? 500;
  const ligneTableau = (libelle: string, q: number, pu: string, total: string, offert = false) => {
    doc.setFont("helvetica", offert ? "italic" : "normal");
    doc.setFontSize(11);
    if (offert) doc.setTextColor(...OR);
    else doc.setTextColor(...ENCRE);
    doc.text(t(libelle), cols[0], y);
    doc.text(String(q), cols[1], y, { align: "right" });
    doc.text(t(pu), cols[2], y, { align: "right" });
    doc.text(t(total), cols[3], y, { align: "right" });
    doc.setDrawColor(230, 220, 205);
    doc.line(m, y + 3.5, L - m, y + 3.5);
    y += 10;
  };
  for (const l of c.lignes) {
    if (l.quantite_achetee > 0)
      ligneTableau(
        `${nomDe(l.produit_id)} (${poidsDe(l.produit_id)} g)`,
        l.quantite_achetee,
        formatEuros(l.prix_unitaire_centimes),
        formatEuros(l.quantite_achetee * l.prix_unitaire_centimes),
      );
  }
  for (const l of c.lignes) {
    if (l.quantite_offerte > 0)
      ligneTableau(`Offert : ${nomDe(l.produit_id)} (${poidsDe(l.produit_id)} g)`, l.quantite_offerte, "0 €", "0 €", true);
  }

  // total
  y += 4;
  doc.setFillColor(...BORDEAUX);
  doc.roundedRect(120, y - 7, L - m - 120, 13, 2, 2, "F");
  doc.setTextColor(251, 246, 238);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("TOTAL", 125, y + 1.5);
  doc.text(t(formatEuros(c.total_centimes)), L - m - 4, y + 1.5, { align: "right" });

  // commentaire
  y += 20;
  if (c.commentaire) {
    doc.setTextColor(120, 100, 95);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("COMMENTAIRE", m, y);
    doc.setTextColor(...ENCRE);
    doc.setFontSize(11);
    const lignes = doc.splitTextToSize(t(c.commentaire), L - 2 * m);
    doc.text(lignes, m, y + 6);
    y += 8 + lignes.length * 5;
  }

  // signatures
  const ys = Math.max(y + 15, 230);
  doc.setDrawColor(...OR);
  doc.setLineWidth(0.4);
  doc.roundedRect(m, ys, 80, 35, 2, 2);
  doc.roundedRect(L - m - 80, ys, 80, 35, 2, 2);
  doc.setFontSize(9);
  doc.setTextColor(120, 100, 95);
  doc.text("Signature du client", m + 4, ys + 6);
  doc.text("Signature du producteur", L - m - 76, ys + 6);

  doc.setFontSize(8);
  doc.text(t(`${nomProducteur} · Merci pour votre confiance !`), L / 2, 287, { align: "center" });

  doc.save(`bon-commande-${String(c.numero).padStart(4, "0")}-${c.nom.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.pdf`);
}
