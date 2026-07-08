-- ============================================================
-- Migración #2 — corré esto en tu proyecto Supabase existente
-- (el que ya tiene las tablas del schema.sql original con finanzas).
-- Quita todo lo de finanzas y agrega la tabla de contenido para
-- Reglamento / Requisitos para participar.
-- Supabase → SQL Editor → New query → pegar todo → Run.
-- ============================================================

drop table if exists finanzas_ingresos cascade;
drop table if exists finanzas_gastos cascade;
drop table if exists aportes_equipo cascade;

create table if not exists contenido_paginas (
  clave           text primary key check (clave in ('requisitos','reglamento')),
  titulo          text,
  contenido       text,
  actualizado_en  timestamptz default now()
);

alter table contenido_paginas enable row level security;

drop policy if exists "lectura publica" on contenido_paginas;
create policy "lectura publica" on contenido_paginas for select using (true);

insert into contenido_paginas (clave, titulo, contenido) values
  ('requisitos', 'Requisitos para participar', 'Editá este texto desde el panel admin → Reglamento.'),
  ('reglamento', 'Reglamento del torneo', 'Editá este texto desde el panel admin → Reglamento.')
on conflict (clave) do nothing;
