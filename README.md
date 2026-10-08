# Fouladou Chronicle

Build a modern, responsive, and high-performance news and media platform called "Saré Soukabé Info", dedicated to local news from Kolda and the Fouladou region.

1. BRANDING & THEME

- Modern media layout with a clean grid (inspired by major news portals).

- Color Palette: Deep Emerald Green (primary), Warm Gold/Terracotta (accents), Charcoal (text), Light Gray/White (background).Créer un site d'actualités pour Saré Soukabé Info est une excellente initiative pour valoriser l'information locale de la région de Kolda et du Fouladou.




Voici une proposition complète de structure, d'architecture technique et de fonctionnalités pour concrétiser votre projet :




1. Architecture & Arborescence du Site

Pour couvrir efficacement l'actualité locale, le site peut être organisé autour d'un menu clair et réactif :




Accueil (Page principale)




À la une / Flash Info : Les articles majeurs du jour.

Sections thématiques : Aperçu des derniers articles par catégorie.

Frequence / Direct : Bandeau d'actualité en continu.

Politique : Décentralisation, initiatives locales, gouvernance, citoyenneté.

Culture : Arts, littérature (ex. SALIKO), traditions du Fouladou, musique, événements.

Sport : Navétanes (ASC), football régional, lutte traditionnelle, sports scolaires.

Santé : Santé communautaire, campagnes de prévention, actualités des districts sanitaires.

Économie : Agriculture, élevage, entrepreneuriat des jeunes, marchés locaux (loumas).

Multimedia : Galeries photos, reportages vidéo, interviews audio.

2. Stack Technique Recommandée

En fonction de vos besoins de performance, de gestion de contenu et de maintenance, deux approches s'offrent à vous :




Options de Développement :

Option Modern Web App (React / Next.js / Tailwind CSS / Supabase)




Avantages : Chargement extrêmement rapide, expérience utilisateur fluide sur mobile, contrôle total du design et de la base de données.

Back-office : Gestion via un dashboard sur mesure ou un CMS Headless (ex. Strapi, Sanity, ou Supabase avec interface admin).

Option CMS Classique (WordPress)




Avantages : Prise en main rapide pour la rédaction d'articles, nombreux thèmes spécialisés dans les médias/actualités, gestion multi-auteurs intégrée.

3. Fonctionnalités Clés à Intégrer

Optimisation Mobile First : La grande majorité de vos lecteurs consultera le site depuis un smartphone.

Partage Réseaux Sociaux : Boutons de partage direct vers WhatsApp, Facebook, X (Twitter) et LinkedIn sous chaque article.

Module de Commentaires / Interactions : Permettre aux lecteurs d'échanger et de donner leur avis.

Notifications Push / Newsletter : Pour informer les abonnés lors des publications importantes ou des alertes "Flash Info".

Mode Sombre (Dark Mode) : Améliore le confort de lecture sur écran.

Espaces Publicitaires & Partenariats : Emplacements prévus pour les bannières d'annonceurs locaux, partenaires institutionnels ou ONG.

4. Étapes de Mise en Œuvre

Maquettage & Design (Wireframes) :




Définir la charte graphique (logo, typographies, couleurs reflétant l'identité du Fouladou).

Structurer la grille de la page d'accueil (Grid/Flexbox) et la disposition des cartes d'articles.

Développement du Frontend & Backend :




Configurer le système de gestion de contenu (articles, catégories, tags, auteurs).

Mettre en place le moteur de recherche interne pour retrouver facilement les archives.

Hébergement & Nom de Domaine :




Choix d'un nom de domaine pertinent (ex: saresoukabefeinfo.com ou .sn).

Déploiement sur un hébergeur fiable (ex: Vercel/Netlify pour du Next.js/React, ou Hostinger pour un serveur web).

Stratégie Éditoriale & Lancement :




Préparer 5 à 10 articles de lancement couvrant chaque rubrique.

Connecter les pages officielles sur les réseaux sociaux pour générer du trafic initial.

- Support Dark Mode and Light Mode toggling.

- Fully mobile-responsive (Mobile-First design).

2. NAVIGATION & NAVIGATION STRUCTURE

Header with a top "Flash Info" scrolling ticker for breaking news.

Navigation Menu with the following main sections:

- Accueil (Home)

- Politique

- Culture

- Sport

- Santé

- Économie

- Multimedia (Photos/Videos)

- Search Bar & Theme Toggle.

3. HOME PAGE LAYOUT

- Hero Section: Large "À la une" featured article with image, title, category badge, and publishing date, alongside a vertical list of 3-4 trending articles.

- Category Grids: Dynamic sections for Politique, Culture, Sport, Santé, and Économie with card-style article previews (Image, Category, Title, Excerpt, Date, Author).

- Sidebar: "Most Read" articles widget, Weather widget for Kolda, Social Media links (Facebook, WhatsApp, X, LinkedIn), and Newsletter Subscription Form.

4. SUPABASE INTEGRATION & DATABASE

Integrate Supabase for backend services:

- Tables required:

  1. `profiles`: id (FK to auth.users), full_name, avatar_url, role (enum: 'user', 'editor', 'admin', default: 'user').

  2. `categories`: id, name, slug.

  3. `articles`: id, title, slug, content (rich text/markdown), excerpt, featured_image_url, category_id (FK), author_id (FK to profiles), views_count, is_featured (boolean), created_at.

  4. `comments`: id, article_id (FK), user_id (FK), content, created_at.

5. AUTHENTICATION & ADMIN DASHBOARD

- Authentication System: Supabase Auth (Email/Password & Social Auth).

- Admin / Editor Dashboard (`/admin`):

  - Accessible only to users with `admin` or `editor` roles using RLS.

  - CRUD interface to create, edit, delete, and publish articles.

  - Image upload functionality directly to Supabase Storage.

  - Role management (Assigning 'admin' or 'editor' status to users).

6. ARTICLE DETAIL PAGE (`/article/:slug`)

- Full article view with high-res cover image, author avatar/name, publishing date, and read-time estimate.

- Rich text content rendering.

- Floating Social Share buttons (WhatsApp, Facebook, Twitter, Native Share API).

- Interactive Comments Section (Supabase real-time or fetch on submit) - allowed for authenticated users.

- "Related Articles" grid at the bottom based on the current category.

7. EXTRA FEATURES

- Responsive toast notifications for user actions (e.g., newsletter subscription, comment submission).

- Clean skeleton loaders during data fetch states.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://saresoukabenews.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1569a452-034a-46d9-9576-85961fed8703).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
