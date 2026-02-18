# 🤖 Flux d'Automatisation & Notifications

Ce document détaille les processus autonomes pilotant l'intelligence de la plateforme.

## 1. Automatisation de la Clôture
- **Mécanisme** : Extension `pg_cron` (PostgreSQL) + Edge Functions (Deno).
- **Processus** :
    1.  Vérification à chaque minute des lots arrivant à échéance.
    2.  Appel de l'Edge Function `close-auction`.
    3.  **Résolution** :
        - Statut lot -> `sold`.
        - Capture du Payment Intent Stripe du gagnant.
        - Libération (cancel) des Payment Intents des perdants.
        - Envoi de l'email de victoire avec lien vers la facture.

## 2. Intelligence Transactionnelle (Triggers SQL)
Le coeur de l'automatisation repose sur des déclencheurs de base de données :
- **Auto-Invoicing** : Dès qu'une enchère est marquée `sold`, un trigger calcule les frais/taxes et crée l'enregistrement `sale`.
- **Profile Synchronization** : Création automatique du profil utilisateur et liaison avec les métadonnées lors de l'inscription.
- **Logistics Link** : Mise à jour automatique des capacités de retrait lors d'une réservation de créneau.

## 3. Communication Système (Resend)
Les notifications sont orchestrées par des actions serveurs et des Edge Functions :
- **Instantané** : Alertes de surenchère (Outbid) envoyées dès le clic de l'adversaire.
- **Transactionnel** : Confirmation d'inscription (OTP), facture prête, et bon de sortie généré.
- **Watchlist Alerts** : Notification automatique X minutes avant la clôture des objets suivis.

## 4. Maintenance Automatique
- **Cleanup** : Suppression périodique des sessions expirées.
- **Stripe Sync** : Réconciliation automatique des statuts de paiement via Webhooks.
