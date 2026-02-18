# 💰 Flux Financier & Paiements (Stripe)

Ce document explique la gestion de l'argent et des garanties bancaires.

## 1. Cycle de Vie de l'Autorisation (The Hold)
Pour garantir le sérieux des enchérisseurs, nous utilisons le mode "Authorize & Capture".

1. **Autorisation :** Lors du premier bid sur un événement, le système crée un `PaymentIntent` Stripe avec `capture_method: manual`. 
2. **Montant :** Le montant est défini au niveau de l'événement (ex: 500$). 
3. **Statut :** Les fonds sont bloqués sur la carte de l'utilisateur mais non prélevés. L'autorisation est valable 7 jours.

## 2. Traitement à la Clôture
Lorsqu'un lot se termine :

### Cas A : Le Gagnant
- L'autorisation Stripe liée à son enchère gagnante est conservée.
- À la clôture de l'événement complet, l'administrateur peut "Capturer" le montant (le prélèvement devient réel) ou libérer si le paiement est fait par un autre moyen.

### Cas B : Les Perdants
- Le système identifie tous les `PaymentIntent` des utilisateurs n'ayant pas gagné.
- Une Edge Function appelle l'API Stripe pour **Annuler** (cancel) les autorisations.
- Les fonds sont libérés instantanément sur les comptes bancaires des utilisateurs (selon les délais de leur banque).

## 3. Sécurité & Compliance
- **Zéro Stockage de Carte :** Aucune donnée de carte n'est stockée sur nos serveurs. Seul le `stripe_customer_id` et les 4 derniers chiffres (pour affichage) sont conservés via Stripe.
- **Webhook Stripe :** Le système écoute les notifications de Stripe pour mettre à jour les statuts de paiement dans notre base de données.
