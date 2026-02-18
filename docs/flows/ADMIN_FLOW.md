# 🛠 Flux d'Administration (Refine Dashboard)

Ce document décrit les outils mis à la disposition des administrateurs pour piloter la plateforme.

## 1. Gestion des Événements (Auction Events)
- **Concept :** Un événement est une vente aux enchères globale (ex: "Liquidation Bureau X").
- **Fonctionnalités :**
    - Définir les dates de début et de fin.
    - Configurer le montant du dépôt de garantie (Security Hold).
    - Assigner une localisation physique pour le retrait des lots.

## 2. Catalogage de l'Inventaire (Lots)
- **CRUD Modals :** Ajout/Modification rapide de lots sans quitter la liste.
- **Gestion des Images :** 
    - Upload multiple vers le bucket Supabase Storage.
    - Drag & drop pour réorganiser l'ordre des photos.
- **Métadonnées Industrielles :** Champs spécifiques pour la marque (MFG), le modèle, l'année et l'état.

## 3. Modération des Utilisateurs
- **Dashboard :** Vue d'ensemble des nouveaux inscrits.
- **Vérification :** Possibilité de forcer la vérification d'un utilisateur ou de bannir un profil à risque.
- **Journal des Enchères :** Consultation en temps réel de toutes les offres placées sur le site pour détecter des comportements suspects.

## 4. Paramètres Système
- **Maintenance :** Activation/Désactivation du mode maintenance global.
- **Frais (Buyer's Premium) :** Configuration du pourcentage de frais prélevé par la plateforme sur chaque vente.
- **Alertes :** Message global affiché sur le site pour les annonces importantes.
