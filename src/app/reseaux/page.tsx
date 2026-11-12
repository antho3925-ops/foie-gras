import type { Metadata } from "next";
import { Toque } from "@/components/Logo";

export const metadata: Metadata = { title: "Réseaux sociaux · La Toque Dorée", robots: { index: false, follow: false } };

const D = "/reseaux/";

const REELS = [
  { f: "reel-1-presentation", t: "Reel présentation", d: "16 secondes" },
  { f: "reel-2-offre-10-1", t: "Reel offre 10 + 1", d: "12 secondes" },
  { f: "reel-3-noel", t: "Reel Noël", d: "13 secondes" },
];

const AFFICHES = [
  { f: "1-signature", t: "Signature" },
  { f: "2-duo", t: "Duo" },
  { f: "3-offre-10-1", t: "Offre 10 + 1" },
  { f: "4-noel", t: "Noël" },
];

function Bouton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} download className="fond-or mt-3 block rounded-2xl py-3 text-center font-bold text-bordeaux-fonce shadow-lg active:scale-95">
      {children}
    </a>
  );
}

export default function Reseaux() {
  return (
    <main className="min-h-[100svh] bg-bordeaux-fonce px-5 py-10 text-creme">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <Toque className="mx-auto h-20 w-20 text-or" />
          <h1 className="texte-or mt-3 font-serif text-4xl italic">Réseaux sociaux</h1>
          <p className="mt-2 text-creme/75">Les reels et les affiches à publier sur Instagram et Snapchat.</p>
        </div>

        <h2 className="mt-10 font-serif text-2xl">Reels vidéo</h2>
        <p className="text-sm text-creme/60">Sans son : ajoutez une musique dans Instagram ou Snapchat.</p>
        <div className="mt-4 space-y-8">
          {REELS.map((r) => (
            <div key={r.f}>
              <video
                src={`${D}${r.f}.mp4`}
                poster={`${D}${r.f}.jpg`}
                controls
                playsInline
                preload="none"
                className="mx-auto aspect-[9/16] w-full max-w-xs rounded-3xl bg-black shadow-2xl ring-2 ring-or/50"
              />
              <p className="mt-3 text-center font-semibold">
                {r.t} <span className="font-normal text-creme/60">· {r.d}</span>
              </p>
              <Bouton href={`${D}${r.f}.mp4`}>⬇️ Télécharger la vidéo</Bouton>
            </div>
          ))}
        </div>

        <h2 className="mt-12 font-serif text-2xl">Affiches</h2>
        <p className="text-sm text-creme/60">Story pour Snapchat et Instagram, post pour le fil Instagram.</p>
        <div className="mt-4 space-y-10">
          {AFFICHES.map((a) => (
            <div key={a.f}>
              <p className="mb-3 text-center font-serif text-xl text-or">{a.t}</p>
              <div className="grid grid-cols-2 items-end gap-3">
                <div>
                  <img src={`${D}story-${a.f}-mini.jpg`} alt={`Story ${a.t}`} className="aspect-[9/16] w-full rounded-2xl object-cover ring-1 ring-or/40" />
                  <Bouton href={`${D}story-${a.f}.png`}>⬇️ Story</Bouton>
                </div>
                <div>
                  <img src={`${D}post-${a.f}-mini.jpg`} alt={`Post ${a.t}`} className="aspect-[4/5] w-full rounded-2xl object-cover ring-1 ring-or/40" />
                  <Bouton href={`${D}post-${a.f}.png`}>⬇️ Post</Bouton>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-creme/50">
          Sur iPhone : après le téléchargement, ouvrez le fichier puis touchez le bouton Partager pour l&apos;enregistrer dans Photos.
        </p>
      </div>
    </main>
  );
}
