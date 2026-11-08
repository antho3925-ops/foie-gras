# 🧑‍🍳 La Toque Dorée

Site de commande de foie gras pour un petit producteur : une page publique très visuelle pour commander, et un espace producteur protégé pour gérer les commandes depuis le téléphone.

- **Site public** : présentation, les deux foies gras (classique et croûte de poivre, 500 g), formulaire de commande avec l'offre « 10 achetés = 1 offert », message de remerciement. Pas de paiement en ligne.
- **Espace producteur** (`/admin`) : onglets *Commandes en ligne*, *Commandes directes*, *Toutes les commandes*, récap, statuts en un clic, recherche et filtre, ajout d'une commande prise par téléphone, modification et suppression, bon de commande PDF, réglages des prix, textes et photos.
- **100 % gratuit** : Next.js sur Vercel, base de données et connexion sur Supabase (offres gratuites), adresse du type `la-toque-doree.vercel.app`.

---

## Mettre le site en ligne, pas à pas (environ 20 minutes)

Tu as besoin de trois comptes gratuits : **GitHub** (le code, déjà fait), **Supabase** (la base de données) et **Vercel** (l'hébergement). Le plus simple est de te connecter à Supabase et à Vercel *avec ton compte GitHub*.

### Étape 1 : créer la base de données sur Supabase

1. Va sur **https://supabase.com** → **Start your project** → connecte-toi avec GitHub.
2. Clique sur **New project**.
   - *Name* : `la-toque-doree`
   - *Database Password* : clique sur **Generate a password** (tu n'en auras pas besoin ensuite, mais garde-le de côté).
   - *Region* : **West EU (Paris)** ou la plus proche.
   - Clique sur **Create new project** et patiente 1 à 2 minutes.
3. Dans le menu de gauche, ouvre **SQL Editor** → **New query**.
4. Ouvre le fichier [`supabase/schema.sql`](supabase/schema.sql) de ce dépôt, copie **tout** son contenu, colle-le dans l'éditeur et clique sur **Run**. Tu dois voir *Success. No rows returned*.
5. (Pour tester) Fais **New query** à nouveau, colle le contenu de [`supabase/exemples.sql`](supabase/exemples.sql) et clique sur **Run** : cela ajoute 3 commandes en ligne et 2 directes. Tu pourras les effacer plus tard (voir plus bas).
6. Récupère tes deux clés : menu **Project Settings** (roue crantée) → **API** (ou **Data API** / **API Keys** selon la version) :
   - **Project URL**, du type `https://abcdefgh.supabase.co`
   - **anon public** key (aussi appelée *publishable key*), une longue suite de caractères.

   Garde cet onglet ouvert, on s'en sert à l'étape 3. Ces deux valeurs peuvent être publiques sans danger : la sécurité est assurée par les règles de la base. **Ne copie jamais la clé `service_role` / `secret`.**

### Étape 2 : créer le compte administrateur de ton ami

1. Toujours dans Supabase : **Authentication** → **Users** → **Add user** → **Create new user**.
2. Saisis l'email de ton ami et un mot de passe solide, coche **Auto Confirm User**, puis **Create user**.
3. Va dans **SQL Editor** → **New query**, colle la ligne suivante en remplaçant l'email, puis **Run** :

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'email-de-ton-ami@exemple.fr';
   ```

   Tu dois voir *Success. 1 row affected*. Sans cette ligne, le compte peut se connecter mais ne voit aucune commande (c'est voulu, par sécurité).
4. Par sécurité, empêche les inscriptions publiques : **Authentication** → **Sign In / Providers** (ou **Providers** → **Email**) → désactive **Allow new users to sign up** → **Save**.

### Étape 3 : mettre le site en ligne avec Vercel

1. Va sur **https://vercel.com** → **Sign Up** → **Continue with GitHub** (offre *Hobby*, gratuite).
2. Clique sur **Add New…** → **Project**, puis **Import** à côté du dépôt `foie-gras`. Si le dépôt n'apparaît pas, clique sur *Adjust GitHub App Permissions* et autorise-le.
3. Avant de déployer, ouvre **Environment Variables** et ajoute ces deux lignes (valeurs copiées à l'étape 1.6) :

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | ton *Project URL* |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ta clé *anon public* |

4. Le *Project Name* devient l'adresse du site : mets par exemple `la-toque-doree` pour obtenir `https://la-toque-doree.vercel.app`.
5. Clique sur **Deploy**. Après 1 à 2 minutes, ton site est en ligne ! 🎉

À chaque modification du code poussée sur la branche `main` de GitHub, Vercel remet le site à jour automatiquement.

### Étape 4 : vérifier que tout marche

1. Ouvre `https://la-toque-doree.vercel.app` et passe une commande test.
2. Ouvre `https://la-toque-doree.vercel.app/admin`, connecte-toi avec le compte de ton ami : la commande apparaît dans **Commandes en ligne**, avec le statut **À appeler**.
3. Sur le téléphone de ton ami, ajoute l'adresse `/admin` à l'écran d'accueil (Safari : bouton Partager → *Sur l'écran d'accueil* ; Chrome : ⋮ → *Ajouter à l'écran d'accueil*).
4. Quand tout est bon, efface les commandes d'exemple : **SQL Editor** → `delete from public.commandes;` → **Run** (cela efface *toutes* les commandes, à faire uniquement avant le vrai lancement).

---

## Utilisation au quotidien (pour le producteur)

- **Statuts** : sur chaque commande, touche directement le statut voulu : *À appeler* → *Confirmée* → *Prête* → *Récupérée*, ou *Annulée*. Chaque statut a sa couleur.
- **Appeler un client** : touche le numéro vert.
- **+ Ajouter une commande** (bouton doré en bas) : pour une commande prise au marché ou par téléphone. Elle est enregistrée comme *Directe*, avec le statut *Confirmée* par défaut. L'offre 10 achetés = 1 offert s'applique toute seule.
- **📄 Bon PDF** : télécharge un bon de commande à imprimer ou à envoyer, avec une zone de signature.
- **⚙️ Réglages** : changer les prix, les textes de présentation, les photos, le téléphone affiché et les infos de retrait.
- **Récap** en haut : nombre de commandes, foies gras à préparer par type (commandes *Confirmées*, offerts compris), offerts, chiffre d'affaires (commandes confirmées, prêtes et récupérées), avec le détail en ligne / directes.

> Les photos actuelles sont en basse résolution. Pour les remplacer par de plus belles, va dans ⚙️ Réglages → *Changer la photo*.

---

## Sécurité

- Les visiteurs ne peuvent **que** créer une commande, via la fonction `passer_commande` de la base, qui vérifie le téléphone, les quantités et l'offre, et recalcule elle-même le total avec les vrais prix. Ils ne peuvent jamais lire, modifier ou supprimer une commande (Row Level Security, aucune règle de lecture pour le public).
- Seuls les comptes listés dans la table `admins` peuvent lire, ajouter, modifier et supprimer les commandes et changer les réglages.
- Le prix de chaque ligne est figé au moment de la commande : changer un prix n'a pas d'effet sur les anciennes commandes (sauf si on les modifie).

## Pour les développeurs

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # tests du calcul de l'offre, du téléphone et du récap
npm run lint
npm run build
```

Les clés publiques Supabase sont dans `src/lib/config.ts`. Avec `NEXT_PUBLIC_DEMO=1`, le site tourne en **mode démo** : les commandes sont gardées dans le navigateur et l'espace `/admin` s'ouvre sans mot de passe, avec les 5 commandes d'exemple. Pour utiliser un autre projet Supabase, renseigne les deux variables de `.env.example`.

Structure :

```
src/app/page.tsx              page publique
src/app/admin/page.tsx        espace producteur
src/components/public/        sections animées de la page publique
src/components/admin/         tableau de bord, formulaire, réglages
src/lib/offre.ts              calcul de l'offre, téléphone, récap (testé)
src/lib/donnees.ts            accès aux données (Supabase ou mode démo)
src/lib/pdf.ts                bon de commande PDF
supabase/schema.sql           tables, fonctions, règles de sécurité
supabase/exemples.sql         5 commandes d'exemple
supabase/tests/               tests de sécurité de la base
```

Animations : [Motion](https://motion.dev) (respecte le réglage « réduire les animations » du téléphone).
