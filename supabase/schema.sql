-- =====================================================================
--  La Toque Dorée : schéma de la base Supabase
--  À coller en entier dans Supabase > SQL Editor > New query > Run.
--  Le script peut être relancé sans danger (il ne supprime aucune donnée).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Tables
-- ---------------------------------------------------------------------

-- Réglages du site (une seule ligne, id = 1)
create table if not exists public.reglages (
  id                   int primary key default 1 check (id = 1),
  nom_producteur       text not null default 'La Toque Dorée',
  slogan               text not null default 'Foie gras maison, préparé avec passion',
  presentation_titre   text not null default 'Un savoir-faire de famille',
  presentation_texte   text not null default '',
  photo_producteur_url text not null default '/photos/producteur.jpeg',
  telephone_producteur text not null default '',
  infos_retrait        text not null default '',
  offre_seuil          int  not null default 10 check (offre_seuil between 2 and 100),
  updated_at           timestamptz not null default now()
);

-- Produits (classique et croûte de poivre)
create table if not exists public.produits (
  id            text primary key,
  nom           text not null,
  description   text not null default '',
  poids_g       int  not null default 500,
  prix_centimes int  not null check (prix_centimes >= 0),
  photo_url     text not null default '',
  ordre         int  not null default 0,
  actif         boolean not null default true
);

-- Commandes
create table if not exists public.commandes (
  id            uuid primary key default gen_random_uuid(),
  numero        bigint generated always as identity unique,
  origine       text not null check (origine in ('en_ligne', 'directe')),
  statut        text not null default 'a_appeler'
                check (statut in ('a_appeler', 'confirmee', 'prete', 'recuperee', 'annulee')),
  nom           text not null check (length(trim(nom)) between 1 and 80),
  prenom        text not null check (length(trim(prenom)) between 1 and 80),
  telephone     text not null check (telephone ~ '^0[1-9][0-9]{8}$'),
  commentaire   text not null default '' check (length(commentaire) <= 1000),
  total_centimes int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists commandes_created_at_idx on public.commandes (created_at desc);

-- Lignes de commande (le prix est figé au moment de la commande)
create table if not exists public.lignes_commande (
  id                     uuid primary key default gen_random_uuid(),
  commande_id            uuid not null references public.commandes (id) on delete cascade,
  produit_id             text not null references public.produits (id),
  quantite_achetee       int  not null default 0 check (quantite_achetee between 0 and 999),
  quantite_offerte       int  not null default 0 check (quantite_offerte between 0 and 999),
  prix_unitaire_centimes int  not null check (prix_unitaire_centimes >= 0),
  unique (commande_id, produit_id)
);

-- Administrateurs autorisés (le compte de ton ami)
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

-- ---------------------------------------------------------------------
-- 2. Données de départ
-- ---------------------------------------------------------------------
insert into public.reglages (id, presentation_texte, infos_retrait)
values (1,
  'Dans notre petite cuisine, chaque foie gras est déveiné à la main, assaisonné simplement puis cuit doucement, comme on le fait depuis toujours à la maison. Pas d''additif, pas de raccourci : juste du bon produit, du temps et beaucoup d''amour du métier.',
  'Retrait sur place, nous vous appelons pour convenir du jour.')
on conflict (id) do nothing;

insert into public.produits (id, nom, description, prix_centimes, photo_url, ordre) values
  ('classique', 'Foie gras classique',
   'Mi-cuit, fondant, assaisonné au sel et au poivre. Le grand classique des fêtes.',
   7000, '/photos/classique.jpeg', 1),
  ('poivre', 'Foie gras en croûte de poivre',
   'Enrobé d''une croûte de poivres concassés pour une note chaude et parfumée.',
   7000, '/photos/croute-poivre.png', 2)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- 3. Fonctions
-- ---------------------------------------------------------------------

-- Vrai si l'utilisateur connecté est administrateur
create or replace function public.est_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- Normalise un numéro français : "+33 6 12 34 56 78" -> "0612345678"
create or replace function public.normaliser_telephone(p text)
returns text
language plpgsql immutable
as $$
declare
  t text := regexp_replace(coalesce(p, ''), '[\s.\-()]', '', 'g');
begin
  if t like '+33%' then t := '0' || substr(t, 4);
  elsif t like '0033%' then t := '0' || substr(t, 5);
  end if;
  if t !~ '^0[1-9][0-9]{8}$' then
    raise exception 'Numéro de téléphone invalide' using errcode = '22023';
  end if;
  return t;
end;
$$;

-- Cœur commun : vérifie les quantités, applique l'offre, enregistre les lignes.
-- p_lignes = [{"produit_id":"classique","achetes":3,"offerts":0}, ...]
create or replace function public._enregistrer_lignes(p_commande uuid, p_lignes jsonb)
returns int
language plpgsql security definer set search_path = public
as $$
declare
  v_seuil int;
  v_achetes int := 0;
  v_offerts int := 0;
  v_total int := 0;
  l jsonb;
  v_prix int;
  v_a int;
  v_o int;
begin
  select offre_seuil into v_seuil from reglages where id = 1;
  if jsonb_typeof(p_lignes) is distinct from 'array' then
    raise exception 'Lignes invalides' using errcode = '22023';
  end if;

  delete from lignes_commande where commande_id = p_commande;

  for l in select * from jsonb_array_elements(p_lignes) loop
    v_a := coalesce((l->>'achetes')::int, 0);
    v_o := coalesce((l->>'offerts')::int, 0);
    if v_a < 0 or v_o < 0 or v_a > 999 or v_o > 999 then
      raise exception 'Quantité invalide' using errcode = '22023';
    end if;
    if v_a = 0 and v_o = 0 then continue; end if;
    select prix_centimes into v_prix from produits where id = l->>'produit_id' and actif;
    if v_prix is null then
      raise exception 'Produit inconnu' using errcode = '22023';
    end if;
    insert into lignes_commande (commande_id, produit_id, quantite_achetee, quantite_offerte, prix_unitaire_centimes)
    values (p_commande, l->>'produit_id', v_a, v_o, v_prix);
    v_achetes := v_achetes + v_a;
    v_offerts := v_offerts + v_o;
    v_total := v_total + v_a * v_prix;
  end loop;

  if v_achetes < 1 then
    raise exception 'Il faut au moins un foie gras' using errcode = '22023';
  end if;
  if v_offerts <> v_achetes / v_seuil then
    raise exception 'Nombre de foies gras offerts incorrect (attendu : %)', v_achetes / v_seuil using errcode = '22023';
  end if;

  update commandes set total_centimes = v_total, updated_at = now() where id = p_commande;
  return v_total;
end;
$$;
revoke all on function public._enregistrer_lignes(uuid, jsonb) from public, anon, authenticated;

-- Commande passée par un client sur le site (seule porte d'entrée publique)
create or replace function public.passer_commande(
  p_nom text, p_prenom text, p_telephone text, p_commentaire text, p_lignes jsonb
)
returns bigint
language plpgsql security definer set search_path = public
as $$
declare
  v_id uuid;
  v_numero bigint;
begin
  insert into commandes (origine, statut, nom, prenom, telephone, commentaire)
  values ('en_ligne', 'a_appeler', trim(p_nom), trim(p_prenom),
          normaliser_telephone(p_telephone), left(coalesce(trim(p_commentaire), ''), 1000))
  returning id, numero into v_id, v_numero;
  perform _enregistrer_lignes(v_id, p_lignes);
  return v_numero;
end;
$$;

-- Création ou modification d'une commande par l'admin
create or replace function public.admin_enregistrer_commande(
  p_id uuid, p_origine text, p_statut text,
  p_nom text, p_prenom text, p_telephone text, p_commentaire text, p_lignes jsonb
)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_id uuid := p_id;
begin
  if not est_admin() then
    raise exception 'Accès refusé' using errcode = '42501';
  end if;
  if v_id is null then
    insert into commandes (origine, statut, nom, prenom, telephone, commentaire)
    values (coalesce(p_origine, 'directe'), coalesce(p_statut, 'confirmee'), trim(p_nom), trim(p_prenom),
            normaliser_telephone(p_telephone), coalesce(trim(p_commentaire), ''))
    returning id into v_id;
  else
    update commandes set
      statut = coalesce(p_statut, statut),
      nom = trim(p_nom), prenom = trim(p_prenom),
      telephone = normaliser_telephone(p_telephone),
      commentaire = coalesce(trim(p_commentaire), ''),
      updated_at = now()
    where id = v_id;
    if not found then raise exception 'Commande introuvable'; end if;
  end if;
  perform _enregistrer_lignes(v_id, p_lignes);
  return v_id;
end;
$$;

revoke all on function public.passer_commande(text, text, text, text, jsonb) from public;
grant execute on function public.passer_commande(text, text, text, text, jsonb) to anon, authenticated;
revoke all on function public.admin_enregistrer_commande(uuid, text, text, text, text, text, text, jsonb) from public, anon;
grant execute on function public.admin_enregistrer_commande(uuid, text, text, text, text, text, text, jsonb) to authenticated;

-- ---------------------------------------------------------------------
-- 4. Sécurité : Row Level Security
-- ---------------------------------------------------------------------
alter table public.reglages        enable row level security;
alter table public.produits        enable row level security;
alter table public.commandes       enable row level security;
alter table public.lignes_commande enable row level security;
alter table public.admins          enable row level security;

-- Réglages et produits : lisibles par tout le monde, modifiables par l'admin
drop policy if exists "reglages lecture publique" on public.reglages;
create policy "reglages lecture publique" on public.reglages for select using (true);
drop policy if exists "reglages admin" on public.reglages;
create policy "reglages admin" on public.reglages for update to authenticated
  using (public.est_admin()) with check (public.est_admin());

drop policy if exists "produits lecture publique" on public.produits;
create policy "produits lecture publique" on public.produits for select using (true);
drop policy if exists "produits admin" on public.produits;
create policy "produits admin" on public.produits for update to authenticated
  using (public.est_admin()) with check (public.est_admin());

-- Commandes : AUCUN accès direct pour le public.
-- Les clients passent uniquement par la fonction passer_commande() (insertion seule),
-- ils ne peuvent donc jamais lire, modifier ni supprimer une commande.
drop policy if exists "commandes admin" on public.commandes;
create policy "commandes admin" on public.commandes for all to authenticated
  using (public.est_admin()) with check (public.est_admin());

drop policy if exists "lignes admin" on public.lignes_commande;
create policy "lignes admin" on public.lignes_commande for all to authenticated
  using (public.est_admin()) with check (public.est_admin());

drop policy if exists "admins lecture soi" on public.admins;
create policy "admins lecture soi" on public.admins for select to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- 5. Stockage des photos (bucket public "photos", écriture admin)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "photos admin ajout" on storage.objects;
create policy "photos admin ajout" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and public.est_admin());
drop policy if exists "photos admin modif" on storage.objects;
create policy "photos admin modif" on storage.objects for update to authenticated
  using (bucket_id = 'photos' and public.est_admin());
drop policy if exists "photos admin suppr" on storage.objects;
create policy "photos admin suppr" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and public.est_admin());
