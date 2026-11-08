\set ON_ERROR_STOP 0
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
insert into auth.users values ('11111111-1111-1111-1111-111111111111','ami@x.fr'),('22222222-2222-2222-2222-222222222222','intrus@x.fr');
insert into admins values ('11111111-1111-1111-1111-111111111111');
\echo '--- anon'
set role anon;
select passer_commande('Test','Anon','+33 6 11 22 33 44','', '[{"produit_id":"classique","achetes":10,"offerts":0},{"produit_id":"poivre","achetes":1,"offerts":1}]') as numero_ok;
select passer_commande('Test','Anon','0611223344','', '[{"produit_id":"classique","achetes":10,"offerts":0}]') as doit_echouer_offert;
select passer_commande('Test','Anon','12345','', '[{"produit_id":"classique","achetes":1,"offerts":0}]') as doit_echouer_tel;
select passer_commande('Test','Anon','0611223344','', '[]') as doit_echouer_vide;
select count(*) as anon_voit_commandes from commandes;
select count(*) as anon_voit_lignes from lignes_commande;
insert into commandes(origine,nom,prenom,telephone) values('en_ligne','a','b','0611223344');
update produits set prix_centimes=1; select prix_centimes from produits;
select admin_enregistrer_commande(null,'directe','confirmee','X','Y','0611223344','','[{"produit_id":"classique","achetes":1,"offerts":0}]');
reset role;
\echo '--- intrus connecte'
set role authenticated; set request.jwt.claim.sub='22222222-2222-2222-2222-222222222222';
select count(*) as intrus_voit from commandes;
select admin_enregistrer_commande(null,'directe','confirmee','X','Y','0611223344','','[{"produit_id":"classique","achetes":1,"offerts":0}]');
reset role;
\echo '--- admin'
set role authenticated; set request.jwt.claim.sub='11111111-1111-1111-1111-111111111111';
select numero, origine, statut, telephone, total_centimes from commandes;
select admin_enregistrer_commande(null,'directe','confirmee','Direct','Test','06.99.88.77.66','tel','[{"produit_id":"classique","achetes":20,"offerts":1},{"produit_id":"poivre","achetes":0,"offerts":1}]') is not null as admin_ajout;
update commandes set statut='prete' where nom='Test'; delete from commandes where nom='Direct';
select count(*) from commandes; update produits set prix_centimes=7500 where id='poivre'; select id,prix_centimes from produits;
reset role;
