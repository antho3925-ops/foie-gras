import type { Metadata } from "next";
import { Toque } from "@/components/Logo";

export const metadata: Metadata = { title: "Guide producteur · La Toque Dorée", robots: { index: false, follow: false } };

const VIDEO = "/guide/la-toque-doree-presentation.mp4?v=2";
const PDF = "/guide/la-toque-doree-guide.pdf";

export default function Guide() {
  return (
    <main className="min-h-[100svh] bg-bordeaux-fonce px-5 py-10 text-creme">
      <div className="mx-auto max-w-md text-center">
        <Toque className="mx-auto h-20 w-20 text-or" />
        <h1 className="texte-or mt-3 font-serif text-4xl italic">Guide producteur</h1>
        <p className="mt-2 text-creme/75">La vidéo de présentation et le guide de l&apos;espace admin.</p>

        <video
          src={VIDEO}
          poster="/guide/apercu.jpg"
          controls
          playsInline
          preload="metadata"
          className="mx-auto mt-8 aspect-[9/16] w-full max-w-xs rounded-3xl bg-black shadow-2xl ring-2 ring-or/50"
        />

        <div className="mt-8 space-y-3">
          <a href={VIDEO} download className="fond-or block rounded-2xl py-4 text-lg font-bold text-bordeaux-fonce shadow-lg active:scale-95">
            ⬇️ Télécharger la vidéo
          </a>
          <a href={PDF} download className="block rounded-2xl bg-creme py-4 text-lg font-bold text-bordeaux shadow-lg active:scale-95">
            ⬇️ Télécharger le guide PDF
          </a>
          <a href={PDF} target="_blank" className="block py-2 text-creme/70 underline underline-offset-4">
            Ou lire le guide directement
          </a>
        </div>
        <p className="mt-8 text-sm text-creme/50">
          Sur iPhone : après le téléchargement, ouvrez le fichier puis touchez le bouton Partager pour l&apos;enregistrer dans Photos ou Fichiers.
        </p>
      </div>
    </main>
  );
}
