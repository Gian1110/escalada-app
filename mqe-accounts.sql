begin;
-- Existing editors retain their access. Visitors cannot grant themselves this role.
create table public.mqe_editors (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.mqe_editors enable row level security;
revoke all on public.mqe_editors from anon, authenticated;
insert into public.mqe_editors(user_id) select id from auth.users where id in ('eca31696-d7a9-4a8e-80b7-3d0ef93814ea','f5ab10e9-bd66-407e-b1a7-56cc9dad5db1');
create function public.mqe_is_editor() returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.mqe_editors where user_id = (select auth.uid())); $$;
revoke all on function public.mqe_is_editor() from public;
grant execute on function public.mqe_is_editor() to authenticated;
do $$ declare t text; begin foreach t in array array['provincias','lugares','grupos','vias'] loop
execute format('alter policy %I on public.%I with check ((select public.mqe_is_editor()))','admin insert '||t,t);
execute format('alter policy %I on public.%I using ((select public.mqe_is_editor())) with check ((select public.mqe_is_editor()))','admin update '||t,t);
execute format('alter policy %I on public.%I using ((select public.mqe_is_editor()))','admin delete '||t,t);
end loop; end $$;
alter policy "admin upload imagenes" on storage.objects with check (bucket_id='imagenes' and (select public.mqe_is_editor()));
alter policy "admin delete imagenes" on storage.objects using (bucket_id='imagenes' and (select public.mqe_is_editor()));
create table public.mqe_profiles (user_id uuid primary key references auth.users(id) on delete cascade, display_name text not null check (char_length(trim(display_name)) between 1 and 80));
create table public.mqe_favorites (user_id uuid not null references auth.users(id) on delete cascade, via_id uuid not null references public.vias(id) on delete cascade, created_at timestamptz not null default now(), primary key(user_id,via_id));
alter table public.mqe_profiles enable row level security;
alter table public.mqe_favorites enable row level security;
revoke all on public.mqe_profiles, public.mqe_favorites from anon, authenticated;
grant select, insert, update on public.mqe_profiles to authenticated;
grant select, insert, delete on public.mqe_favorites to authenticated;
create policy own_profile_read on public.mqe_profiles for select to authenticated using (user_id=(select auth.uid()));
create policy own_profile_insert on public.mqe_profiles for insert to authenticated with check (user_id=(select auth.uid()));
create policy own_profile_update on public.mqe_profiles for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create policy own_favorites_read on public.mqe_favorites for select to authenticated using (user_id=(select auth.uid()));
create policy own_favorites_insert on public.mqe_favorites for insert to authenticated with check (user_id=(select auth.uid()));
create policy own_favorites_delete on public.mqe_favorites for delete to authenticated using (user_id=(select auth.uid()));
-- Registration stays closed in the UI until the email decision is resolved.
create table public.mqe_settings (id boolean primary key default true check(id), registration_open boolean not null default false);
insert into public.mqe_settings(id) values(true);
alter table public.mqe_settings enable row level security;
revoke all on public.mqe_settings from anon, authenticated;
grant select on public.mqe_settings to anon,authenticated;
create policy public_settings on public.mqe_settings for select using(true);
commit;
