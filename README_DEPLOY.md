# Instructions de Déploiement

## 1. Supabase (Base de données)
Copiez le contenu de `supabase/migrations/20260214000000_initial_schema.sql` dans l'éditeur SQL de votre tableau de bord Supabase ou utilisez la CLI Supabase :
```bash
supabase db push
```

## 2. Variables d'Environnement
Créez un fichier `.env.local` à la racine du projet :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase
STRIPE_SECRET_KEY=votre_cle_secrete_stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=votre_cle_publique_stripe
```

Configurez les secrets dans Supabase pour les Edge Functions :
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
```

## 3. Déploiement de l'Edge Function
Déployez la fonction de clôture des enchères :
```bash
supabase functions deploy close-auction
```

Note: Pour déclencher automatiquement la clôture, vous pouvez utiliser **Supabase Cron** (pg_cron) ou un webhook Stripe / Hook de base de données.
Exemple de trigger cron SQL :
```sql
select cron.schedule(
    'close-expired-auctions',
    '* * * * *', -- Toutes les minutes
    $$
    select
      net.http_post(
        url:='https://<project-id>.functions.supabase.co/close-auction',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer <service-role-key>"}'::jsonb,
        body:=jsonb_build_object('auction_id', id)
      )
    from auctions
    where status = 'live' and ends_at <= now();
    $$
);
```

## 4. Administration (Refine)
Accédez à `/admin` pour gérer les enchères. Le dashboard affiche en temps réel les nouvelles mises grâce à Supabase Realtime.
