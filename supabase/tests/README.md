# Tests de sécurité de la base (optionnels, pour développeur)

Rejoue le schéma dans un PostgreSQL local qui imite Supabase (rôles `anon` / `authenticated`, `auth.uid()`), puis vérifie :
- qu'un visiteur peut passer commande mais ne voit ni ne modifie aucune commande ;
- que l'offre 10 achetés = 1 offert et le format du téléphone sont contrôlés côté base ;
- qu'un compte connecté non admin n'a accès à rien ;
- que l'admin peut tout faire.

```bash
psql -f supabase/tests/mock_supabase.sql          # crée la base "td"
psql -d td -f supabase/schema.sql
psql -d td -f supabase/exemples.sql
psql -d td -f supabase/tests/test_securite.sql
```
