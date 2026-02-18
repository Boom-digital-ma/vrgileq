# 📄 Documentation Fonctionnelle & Technique - Virginia Liquidation MVP

Ce document présente une synthèse détaillée de l'ensemble des fonctionnalités et de l'architecture technique développées pour la plateforme **Virginia Liquidation**.

---

## 1. Identité de Marque & Design
- **Nom :** Virginia Liquidation.
- **Style Visuel :** "Swiss Style" industriel, minimaliste et à fort contraste.
- **Palette de Couleurs :**
    - **Primaire :** Teal / Viridian Green (`#049A9E`) pour les actions et accents.
    - **Secondaire :** Prussian Blue (`#0B2B53`) pour les fonds sombres.
    - **Typographie :** Headings en **Urbanist** (Black, Uppercase, Tracking-tighter) et corps de texte en **Manrope**.
- **Logos :** Versions transparente et blanche optimisées pour différents fonds.

---

## 2. Architecture Technique
- **Frontend :** Next.js 15 (App Router) avec TypeScript.
- **Administration :** Refine v5 (Headless) intégré dans le dossier `/admin`.
- **Backend (BaaS) :** Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions).
- **Styling :** Tailwind CSS v4.
- **Emails :** Intégration avec **Resend** via des templates React.
- **Paiements :** Stripe (Système d'autorisation/capture manuelle).

---

## 3. Structure des Données (Supabase)
Le schéma de base de données est conçu pour la performance et la sécurité (RLS) :
- **profiles :** Informations utilisateurs, statut de vérification (Risk Score), et IDs Stripe.
- **events :** Groupements logiques d'enchères (ex: "Vente de Printemps").
- **auctions (Lots) :** L'entité principale contenant le prix actuel, le statut, les métadonnées (Marque, Modèle, Année) et les images.
- **bids :** Historique complet des offres, lié aux Payment Intents de Stripe.
- **categories :** Classification taxonomique des lots.
- **watchlist :** Gestion des favoris par les utilisateurs.
- **site_settings :** Configuration globale (Mode maintenance, alertes).

---

## 4. Interface Publique (Marketplace)
### 🏠 Accueil
- **Hero Slider :** Présentation dynamique des ventes en cours.
- **Processus en 12 étapes :** Grille interactive expliquant le parcours vendeur (de l'Évaluation au Règlement).
- **Partenaires/Fournisseurs :** Section dédiée aux entreprises de confiance.
- **Recherche :** Barre de recherche globale connectée au catalogue.

### 📦 Catalogue & Enchères
- **Grille de Lots :** Affichage dynamique avec mise à jour des prix en temps réel (Supabase Realtime).
- **Filtres :** Navigation par catégories.
- **Quick View :** Modal permettant de voir les détails et d'enchérir sans quitter la liste.
- **Page de Détail :** Galerie d'images, historique des enchères, description technique et widget d'enchère sécurisé.

### 📖 Pages Marketing & Guides
- **Guide Acheteurs :** Parcours en 8 étapes sur les règles d'enchères et de retrait.
- **Guide Vendeurs :** Explication détaillée des services de liquidation.
- **About Us :** Historique de l'entreprise (fondée en 1981) et philosophie "Un-eBay".
- **Contact :** Formulaire de contact moderne et coordonnées.

---

## 5. Moteur d'Enchères & Automatisation
### 🔨 Logique d'Enchère Transactionnelle
- **Sécurité :** Utilisation de fonctions SQL atomiques (`place_bid_secure`) pour éviter les "race conditions".
- **Validation :** Vérification automatique des incréments minimums et du solde de l'enchère précédente.
- **Autorisation Stripe :** Chaque enchère crée un *Payment Intent* avec capture manuelle pour garantir les fonds.

### 🤖 Automatisation
- **Outbid Alerts :** Envoi automatique d'un email via Resend lorsqu'un utilisateur est surenchéri.
- **Clôture Automatique :** Utilisation de `pg_cron` et d'Edge Functions pour fermer les lots à l'heure précise et désigner le gagnant.
- **Real-time UI :** Mise à jour instantanée du prix et du chronomètre sur toutes les interfaces sans rechargement.

---

## 6. Dashboard Administration (Back-office)
Interface professionnelle basée sur Refine v5 permettant la gestion complète :
- **Gestion des Événements :** Création et modification des ventes groupées.
- **Catalogue des Lots :** CRUD complet avec support multi-images (Upload Supabase Storage).
- **Gestion des Utilisateurs :** Liste des profils, vérification des comptes et gestion des rôles.
- **Modals CRUD :** Toutes les opérations de création/édition se font via des modals pour une expérience fluide.
- **Système de Rôles :** Distinction stricte entre les utilisateurs standards et les administrateurs via le champ `role` dans les profils.
- **Mode Maintenance :** Contrôle centralisé permettant de verrouiller l'accès public tout en laissant l'accès libre aux administrateurs pour les tests.

---

## 7. Sécurité & Gestion des Utilisateurs
- **Authentification :** Système complet via Supabase Auth (Sign In, Sign Up, Forgot Password).
- **Contrôle d'Accès (RBAC) :** Protection des routes `/admin` par un middleware et une validation de session côté serveur.
- **Vérification de Carte :** Lors de l'inscription, une empreinte de carte de 1$ (immédiatement annulée) est effectuée pour valider le mode de paiement.
- **Multi-Card Wallet :** Possibilité pour l'utilisateur de gérer plusieurs cartes bancaires.
- **RLS (Row Level Security) :** Politiques strictes au niveau de la base de données garantissant que les utilisateurs ne peuvent accéder qu'à leurs propres données sensibles.

---

## 8. Communication & Notifications
- **Templates React Email :**
    - `outbid.ts` : Alerte de surenchère.
    - `won.ts` : Félicitations pour le gain d'un lot.
- **Système de Toast :** Notifications contextuelles pour les actions utilisateurs (connexion, erreur d'enchère, succès).

---

## 9. Flux Financier (Stripe)
1. **Validation :** Inscription -> Vérification de la carte (Auth 1$).
2. **Enchère :** Placement d'offre -> Création d'une autorisation correspondant au montant (Hold).
3. **Clôture :**
    - **Gagnant :** L'autorisation est conservée pour capture finale.
    - **Perdants :** Libération automatique des fonds autorisés.

---
*Dernière mise à jour : 17 Février 2026*

## 📚 Documentations de Flux Détaillés
Pour plus de détails techniques sur chaque module, consultez les fichiers suivants :
- [Flux d'Authentification & Onboarding](./docs/flows/AUTH_FLOW.md)
- [Flux d'Enchères (Bidding Engine)](./docs/flows/BIDDING_FLOW.md)
- [Flux Financier & Paiements (Stripe)](./docs/flows/PAYMENT_FLOW.md)
- [Flux d'Administration (Refine Dashboard)](./docs/flows/ADMIN_FLOW.md)
- [Flux d'Automatisation & Notifications](./docs/flows/AUTOMATION_FLOW.md)

