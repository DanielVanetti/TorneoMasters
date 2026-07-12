-- ============================================================
-- Migración 3 — Torneo Máster Santa Cruz
-- Endurece la seguridad de datos y corrige un par de huecos de
-- integridad encontrados en la auditoría del panel admin.
-- Corré esto en: Supabase → SQL Editor → New query → Run.
-- Es seguro correrlo una sola vez, después de schema.sql y
-- migracion-2-reglamento.sql.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Columnas sensibles fuera de alcance del visitante público
-- ------------------------------------------------------------
-- Hasta ahora "lectura publica ... using (true)" aplicaba a CUALQUIER
-- rol (incluido "anon", la anon key pública que usa el navegador),
-- exponiendo por la API REST de Supabase columnas que el sitio nunca
-- muestra: teléfono/email/delegado de equipos, fecha de nacimiento de
-- jugadores, e informe/incidencias/tarjetas del árbitro por partido.
-- Cualquiera con la anon key (pública por diseño) podía pedirlas con
-- GET {SUPABASE_URL}/rest/v1/equipos?select=delegado,telefono,email
--
-- Esto separa dos roles:
--  - "anon"          → visitantes del sitio público, sin sesión.
--  - "authenticated" → los 2 usuarios del panel admin (no hay registro
--                       público, así que "authenticated" = admin).
-- El panel sigue viendo todas las columnas (las necesita para editar);
-- el sitio público solo ve las que ya usa hoy.

-- EQUIPOS
drop policy if exists "lectura publica" on equipos;
create policy "lectura publica" on equipos for select to anon, authenticated using (true);
revoke select on equipos from anon;
grant select (id, nombre, ciudad, color, logo_url, creado_en) on equipos to anon;
grant select on equipos to authenticated;

-- JUGADORES
drop policy if exists "lectura publica" on jugadores;
create policy "lectura publica" on jugadores for select to anon, authenticated using (true);
revoke select on jugadores from anon;
grant select (id, nombre, equipo_id, numero, posicion, foto_url, creado_en) on jugadores to anon;
grant select on jugadores to authenticated;

-- PARTIDOS
drop policy if exists "lectura publica" on partidos;
create policy "lectura publica" on partidos for select to anon, authenticated using (true);
revoke select on partidos from anon;
grant select (
  id, jornada, fecha, hora, cancha, equipo_local_id, equipo_visitante_id,
  goles_local, goles_visitante, estado, creado_en
) on partidos to anon;
grant select on partidos to authenticated;

-- Las vistas (v_posiciones, v_goleadores, v_proximos_partidos) corren
-- con los privilegios de quien las creó, no con los del rol que
-- consulta — no dependen de los grants de arriba, pero confirmamos el
-- acceso público explícitamente por las dudas.
grant select on v_posiciones to anon, authenticated;
grant select on v_goleadores to anon, authenticated;
grant select on v_proximos_partidos to anon, authenticated;

-- goles, imagenes y contenido_paginas no tienen columnas sensibles —
-- se mantienen con lectura pública total, sin cambios.

-- ------------------------------------------------------------
-- 2) Evitar jugadores duplicados al reimportar el mismo Excel
-- ------------------------------------------------------------
-- Antes, volver a subir el mismo archivo desde /admin/importar creaba
-- filas duplicadas (insert puro, sin unicidad). Si ya existen
-- duplicados reales en tu base, corré primero una limpieza manual
-- antes de este ALTER (te va a fallar si hay conflictos existentes).
alter table jugadores add constraint jugadores_equipo_nombre_unique unique (equipo_id, nombre);

-- Un jugador siempre debe pertenecer a un equipo (el panel ya lo exige
-- al guardar; esto lo garantiza también a nivel de base de datos).
alter table jugadores alter column equipo_id set not null;
