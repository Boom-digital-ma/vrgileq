# 🔨 Flux d'Enchères (Bidding Engine)

Ce document décrit la logique métier derrière le placement d'une enchère.

## 1. Pré-requis pour Enchérir
Avant de pouvoir soumettre une offre, le système vérifie :
- L'utilisateur est connecté.
- Le profil est vérifié (`is_verified: true` via Stripe).
- L'utilisateur est enregistré pour l'événement d'enchère spécifique.

## 2. Placement de l'Enchère
- **Action :** `placeBid` (`app/actions/bids.ts`)
- **Étapes :**
    1. **Autorisation Stripe :** Si c'est la première enchère de l'utilisateur sur cet événement, une autorisation de sécurité (Hold) est créée.
    2. **Appel RPC SQL :** Appel de la fonction atomique `place_bid_secure` dans PostgreSQL.
    3. **Validation Atomique :**
        - Vérifie que le lot est toujours `open`.
        - Vérifie que le nouveau montant est supérieur au `current_price` + `min_increment`.
        - Met à jour le `current_price` et le `winner_id` du lot.
        - Enregistre la nouvelle ligne dans la table `bids`.
        - Marque les anciennes enchères des autres utilisateurs comme `outbid`.

## 3. Mise à jour en Temps Réel
- **Technologie :** Supabase Realtime.
- **Composants :** `AuctionCard` et `BiddingWidget`.
- **Comportement :** Dès qu'une ligne est insérée dans la table `bids` ou mise à jour dans `auctions`, tous les clients connectés reçoivent un payload JSON et mettent à jour le prix affiché instantanément sans recharger la page.

## 4. Anti-Sniping (Auto-Extension) - *En cours d'implémentation*
- **Règle :** Si une enchère est placée dans les 2 dernières minutes avant la fin, le temps restant (`ends_at`) est automatiquement prolongé de 2 minutes.
- **But :** Éviter les robots qui enchérissent à la dernière milliseconde et maximiser le prix final pour le vendeur.
