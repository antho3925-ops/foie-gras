-- =====================================================================
--  5 commandes d'exemple (3 en ligne, 2 directes) pour tester l'admin.
--  À lancer APRÈS schema.sql, dans Supabase > SQL Editor.
--  Pour tout effacer ensuite :  delete from public.commandes;
-- =====================================================================
do $$
declare v uuid;
begin
  insert into public.commandes (origine, statut, nom, prenom, telephone, commentaire, created_at)
  values ('en_ligne', 'a_appeler', 'Martin', 'Claire', '0612345678', 'Pour le réveillon du 24, merci !', now() - interval '3 days')
  returning id into v;
  perform public._enregistrer_lignes(v, '[{"produit_id":"classique","achetes":2,"offerts":0},{"produit_id":"poivre","achetes":1,"offerts":0}]');

  insert into public.commandes (origine, statut, nom, prenom, telephone, commentaire, created_at)
  values ('en_ligne', 'confirmee', 'Bernard', 'Lucas', '0798765432', 'Comité d''entreprise', now() - interval '2 days')
  returning id into v;
  perform public._enregistrer_lignes(v, '[{"produit_id":"classique","achetes":6,"offerts":1},{"produit_id":"poivre","achetes":6,"offerts":0}]');

  insert into public.commandes (origine, statut, nom, prenom, telephone, commentaire, created_at)
  values ('en_ligne', 'prete', 'Petit', 'Sophie', '0556123456', '', now() - interval '1 day')
  returning id into v;
  perform public._enregistrer_lignes(v, '[{"produit_id":"poivre","achetes":4,"offerts":0}]');

  insert into public.commandes (origine, statut, nom, prenom, telephone, commentaire, created_at)
  values ('directe', 'confirmee', 'Dubois', 'Jean', '0611223344', 'Pris au marché samedi', now() - interval '20 hours')
  returning id into v;
  perform public._enregistrer_lignes(v, '[{"produit_id":"classique","achetes":10,"offerts":0},{"produit_id":"poivre","achetes":0,"offerts":1}]');

  insert into public.commandes (origine, statut, nom, prenom, telephone, commentaire, created_at)
  values ('directe', 'recuperee', 'Moreau', 'Élise', '0688776655', 'Appel du voisin', now() - interval '5 hours')
  returning id into v;
  perform public._enregistrer_lignes(v, '[{"produit_id":"classique","achetes":1,"offerts":0},{"produit_id":"poivre","achetes":1,"offerts":0}]');
end $$;
