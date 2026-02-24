# 📄 Documentation Fonctionnelle & Technique - Virginia Liquidation MVP

Ce document présente une synthèse détaillée de l'ensemble des fonctionnalités et de l'architecture technique développées pour la plateforme **Virginia Liquidation**.

---

## 1. Identité de Marque & Design
- **Nom :** Virginia Liquidation.
- **Style Visuel :** "SaaS Premium" inspiré des outils modernes (Linear, Raycast).
- **Palette de Couleurs :**
    - **Primaire :** Teal / Viridian Green (`#049A9E`) pour les actions et accents.
    - **Secondaire :** Prussian Blue (`#0B2B53`) pour les fonds sombres.
    - **Typographie :** Headings en **Geist Sans** (Display, Italic) et corps de texte en **Plus Jakarta Sans**.
- **Composants :** Glassmorphisme, coins arrondis (24px-48px), ombres douces.

---

## 2. Architecture Technique
- **Frontend :** Next.js 16 (App Router) avec TypeScript et Turbopack.
- **Administration :** Refine v5 (Headless) intégré dans le dossier `/admin`.
- **Backend (BaaS) :** Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions).
- **Styling :** Tailwind CSS v4.
- **Emails :** Intégration avec **Resend** via des templates React (Style SaaS Premium).
- **Paiements :** Stripe (Système d'autorisation/capture manuelle).
- **Tests E2E :** Playwright (Couverture complète Auth + Stripe).

---

## 3. Structure des Données (Supabase)
Le schéma de base de données est conçu pour la performance et la sécurité (RLS) :
- **profiles :** Informations utilisateurs, statut de vérification (Risk Score), et IDs Stripe.
- **auction_events :** Groupements logiques d'enchères (ex: "Vente de Printemps").
- **auctions (Lots) :** L'entité principale contenant le prix actuel, le statut, les métadonnées (Marque, Modèle, Année) et les images.
- **bids :** Historique complet des offres, lié aux Payment Intents de Stripe.
- **categories :** Classification taxonomique des lots.
- **watchlist :** Gestion des favoris par les utilisateurs.
- **site_settings :** Configuration globale (Mode maintenance, alertes, proxy bidding).
- **sales :** Table des transactions finalisées (Factures).
- **pickup_slots :** Créneaux de retrait disponibles par événement.

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

### 👤 Espace Membre (Profil)
- **Dashboard :** Vue d'ensemble des enchères actives, gagnées et de la watchlist.
- **Wallet :** Gestion sécurisée des cartes bancaires via Stripe Elements.
- **Logistique :** Accès direct aux factures (Invoices) et bons de sortie (Gate Pass).

---

## 5. Moteur d'Enchères & Automatisation
### 🔨 Logique d'Enchère Transactionnelle
- **Sécurité :** Utilisation de fonctions SQL atomiques (`place_bid_secure`) pour éviter les "race conditions".
- **Validation :** Vérification automatique des incréments minimums et du solde de l'enchère précédente.
- **Proxy Bidding Intelligent :** Système d'enchère automatique sans bouton d'activation. Tout montant supérieur à l'enchère minimale requise est automatiquement traité comme une mise maximale (Proxy).
- **Anti-Sniping :** Extension automatique du temps (ex: +2 mins) si une enchère survient dans les dernières minutes.

### 🤖 Automatisation & Notifications
- **Moteur de Notifications Batch :** Utilisation de l'API Batch de Resend pour envoyer jusqu'à 100 emails par seconde, éliminant les erreurs de limite de débit (429).
- **Outbid Alerts :** Notification immédiate par email avec récupération sécurisée de l'adresse via le client Admin (fallback Auth).
- **Rappels d'Événements :** Nouveau bouton "Cloche" 🔔 permettant aux utilisateurs de s'abonner aux alertes de début d'événement (email envoyé 30 minutes avant le lancement).
- **Clôture Automatique :** Utilisation de `pg_cron` et d'Edge Functions pour fermer les lots à l'heure précise.
- **Staggered Closing (Fermeture Échelonnée) :** Les lots sont automatiquement décalés de **2 minutes** lors de l'importation pour éviter la congestion et maximiser les ventes.
- **Facturation Consolidée :** Les factures (table `sales`) sont générées manuellement par l'admin à la fin de l'événement, regroupant tous les lots d'un même acheteur sur un seul document.

---

## 6. Post-Auction & Logistique (Nouveau)
### 🧾 Facturation & Paiements
- **Facturation par Événement :** Un acheteur reçoit une seule facture regroupant l'ensemble de ses gains pour un événement donné.
- **Paiement Soustractif :** Le système capture automatiquement le dépôt de garantie (caution d'inscription) lors de la victoire et ne débite que le solde restant sur la carte du client.
- **Transactions Simplifiées :** Suppression des blocages bancaires (holds) pendant la mise pour fluidifier l'expérience utilisateur.
- **Page Facture :** Route dynamique `/invoices/[id]` affichant le tableau détaillé des lots inclus.
- **Calculs :** Somme des prix marteaux + Buyer's Premium global + Taxes = Total.
- **Statut :** Suivi en temps réel (Pending -> Paid -> Collected).

---

## 7. Interface Utilisateur (UX Premium)
### ⚡ Temps Réel & Feedback
- **Indicateurs de Victoire :** Les cartes de lots changent de couleur instantanément (Bordure émeraude + badge "You are in the lead") si l'utilisateur est le meilleur enchérisseur.
- **Alertes Outbid :** La carte devient rouge avec un message clignotant "Someone outbid you!" dès que l'utilisateur perd la main.
- **Timer d'Urgence :** Compte à rebours rouge statique positionné au-dessus du prix pour une visibilité immédiate.
- **Détails Pliables :** Descriptions et infos techniques (Modèle, Fabricant) compactées par défaut pour réduire la hauteur des cartes et améliorer la navigation.
- **Profil Structuré :** Distinction claire entre les actifs physiques (**Won Assets**) et les documents comptables (**Official Billing**).

---

## 8. Dashboard Administration (Back-office)
Interface professionnelle basée sur Refine v5, réorganisée par pôles métiers :
- **Vue d'Ensemble :** KPI en temps réel (Chiffre d'affaires, Taux de retrait, Utilisateurs actifs).
- **Inventory Management :** Gestion complète des Événements et des Lots (avec upload d'images optimisé).
- **Sales & Invoices :** Suivi des transactions, marquage manuel des paiements (Virement/Cash).
- **Warehouse Logistics :** Calendrier des retraits pour l'équipe logistique, validation des sorties ("Mark Collected").
- **Platform Data :** Gestion des utilisateurs, catégories et enchères en direct.
- **Settings :** Configuration globale (Finance, Règles d'enchères, Mode Maintenance).

---

## 8. Sécurité & Qualité
- **Authentification :** Système complet via Supabase Auth (Sign In, Sign Up, Forgot Password) avec vérification OTP.
- **Rôles (RBAC) :** Protection des routes `/admin` et séparation Client / Admin.
- **Optimisation :** Images compressées et redimensionnées via Supabase Storage.
- **SEO :** Metadata dynamiques pour chaque lot et événement.
- **Tests :** Suite de tests automatisés Playwright validant les parcours critiques (Inscription, Connexion).

---
*Dernière mise à jour : 22 Février 2026*

## 📚 Documentations de Flux Détaillés
Pour plus de détails techniques sur chaque module, consultez les fichiers suivants :
- [Flux d'Authentification & Onboarding](./flows/AUTH_FLOW.md)
- [Flux d'Enchères (Bidding Engine)](./flows/BIDDING_FLOW.md)
- [Flux Financier & Paiements (Stripe)](./flows/PAYMENT_FLOW.md)
- [Flux d'Administration (Refine Dashboard)](./flows/ADMIN_FLOW.md)
- [Flux d'Automatisation & Notifications](./flows/AUTOMATION_FLOW.md)
