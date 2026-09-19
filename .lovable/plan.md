# Connexion et espace rédaction

## Objectif
Ajouter une page de connexion/inscription et un espace `/admin` réservé aux éditeurs et administrateurs, en réutilisant les profils et rôles déjà configurés.

## Ce qui sera construit
- Page `/auth` avec connexion et inscription par e-mail, connexion Google, nom affiché, états de confirmation et messages d’erreur clairs.
- Accès `/admin` protégé : un utilisateur non connecté retourne vers la connexion, un membre sans rôle éditorial voit un refus d’accès.
- Tableau de bord éditorial avec liste, recherche et filtres des articles.
- Création et modification d’un article : titre, rubrique, résumé, contenu, auteur, image, mise à la une et Flash Info.
- Suppression avec confirmation et notifications de réussite ou d’échec.
- Envoi d’images vers le stockage privé existant, puis utilisation d’un lien sécurisé dans l’article.
- En-tête de l’espace rédaction avec profil, rôle, retour au site et déconnexion propre.
- Mise à jour de la feuille de route et métadonnées propres aux nouvelles pages.

## Sécurité et comportement
- Les écritures restent contrôlées par les règles existantes : rôles `editor` et `admin` uniquement.
- Le navigateur ne décide jamais seul des permissions ; les règles du backend restent l’autorité.
- Les images acceptées seront limitées aux formats image et à 10 Mo.
- L’inscription suit la confirmation par e-mail déjà configurée ; elle ne connecte pas automatiquement l’utilisateur avant confirmation.
- Les nouveaux comptes conservent un profil avec nom affiché et commencent avec le rôle utilisateur standard ; un administrateur peut ensuite leur attribuer un rôle éditorial.

## Vérification
- Tester les écrans sur ordinateur et mobile.
- Vérifier la connexion, les protections d’accès, la création/modification/suppression et l’envoi d’image avec un compte autorisé si une session de test est disponible.
- Contrôler la compilation et les erreurs visibles du site.
