# 🏗️ Architecture Technique & Modules Métier

Ce document détaille la structure interne et le fonctionnement des modules métier de la plateforme **Virginia Liquidation**.

## 1. Structure de Données (Hiérarchie)
Le système repose sur une structure à 4 niveaux :
*   **Auction Events :** Unité temporelle et géographique (Lieu, date de fin, dépôt de garantie).
*   **Auctions (Lots) :** Unité de vente. Possède son propre statut (`live`, `sold`, etc.) et ses caractéristiques techniques.
*   **Bids :** Historique transactionnel lié aux autorisations Stripe.
*   **Sales :** Couche de finalisation créée automatiquement à la clôture, gérant les taxes et le retrait.

## 2. Intelligence du Moteur d'Enchères
### Proxy Bidding & Price Jumps
Algorithme SQL (`place_bid_secure`) permettant aux utilisateurs de définir un plafond caché :
*   **Duel de Proxies :** En cas de concurrence entre deux enchères automatiques, le prix "saute" intelligemment à `LEAST(max_perdant + increment, max_gagnant)`.
*   **Intégrité :** La logique est gérée de manière atomique en PL/pgSQL pour garantir l'intégrité même en cas de forte concurrence.

### Staggered Closing (Fermeture Échelonnée)
*   **Calcul Automatique :** Lors de l'importation ManyFastScan, chaque lot reçoit une heure de fin calculée : `Fin_Evenement + (Num_Lot * 2 minutes)`.
*   **Objectif :** Éviter les pics de charge et augmenter l'engagement sur les lots successifs.

### Anti-Sniping (Auto-Extension)
Protection contre les enchères de dernière seconde :
*   Si une offre est placée moins de X minutes avant la fin, la date de clôture est repoussée de Y minutes (configurables via `site_settings`).

## 3. Flux Logistique & Post-Vente
### Facturation Consolidée
Migration vers une structure 1:N (une facture pour plusieurs lots) :
*   **sale_items :** Nouvelle table de jointure entre `sales` et `auctions`.
*   **RPC `generate_event_invoices` :** Fonction SQL regroupant tous les gains d'un utilisateur par événement pour générer une facture unique.
*   **Calculs :** Somme des prix adjudications + calcul global des frais et taxes.

### Système de Retrait (Pickup)
*   **Génération :** L'Admin génère des créneaux temporels (ex: 15 min d'intervalle) avec une capacité maximale.
*   **Réservation :** Le gagnant choisit son créneau sur sa page facture consolidée.
*   **Gate Pass :** Document HTML sécurisé avec QR Code listant tous les actifs de la facture, accessible uniquement après confirmation du paiement (`PAID`).

## 4. Optimisation des Performances
### Images CDN
*   Utilisation du resizing dynamique de Supabase.
*   Utilitaire `getOptimizedImageUrl` appliquant des paramètres de qualité et de redimensionnement côté serveur.
*   Utilisation systématique du composant `next/image` pour le lazy-loading et le WebP.

### Data Fetching
*   Centralisation des sessions auth pour éviter les appels N+1 dans les composants répétitifs (`AuctionCard`).
*   Utilisation de `Turbopack` pour une compilation rapide en développement.

## 5. Stratégie de Tests (E2E)
Qualité assurée par **Playwright** :
*   **Isolation :** Utilisation de contextes de navigation séparés.
*   **Stripe Integration :** Remplissage automatisé de l'iframe sécurisée avec délais de frappe (`pressSequentially`).
*   **OTP Automation :** Robot capable d'ouvrir un onglet Yopmail, d'attendre l'email de Supabase, d'extraire le code via Regex et de le valider sur le site.

## 6. Administration (Refine v5)
*   **Architecture Headless :** Utilisation des hooks Refine pour les données mais composants UI Tailwind 100% personnalisés.
*   **Pagination Safe :** Aliasing des variables `current` et `setCurrent` pour assurer la compatibilité entre les différentes versions de TanStack Query utilisées par Refine.

## 7. Sécurité & RLS
*   **Isolation stricte :** Chaque table possède des politiques SQL garantissant qu'un utilisateur ne peut voir que ses propres factures, enchères et favoris.
*   **Admins :** Accès total défini par le rôle `admin` dans la table `profiles`, protégé par des fonctions SQL `is_admin()`.

---
*Dernière mise à jour : 18 Février 2026.*
