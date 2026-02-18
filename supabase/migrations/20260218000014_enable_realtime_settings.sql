-- Enable Realtime for site_settings table if not already enabled
alter table "public"."site_settings" replica identity full;

-- Add site_settings to the publication safely
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' 
    and schemaname = 'public' 
    and tablename = 'site_settings'
  ) then
    alter publication supabase_realtime add table "public"."site_settings";
  end if;
end;
$$;
