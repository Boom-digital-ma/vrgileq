# 🧪 Guide de Tests Automatisés (Playwright)

Ce projet utilise **Playwright** pour assurer la qualité et la robustesse des parcours utilisateurs critiques. Ce guide explique comment lancer et maintenir ces tests.

## 📋 Pré-requis

Assurez-vous que les dépendances sont installées :
```bash
npm install
npx playwright install
```

Assurez-vous également que votre fichier `.env.local` contient une clé Stripe de test valide (`STRIPE_SECRET_KEY`) pour que l'iframe de paiement fonctionne.

---

## 🚀 Lancer les Tests

### 1. Mode Interface Graphique (Recommandé)
Pour voir les tests s'exécuter dans un navigateur, déboguer étape par étape et voir les traces :
```bash
npx playwright test --ui
```

### 2. Mode Ligne de Commande (CI/CD)
Pour une exécution rapide sans interface graphique :
```bash
npx playwright test
```

### 3. Lancer un test spécifique
```bash
npx playwright test tests/auth-flow.spec.ts
```

---

## 📂 Structure des Tests

Les tests se trouvent dans le dossier `/tests`.

### `auth-flow.spec.ts` (Test Principal)
Ce fichier couvre le parcours d'authentification complet ("Golden Path") :
1.  **Inscription** : Remplissage du formulaire multi-étapes.
2.  **Paiement (Stripe)** : Saisie automatisée d'une carte de test (`4242...`) dans l'iframe sécurisée.
3.  **Validation Email (Yopmail)** : 
    *   Ouverture d'un nouvel onglet vers la boîte de réception Yopmail.
    *   Attente de l'email de Supabase.
    *   Extraction automatique du code OTP (6-8 chiffres).
4.  **Vérification** : Saisie du code sur le site et validation de la redirection.
5.  **Connexion / Déconnexion** : Test du login avec un compte existant et du logout.

---

## 🛠 Maintenance & Bonnes Pratiques

- **Sélecteurs** : Privilégiez toujours les rôles (`getByRole`) et les labels (`getByLabel`) plutôt que les classes CSS (`.bg-red-500`).
- **Timeouts** : Le test d'inscription a un timeout étendu à **120 secondes** car il dépend de services tiers (Stripe, Yopmail) qui peuvent avoir de la latence.
- **Yopmail** : Si l'extraction de l'email échoue, vérifiez que l'interface de Yopmail n'a pas changé. Le test cible l'iframe `#ifmail`.

## ⚠️ Dépannage Courant

**Erreur : "Test timeout of 30000ms exceeded"**
*   **Cause :** Le serveur de dev est trop lent à démarrer ou l'email met du temps à arriver.
*   **Solution :** Lancez votre serveur de dev (`npm run dev`) dans un terminal séparé AVANT de lancer les tests. Playwright se connectera directement à `localhost:3000`.

**Erreur : "Element not found" dans l'iframe Stripe**
*   **Cause :** Stripe a changé ses identifiants internes.
*   **Solution :** Vérifiez le sélecteur `iframe[name^="__privateStripeFrame"]` dans le fichier de test.
