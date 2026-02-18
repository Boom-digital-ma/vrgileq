# 🔐 Flux d'Authentification & Onboarding

Ce document détaille le parcours d'un utilisateur, de la création de son compte à sa validation pour enchérir.

## 1. Inscription (Sign Up)
- **Route :** `/auth/signup`
- **Processus :**
    1. L'utilisateur remplit le formulaire (Email, Mot de passe, Nom, Prénom).
    2. Création du compte dans **Supabase Auth**.
    3. Un trigger SQL crée automatiquement une entrée dans la table `public.profiles`.
    4. Envoi d'un email de confirmation via Resend (configuré en SMTP dans Supabase).

## 2. Validation de la Carte Bancaire (KYC/KYB Light)
*Indispensable pour pouvoir placer une enchère.*
- **Action :** `savePaymentMethod` (`app/actions/payment.ts`)
- **Composant :** `CardValidation.tsx`
- **Technique :**
    1. Utilisation de **Stripe Elements** pour capturer les données bancaires de manière sécurisée (PCI Compliance).
    2. Création (si nécessaire) d'un `Customer` Stripe lié à l'ID de profil.
    3. **Empreinte de 1$ :** Une demande d'autorisation de 1$ est effectuée (`capture_method: manual`).
    4. **Annulation Immédiate :** L'autorisation est annulée aussitôt. 
    5. **Résultat :** Si l'opération réussit, le champ `is_verified` du profil passe à `true` et le `stripe_customer_id` est stocké.

## 3. Connexion & Session
- **Route :** `/auth/signin`
- **Technique :** Session gérée par Supabase avec des cookies sécurisés (PKCE Flow).
- **Rôles :** Le profil est récupéré pour déterminer si l'utilisateur est un `user` standard ou un `admin`.

## 4. Sécurité (RLS)
- Toutes les données de profil sont protégées par des politiques **Row Level Security** :
    - Un utilisateur ne peut lire/modifier que son propre profil.
    - Seuls les administrateurs peuvent voir la liste de tous les profils.
