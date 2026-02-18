# 🤖 Flux d'Automatisation & Notifications

Ce document détaille les processus qui tournent en arrière-plan sans intervention humaine.

## 1. Automatisation de la Clôture
- **Outil :** Extension `pg_cron` dans PostgreSQL + Supabase Edge Functions.
- **Flux :**
    1. Une tâche planifiée vérifie chaque minute si des lots ont dépassé leur `ends_at`.
    2. Pour chaque lot expiré, elle appelle l'Edge Function `close-auction`.
    3. L'Edge Function :
        - Change le statut du lot de `open` à `sold` (ou `closed` si pas d'offre).
        - Identifie le `winner_id`.
        - Déclenche l'envoi de l'email de succès.

## 2. Notifications Emails (Resend)
- **Outbid Alert (Instantané) :** Déclenché par la Server Action de bid. Si l'ancien gagnant est différent du nouveau, un email est envoyé immédiatement.
- **Won Email (Différé) :** Envoyé lors de la clôture officielle du lot par l'Edge Function.
- **Welcome Email :** Envoyé lors de la confirmation d'inscription.

## 3. Triggers Database (SQL)
Plusieurs triggers automatisent la cohérence des données :
- **Profile Creation :** Crée un profil public dès qu'un utilisateur s'inscrit dans Auth.
- **Timestamps :** Mise à jour automatique des colonnes `updated_at`.
- **Bid Counter :** (Optionnel) Incrémente le nombre de bids sur le lot pour optimiser les performances d'affichage.

## 4. Nettoyage & Maintenance
- Suppression automatique des logs anciens.
- Libération des autorisations Stripe périmées non capturées.
