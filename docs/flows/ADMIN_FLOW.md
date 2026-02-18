# 🛠 Flux d'Administration (Refine Dashboard)

Ce document décrit les outils de pilotage mis à la disposition des administrateurs de la plateforme.

## 1. Gestion de l'Inventaire (Core)
- **Auction Events** : Pilotage temporel des ventes. Configuration des dépôts de garantie et des lieux de vente.
- **Lots Cataloging** : Gestion granulaire des actifs. Support de l'import de masse (ManyFastScan), gestion des images (désignation de l'image principale) et métadonnées techniques.

## 2. Opérations Post-Vente & Logistique
- **Sales & Invoices** : Suivi des factures générées automatiquement. Les administrateurs peuvent valider les paiements hors-ligne (Virement, Cash) pour débloquer les lots.
- **Logistics Dashboard** : Vue temps réel des retraits.
    - **Slot Management** : Génération automatisée de créneaux de retrait par événement (ex: toutes les 15 min).
    - **Gate Control** : Marquage des lots comme "Collected" au moment du départ physique de l'entrepôt.
    - **Gate Pass Verification** : Accès aux bons de sortie officiels pour audit.

## 3. Données & Utilisateurs
- **User Registry** : Audit complet des profils, vérification des statuts Stripe et gestion des rôles (Admin/Moderator/Client).
- **Live Bids** : Stream en direct de toutes les activités d'enchères sur la plateforme.

## 4. Gouvernance Système (Settings)
- **Financial Protocols** : Réglage du Buyer's Premium, du taux de taxe (`tax_rate`) et des dépôts par défaut.
- **Bidding Engine** : Configuration de l'Anti-Sniping et activation du Proxy Bidding.
- **Security** : Mode Maintenance global (verrouillage du site public).
- **Communication** : Emails de support et bannières d'annonces.
