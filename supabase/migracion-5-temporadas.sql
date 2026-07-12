-- ============================================================
-- Migración 5 — Torneo Máster Santa Cruz
-- Agrega la feature de "temporadas": cada temporada es un contenedor
-- completo (equipos, jugadores, partidos, goles propios); el sitio
-- público y las vistas siempre muestran la que está marcada "activa".
-- Todo lo que ya existe en la base se asigna a una temporada nueva,
-- creada acá mismo y marcada como activa, así no se pierde ni se
-- oculta nada de lo que ya está cargado.
-- Corré esto una sola vez en: Supabase → SQL Editor → New query → Run
-- (o vía Supabase MCP con apply_migration, con confirmación previa).
-- ============================================================

-- 1) Tabla temporadas
-- ------------------------------------------------------------
create table temporadas (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null unique,
  activa      boolean not null default false,
  creado_en   timestamptz default now()
);
create unique index una_temporada_activa on temporadas (activa) where activa;

alter table temporadas enable row level security;
create policy "lectura publica" on temporadas for select using (true);
grant select on temporadas to anon, authenticated;

-- Temporada para todo lo que ya existe en la base — queda activa.
insert into temporadas (nombre, activa) values ('Temporada 2026', true);

-- 2) Columna temporada_id en equipos/partidos/imagenes
-- ------------------------------------------------------------
-- Se agrega nullable, se rellena con la temporada recién creada para
-- las filas existentes, y recién después se pasa a NOT NULL.
alter table equipos add column temporada_id uuid references temporadas(id);
alter table partidos add column temporada_id uuid references temporadas(id);
alter table imagenes add column temporada_id uuid references temporadas(id);

update equipos set temporada_id = (select id from temporadas where nombre = 'Temporada 2026');
update partidos set temporada_id = (select id from temporadas where nombre = 'Temporada 2026');
update imagenes set temporada_id = (select id from temporadas where nombre = 'Temporada 2026');

alter table equipos alter column temporada_id set not null;
alter table partidos alter column temporada_id set not null;
alter table imagenes alter column temporada_id set not null;

-- 3) Un mismo nombre de equipo puede repetirse entre temporadas
-- ------------------------------------------------------------
alter table equipos drop constraint if exists equipos_nombre_key;
alter table equipos add constraint equipos_nombre_temporada_unique unique (nombre, temporada_id);

-- 4) Grants: anon necesita poder leer temporada_id de equipos/partidos
-- ------------------------------------------------------------
-- (lo usa en el JOIN de las vistas de abajo, aunque no aparezca en el
-- SELECT final — con security_invoker el chequeo de columna aplica igual).
grant select (temporada_id) on equipos to anon;
grant select (temporada_id) on partidos to anon;

-- 5) Vistas: ahora solo muestran la temporada activa
-- ------------------------------------------------------------
drop view v_posiciones;
create view v_posiciones with (security_invoker = true) as
select
  e.id as equipo_id,
  e.nombre as equipo,
  e.ciudad as city,
  e.color as color,
  count(*) filter (where p.estado = 'Jugado') as pj,
  count(*) filter (where p.estado = 'Jugado' and
    ((p.equipo_local_id = e.id and p.goles_local > p.goles_visitante) or
     (p.equipo_visitante_id = e.id and p.goles_visitante > p.goles_local))) as pg,
  count(*) filter (where p.estado = 'Jugado' and p.goles_local = p.goles_visitante) as pe,
  count(*) filter (where p.estado = 'Jugado' and
    ((p.equipo_local_id = e.id and p.goles_local < p.goles_visitante) or
     (p.equipo_visitante_id = e.id and p.goles_visitante < p.goles_local))) as pp,
  coalesce(sum(case when p.equipo_local_id = e.id then p.goles_local
                     when p.equipo_visitante_id = e.id then p.goles_visitante end)
           filter (where p.estado = 'Jugado'), 0) as gf,
  coalesce(sum(case when p.equipo_local_id = e.id then p.goles_visitante
                     when p.equipo_visitante_id = e.id then p.goles_local end)
           filter (where p.estado = 'Jugado'), 0) as gc,
  coalesce(sum(case when p.equipo_local_id = e.id then p.goles_local
                     when p.equipo_visitante_id = e.id then p.goles_visitante end)
           filter (where p.estado = 'Jugado'), 0)
  - coalesce(sum(case when p.equipo_local_id = e.id then p.goles_visitante
                       when p.equipo_visitante_id = e.id then p.goles_local end)
           filter (where p.estado = 'Jugado'), 0) as dg,
  (count(*) filter (where p.estado = 'Jugado' and
    ((p.equipo_local_id = e.id and p.goles_local > p.goles_visitante) or
     (p.equipo_visitante_id = e.id and p.goles_visitante > p.goles_local))) * 3)
  + count(*) filter (where p.estado = 'Jugado' and p.goles_local = p.goles_visitante) as pts
from equipos e
join temporadas t on t.id = e.temporada_id and t.activa
left join partidos p on p.equipo_local_id = e.id or p.equipo_visitante_id = e.id
group by e.id, e.nombre, e.ciudad, e.color
order by pts desc, dg desc, gf desc;
grant select on v_posiciones to anon, authenticated;

drop view v_goleadores;
create view v_goleadores with (security_invoker = true) as
select j.id as jugador_id, j.nombre as name, e.nombre as team, coalesce(sum(g.cantidad), 0) as goals
from jugadores j
join equipos e on e.id = j.equipo_id
join temporadas t on t.id = e.temporada_id and t.activa
left join goles g on g.jugador_id = j.id
group by j.id, j.nombre, e.nombre
having coalesce(sum(g.cantidad), 0) > 0
order by goals desc;
grant select on v_goleadores to anon, authenticated;

drop view v_proximos_partidos;
create view v_proximos_partidos with (security_invoker = true) as
select
  p.id, p.jornada, p.fecha, p.hora, p.cancha, p.estado,
  el.nombre as home, ev.nombre as away
from partidos p
join temporadas t on t.id = p.temporada_id and t.activa
join equipos el on el.id = p.equipo_local_id
join equipos ev on ev.id = p.equipo_visitante_id
where p.estado = 'Programado'
order by p.fecha asc, p.hora asc;
grant select on v_proximos_partidos to anon, authenticated;
