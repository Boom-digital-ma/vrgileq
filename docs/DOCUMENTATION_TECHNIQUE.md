# 🏗️ Architecture Technique & Modules Métier

Ce document détaille la structure interne et le fonctionnement des modules métier de la plateforme **Virginia Liquidation**.

## 1. Structure de Données (Hiérarchie)
Le système repose sur une structure à 4 niveaux :
*   **Auction Events :** Unité temporelle et géographique (Lieu, date de fin, dépôt de garantie).
*   **Auctions (Lots) :** Unité de vente. Possède son propre statut (`live`, `sold`, etc.) et ses caractéristiques techniques.
*   **Bids :** Historique transactionnel lié aux autorisations Stripe.
*   **Sales :** Couche de finalisation créée automatiquement à la clôture, gérant les taxes et le retrait.

## 2. Intelligence du Moteur d'Enchères
### Proxy Bidding (Max Bid)
Algorithme SQL permettant aux utilisateurs de définir un plafond caché :
*   Le système enchérit automatiquement pour le compte de l'utilisateur.
*   Il respecte toujours l'incrément minimum (`min_increment`).
*   La logique est gérée de manière atomique en PL/pgSQL pour garantir l'intégrité même en cas de forte concurrence.

### Anti-Sniping (Auto-Extension)
Protection contre les enchères de dernière seconde :
*   Si une offre est placée moins de X minutes avant la fin (configurable dans l'admin), la date de clôture est repoussée de Y minutes.
*   La synchronisation est maintenue en temps réel via Supabase Realtime vers tous les clients connectés.

## 3. Flux Logistique & Post-Vente
### Facturation Automatisée
Dès qu'un lot passe au statut `sold` :
*   Un **Trigger SQL** génère une entrée dans la table `sales`.
*   Le montant total est calculé : `Hammer Price + Buyer's Premium + Tax Rate`.
*   Un numéro de facture unique (`INV-XXXX`) est attribué.

### Système de Retrait (Pickup)
*   **Génération :** L'Admin génère des créneaux temporels (ex: 15 min d'intervalle) avec une capacité maximale.
*   **Réservation :** Le gagnant choisit son créneau sur sa page facture. Le système décompte les places restantes via la vue `pickup_slots_with_counts`.
*   **Gate Pass :** Document HTML sécurisé avec QR Code contenant les métadonnées de la vente, accessible uniquement après confirmation du paiement (`PAID`).

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
