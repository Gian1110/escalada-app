-- All fixture data is rolled back. No emails or production route edits.
begin;
insert into auth.users(id) values ('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222');
select set_config('test.via',(select id::text from public.vias limit 1),true);
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',true);
do $$ begin
if public.mqe_is_editor() then raise exception 'Visitor received editor access'; end if;
if (select count(*) from public.vias)<>360 then raise exception 'Public catalog changed';end if;
begin insert into public.vias(nombre,grado) values('TEST MUST NOT EXIST','6a');raise exception 'Visitor could insert a route';exception when insufficient_privilege then null;end;
begin insert into public.mqe_editors(user_id) values(auth.uid());raise exception 'Visitor could grant editor role';exception when insufficient_privilege then null;end;
end $$;
insert into public.mqe_profiles(user_id,display_name) values(auth.uid(),'Visitor test');
insert into public.mqe_favorites(user_id,via_id) values(auth.uid(),current_setting('test.via')::uuid);
select set_config('request.jwt.claims','{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}',true);
do $$ declare n integer;begin
if exists(select 1 from public.mqe_favorites) or exists(select 1 from public.mqe_profiles) then raise exception 'Cross-account data leak';end if;
delete from public.mqe_favorites;get diagnostics n=row_count;if n<>0 then raise exception 'Cross-account delete';end if;
begin insert into public.mqe_favorites(user_id,via_id) values('11111111-1111-4111-8111-111111111111',current_setting('test.via')::uuid);raise exception 'Cross-account insert';exception when insufficient_privilege then null;end;
end $$;
select set_config('request.jwt.claims','{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',true);
do $$ begin if (select count(*) from public.mqe_favorites)<>1 then raise exception 'Own favorite unavailable';end if;end $$;
delete from public.mqe_favorites where user_id=auth.uid();
select set_config('request.jwt.claims','{"sub":"f5ab10e9-bd66-407e-b1a7-56cc9dad5db1","role":"authenticated"}',true);
do $$ begin if not public.mqe_is_editor() then raise exception 'Felipe lost access';end if;end $$;
select set_config('request.jwt.claims','{"sub":"eca31696-d7a9-4a8e-80b7-3d0ef93814ea","role":"authenticated"}',true);
do $$ begin if not public.mqe_is_editor() then raise exception 'Gian lost access';end if;end $$;
reset role;
rollback;
select 'PASS: visitor isolation, editor access, 360 public routes; all fixtures rolled back' as result;
