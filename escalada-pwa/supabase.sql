-- ============================================================
-- GUÍA DE ESCALADA TUCUMÁN — Schema Supabase
-- Correr en: supabase.com → tu proyecto → SQL Editor → New Query
-- ============================================================

-- LUGARES
create table if not exists lugares (
  id           uuid primary key default gen_random_uuid(),
  nombre       text not null,
  zona         text,
  descripcion  text,
  maps_url     text,
  imagen       text,
  creado_en    timestamptz default now()
);

-- GRUPOS DE VÍAS
create table if not exists grupos (
  id           uuid primary key default gen_random_uuid(),
  lugar_id     uuid references lugares(id) on delete cascade,
  nombre       text not null,
  descripcion  text,
  imagen       text,
  altitud      text,
  auto_url     text,
  acampe_url   text,
  acampe_obs   text,
  creado_en    timestamptz default now()
);

-- VÍAS
create table if not exists vias (
  id           uuid primary key default gen_random_uuid(),
  lugar_id     uuid references lugares(id) on delete cascade,
  grupo_id     uuid references grupos(id) on delete cascade,
  nombre       text not null,
  numero       int,
  equipador    text,
  temporada    text,
  grado        text not null,
  grado_n      int,
  tipo         text default 'Deportiva',
  express_min  int,
  express_rec  int,
  tiempo       text,
  chapas       text,
  largo        text,
  video_via    text,
  video_aprox  text,
  notas        text,
  imagen       text,
  creado_en    timestamptz default now()
);

-- ── ROW LEVEL SECURITY ──────────────────────────────────────
-- Lectura pública (cualquiera puede ver las rutas)
alter table lugares enable row level security;
alter table grupos  enable row level security;
alter table vias    enable row level security;

create policy "lectura pública lugares"
  on lugares for select using (true);

create policy "lectura pública grupos"
  on grupos for select using (true);

create policy "lectura pública vias"
  on vias for select using (true);

-- Solo usuarios autenticados pueden escribir
create policy "admin insert lugares"
  on lugares for insert to authenticated with check (true);

create policy "admin update lugares"
  on lugares for update to authenticated using (true);

create policy "admin delete lugares"
  on lugares for delete to authenticated using (true);

create policy "admin insert grupos"
  on grupos for insert to authenticated with check (true);

create policy "admin update grupos"
  on grupos for update to authenticated using (true);

create policy "admin delete grupos"
  on grupos for delete to authenticated using (true);

create policy "admin insert vias"
  on vias for insert to authenticated with check (true);

create policy "admin update vias"
  on vias for update to authenticated using (true);

create policy "admin delete vias"
  on vias for delete to authenticated using (true);

-- ── STORAGE ─────────────────────────────────────────────────
-- Crear bucket para imágenes en:
-- Supabase → Storage → New bucket → nombre: "imagenes" → Public: ON

-- Políticas de storage (correr después de crear el bucket):
insert into storage.buckets (id, name, public)
values ('imagenes', 'imagenes', true)
on conflict do nothing;

create policy "lectura pública imagenes"
  on storage.objects for select
  using (bucket_id = 'imagenes');

create policy "admin upload imagenes"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'imagenes');

create policy "admin delete imagenes"
  on storage.objects for delete to authenticated
  using (bucket_id = 'imagenes');
