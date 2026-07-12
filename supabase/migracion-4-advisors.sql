-- ============================================================
-- Migración 4 — Torneo Máster Santa Cruz
-- Ya aplicada en producción (2026-07-10, vía Supabase MCP). Se deja acá
-- como registro histórico, igual que migracion-2 y migracion-3 — no
-- hace falta volver a correrla en ese mismo proyecto.
-- Corrige los 2 hallazgos de "Security Advisors" que quedaron después
-- de migracion-3-seguridad.sql.
-- ============================================================

-- 1) Vistas con SECURITY DEFINER implícito
-- ------------------------------------------------------------
-- Las vistas corrían con los privilegios de quien las creó (el dueño),
-- no de quien consulta — no era explotable hoy porque solo exponen
-- datos ya públicos, pero conviene que respeten RLS igual.
alter view v_posiciones set (security_invoker = on);
alter view v_goleadores set (security_invoker = on);
alter view v_proximos_partidos set (security_invoker = on);

-- 2) Bucket público permitía listar todos los archivos
-- ------------------------------------------------------------
-- El bucket "fotos-torneo" ya es público: el acceso por URL pública
-- (/storage/v1/object/public/...) no depende de ninguna policy de RLS.
-- Esta policy solo habilitaba listar/enumerar todos los archivos del
-- bucket vía la API de Storage (list()), lo cual no hace falta para
-- servir fotos por URL y exponía más de lo necesario.
drop policy if exists "lectura publica de fotos" on storage.objects;
