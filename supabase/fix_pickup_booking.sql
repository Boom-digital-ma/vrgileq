-- ==========================================================
-- SCRIPT DE RÉPARATION DU SYSTÈME DE RÉSERVATION (PICKUP)
-- Autorise les administrateurs à prendre RDV pour les clients
-- ==========================================================

CREATE OR REPLACE FUNCTION public.book_pickup_slot(
    p_sale_id UUID,
    p_slot_id UUID
) RETURNS VOID AS $$
DECLARE
    v_max_cap INTEGER;
    v_curr_count INTEGER;
    v_is_admin BOOLEAN;
BEGIN
    -- 1. Vérifier si l'utilisateur actuel est un administrateur
    SELECT (role = 'admin') INTO v_is_admin 
    FROM public.profiles 
    WHERE id = auth.uid();

    -- 2. Vérifier la capacité du créneau
    SELECT max_capacity INTO v_max_cap FROM public.pickup_slots WHERE id = p_slot_id;
    SELECT count(*) INTO v_curr_count FROM public.sales WHERE pickup_slot_id = p_slot_id;
    
    IF v_curr_count >= v_max_cap THEN
        RAISE EXCEPTION 'This slot is fully booked';
    END IF;
    
    -- 3. Mettre à jour la vente
    -- On autorise la mise à jour si :
    --    a) L'utilisateur est le gagnant du lot (winner_id)
    --    OU
    --    b) L'utilisateur est un administrateur (v_is_admin)
    UPDATE public.sales 
    SET pickup_slot_id = p_slot_id,
        updated_at = now()
    WHERE id = p_sale_id 
    AND (winner_id = auth.uid() OR v_is_admin = true);

    -- 4. Vérifier si la mise à jour a bien eu lieu
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sale not found or unauthorized access. Only the winner or an admin can book this slot.';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note : SECURITY DEFINER est crucial ici pour permettre à la fonction 
-- d'outrepasser les politiques RLS restrictives lors de l'exécution.
