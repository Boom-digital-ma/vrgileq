# 🏗️ Architecture Technique & Modules Métier

Ce document détaille la structure et le fonctionnement des modules métier de la plateforme **Virginia Liquidation**.

## 1. Structure de Données (Hiérarchie)
Le système repose sur une structure à 3 niveaux :
*   **Auction Events (Ventes) :** Regroupent plusieurs lots. Gèrent la date de clôture globale et le montant du dépôt de garantie (Security Hold).
*   **Auctions (Lots) :** L'unité de base mise aux enchères. Possède son propre prix actuel, incrément minimum et statut.
*   **Bids (Enchères) :** Historique de toutes les offres placées par les utilisateurs.

## 2. Module de Sécurité & Finance (Stripe Hold)
C'est le coeur critique du système pour garantir le paiement :
*   **Vérification d'Identité :** Lors du SignUp, l'utilisateur doit enregistrer une carte bancaire (via Stripe Elements).
*   **Logique de "Hold" (Autorisation) :** 
    *   À la première enchère sur un événement, le système effectue une demande d'autorisation Stripe de 500$ (ou montant défini).
    *   L'argent est bloqué mais non débité (`capture_method: 'manual'`).
    *   Une seule autorisation est faite par événement, peu importe le nombre de lots enchéris.
*   **Capture & Libération :** À la fin de la vente, l'autorisation du gagnant est convertie en paiement réel, tandis que celles des perdants sont annulées.

## 3. Module d'Enchères Sécurisées (RPC SQL)
Pour éviter les problèmes de concurrence (race conditions), le placement d'enchère utilise une fonction **PostgreSQL (RPC)** appelée `place_bid_secure` :
*   Elle verrouille la ligne du lot pendant la transaction.
*   Vérifie en une seule opération atomique si l'enchère est supérieure au prix actuel + incrément.
*   Met à jour le lot, crée l'entrée d'enchère et marque l'ancien meilleur enchérisseur comme "outbid".

## 4. Système de Notifications & Emails (Resend)
Le système communique avec les utilisateurs via deux canaux synchronisés :
*   **In-App :** Table `notifications` dans Supabase pour l'affichage en temps réel sur le site.
*   **Emails (Resend) :** 
    *   **Outbid Alert :** Envoyé dès qu'un utilisateur perd sa place de meilleur enchérisseur.
    *   **Winning Alert :** Envoyé automatiquement par une **Edge Function** lors de la clôture du lot.
    *   **Authentification :** Les emails système (confirmation, reset) passent par le SMTP Resend configuré dans Supabase.

## 5. Module d'Administration (Refine v5)
Interface de gestion robuste pour les administrateurs :
*   **Dashboard :** Statistiques en temps réel (revenus, lots actifs, stream d'enchères).
*   **Inventory Management :** CRUD complet des événements et lots avec support multi-images.
*   **Bid Registry :** Journal complet de toutes les transactions de la plateforme.
*   **System Settings :** Contrôle du "Mode Maintenance", des frais acheteurs (Buyer's Premium) et des informations de contact.

## 6. Mode Maintenance
Module permettant de verrouiller la partie publique du site :
*   **Contrôle :** Toggle dans les paramètres admin.
*   **Middleware (proxy.ts) :** Intercepte toutes les requêtes.
*   **Exception :** L'administrateur connecté conserve un accès total pour tester et valider le site avant réouverture.

## 7. Stack Technique
*   **Frontend :** Next.js 16 (App Router), Tailwind CSS v4.
*   **Backend :** Supabase (Auth, DB, Realtime, Edge Functions).
*   **Admin :** Refine v5 (Headless mode).
*   **Services tiers :** Stripe (Paiements), Resend (Emails).

---
*Document généré le 15 Février 2026 pour le MVP de Virginia Liquidation.*
