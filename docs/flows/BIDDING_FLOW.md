# 🔨 Flux d'Enchères (Bidding Engine)

Ce document décrit la logique métier derrière le placement d'une enchère.

## 1. Pré-requis Opérationnels
Avant de pouvoir soumettre une offre, le système vérifie via le middleware et les Server Actions :
- Authentification valide.
- Carte bancaire valide dans le Wallet.
- **Enregistrement à l'événement** : L'utilisateur doit accepter de bloquer un dépôt de garantie (Hold Stripe) spécifique à l'événement pour activer son "Bidding Passport".

## 2. Placement de l'Enchère (RPC Atomique)
Le système utilise la fonction PostgreSQL `place_bid_secure` pour garantir l'intégrité des données sous forte charge.
- **Verrouillage (Pessimistic Locking)** : La ligne de l'enchère est verrouillée le temps du calcul.
- **Validation** : Vérification du statut `live`, de la date de fin et de l'incrément minimum.
- **Exécution** : Mise à jour du prix, changement du `winner_id` et historisation dans la table `bids`.

## 3. Proxy Bidding (Système Automatisé)
L'utilisateur peut définir un **Montant Maximum**.
- Si un autre utilisateur enchérit, le système place immédiatement une contre-offre pour le compte de l'utilisateur proxy.
- L'incrément automatique correspond au `min_increment` du lot.
- Le système s'arrête dès que le plafond est atteint.
- Le montant maximum reste strictement confidentiel dans la base de données.

## 4. Anti-Sniping (Auto-Extension)
Protection contre les enchères de dernière seconde :
- **Seuil** : 2 minutes (configurable dans l'Admin).
- **Action** : Si une enchère est placée durant ce laps de temps, la date `ends_at` est repoussée de 2 minutes supplémentaires.
- **Synchronisation** : Les clients reçoivent la nouvelle date via Supabase Realtime et mettent à jour le chronomètre visuel instantanément.

## 5. Visualisation & Real-time
- **Payloads Realtime** : Écoute des tables `auctions` et `bids`.
- **Historique** : Un modal permet de voir l'intégralité du stream d'enchères sur un lot pour garantir la transparence.
