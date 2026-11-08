/**
 * Adresse et clé publique du projet Supabase.
 * Ces deux valeurs sont faites pour être publiques : la sécurité est assurée
 * par les règles de la base (RLS). Ne mettez JAMAIS ici la clé « secret ».
 * Les variables d'environnement, si elles existent, ont la priorité.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bklsyjuseuctdbetlekn.supabase.co";
export const SUPABASE_CLE_PUBLIQUE =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_ljYnm5DPgZ2VlSR_92UAxQ_0JWwc5Nc";
