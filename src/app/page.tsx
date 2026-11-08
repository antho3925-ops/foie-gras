import { Boutique } from "@/components/public/Boutique";
import { Entete, PiedDePage } from "@/components/public/Cadre";
import { Hero } from "@/components/public/Hero";
import { BandeauOffre, Presentation } from "@/components/public/Presentation";
import { chargerVitrine } from "@/lib/vitrine";

// toujours à jour quand l'admin change un prix ou un texte
export const dynamic = "force-dynamic";

export default async function Accueil() {
  const { reglages, produits } = await chargerVitrine();
  return (
    <main className="overflow-x-clip">
      <Entete nom={reglages.nom_producteur} />
      <Hero nom={reglages.nom_producteur} slogan={reglages.slogan} seuil={reglages.offre_seuil} />
      <Presentation titre={reglages.presentation_titre} texte={reglages.presentation_texte} photo={reglages.photo_producteur_url} />
      <BandeauOffre seuil={reglages.offre_seuil} />
      <Boutique produits={produits} seuil={reglages.offre_seuil} infosRetrait={reglages.infos_retrait} />
      <PiedDePage nom={reglages.nom_producteur} telephone={reglages.telephone_producteur} />
    </main>
  );
}
