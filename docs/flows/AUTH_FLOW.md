# 🔐 Flux d'Authentification & Onboarding

Ce document détaille le parcours d'un utilisateur, de la création de son compte à sa validation finale.

## 1. Inscription Multi-Étapes (Sign Up)
- **Route :** `/auth/signup`
- **Étapes :**
    1.  **Identité** : Nom complet, Email, Téléphone, Mot de passe.
    2.  **Localisation** : Adresse physique complète (nécessaire pour la conformité fiscale et logistique).
    3.  **Sécurité (Stripe)** : Enregistrement d'une carte bancaire via Stripe Elements. Une empreinte de 1$ est effectuée et annulée immédiatement pour valider la carte.
    4.  **Accords** : Signature électronique des conditions générales d'enchères.

## 2. Vérification d'Identité (OTP)
- **Route :** `/auth/verify`
- **Processus :**
    1. Après le formulaire, un code OTP (6 à 8 chiffres) est envoyé par email.
    2. L'utilisateur doit saisir ce code pour activer son compte.
    3. **Technique** : Utilisation de `supabase.auth.verifyOtp`. En cas de succès, le profil est marqué comme actif et l'utilisateur est redirigé avec le flag `verified=true`.

## 3. Connexion (Sign In)
- **Route :** `/auth/signin`
- **Mécanisme :** Authentification via Supabase. 
- **Redirection Intelligente :**
    - Redirection vers `/admin` pour les rôles `admin` ou `moderator`.
    - Redirection vers `/auctions` (Catalogue) pour les clients.
- **Rafraîchissement :** Utilisation de `window.location.href` ou `router.refresh()` pour garantir que le `Header` se synchronise instantanément avec la nouvelle session.

## 4. Gestion du Wallet
- L'utilisateur peut ajouter ou supprimer des cartes bancaires depuis son profil.
- Une carte par défaut est marquée dans Stripe et dans le profil Supabase pour les futures enchères.
