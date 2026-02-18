# 💰 Flux Financier & Paiements (Stripe)

Ce document explique la gestion monétaire, des garanties bancaires à la facturation finale.

## 1. Dépôt de Garantie (Event Deposit)
Le système protège les vendeurs via un dépôt obligatoire pour chaque événement.
- **Hold Initial** : Avant de pouvoir enchérir, un montant fixe (ex: 500$) est bloqué sur la carte bancaire via un `PaymentIntent` en mode `manual capture`.
- **Portée** : Ce hold couvre l'ensemble des lots de l'événement. Un seul hold est effectué par utilisateur et par événement.

## 2. Cycle de Vie Transactionnel
Lors du placement d'une enchère :
- Une autorisation correspondant au montant de l'offre peut être effectuée pour valider la solvabilité immédiate.
- En cas de surenchère par un tiers, l'autorisation précédente est libérée (annulée).

## 3. Clôture & Facturation (Post-Vente)
Dès qu'un lot est marqué comme "Sold" :
1.  **Capture** : Le hold de garantie peut être capturé partiellement ou totalement.
2.  **Invoice Generation** : Un enregistrement `sale` est créé automatiquement avec :
    - Le Hammer Price (Prix final).
    - Le Buyer's Premium (Frais de plateforme).
    - La Taxe de vente (calculée selon le taux en vigueur).
3.  **Settlement** : L'utilisateur peut payer le solde via le portail ou manuellement (virement/chèque) auprès de l'administration.

## 4. Libération des fonds (Perdants)
Pour tous les participants n'ayant pas remporté de lots, le système déclenche une commande `cancel` sur tous les PaymentIntents restants à la clôture de l'événement, libérant les plafonds bancaires sous 24-48h.

## 5. Gate Pass & Audit
Le paiement intégral déclenche le statut `PAID`. Ce statut est le seul permettant la génération du **Gate Pass**, indispensable pour sortir l'objet de l'entrepôt.
