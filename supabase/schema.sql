-- ============================================================
-- Torneo Máster Santa Cruz — esquema completo de Supabase
-- Corré este archivo entero en: Supabase → SQL Editor → New query → Run
-- Es seguro correrlo una sola vez sobre un proyecto nuevo y vacío.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- EQUIPOS
-- ------------------------------------------------------------
create table equipos (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null unique,
  ciudad        text,
  color         text default '#0E5C6B',
  delegado      text,
  telefono      text,
  email         text,
  cancha_local  text,
  logo_url      text,
  creado_en     timestamptz default now()
);

-- ------------------------------------------------------------
-- JUGADORES
-- ------------------------------------------------------------
create table jugadores (
  id                uuid primary key default gen_random_uuid(),
  nombre            text not null,
  equipo_id         uuid references equipos(id) on delete cascade,
  numero            int,
  posicion          text,
  fecha_nacimiento  date,
  foto_url          text,
  creado_en         timestamptz default now()
);

-- ------------------------------------------------------------
-- PARTIDOS (incluye informe del árbitro)
-- ------------------------------------------------------------
create table partidos (
  id                    uuid primary key default gen_random_uuid(),
  jornada               int not null,
  fecha                 date not null,
  hora                  time,
  cancha                text,
  equipo_local_id       uuid references equipos(id),
  equipo_visitante_id   uuid references equipos(id),
  goles_local           int,
  goles_visitante       int,
  estado                text default 'Programado' check (estado in ('Programado','Jugado','Suspendido')),
  arbitro_nombre        text,
  informe_arbitro       text,
  tarjetas_amarillas    jsonb,
  tarjetas_rojas        jsonb,
  incidencias           text,
  creado_en             timestamptz default now(),
  check (equipo_local_id <> equipo_visitante_id)
);

-- ------------------------------------------------------------
-- GOLES (detalle por jugador, para la tabla de goleadores)
-- ------------------------------------------------------------
create table goles (
  id          uuid primary key default gen_random_uuid(),
  partido_id  uuid references partidos(id) on delete cascade,
  jugador_id  uuid references jugadores(id) on delete cascade,
  cantidad    int not null default 1
);

-- ------------------------------------------------------------
-- GALERÍA DE IMÁGENES
-- ------------------------------------------------------------
create table imagenes (
  id            uuid primary key default gen_random_uuid(),
  partido_id    uuid references partidos(id) on delete set null,
  titulo        text,
  descripcion   text,
  url_imagen    text not null,
  subida_en     timestamptz default now()
);

-- ------------------------------------------------------------
-- FINANZAS — no estaba en el plan original, se agrega para que
-- la página "Transparencia financiera" del sitio tenga datos reales.
-- ------------------------------------------------------------
create table finanzas_ingresos (
  id        uuid primary key default gen_random_uuid(),
  concepto  text not null,
  monto     numeric not null default 0,
  fecha     date default current_date,
  creado_en timestamptz default now()
);

create table finanzas_gastos (
  id        uuid primary key default gen_random_uuid(),
  concepto  text not null,
  monto     numeric not null default 0,
  fecha     date default current_date,
  creado_en timestamptz default now()
);

create table aportes_equipo (
  equipo_id       uuid primary key references equipos(id) on delete cascade,
  inscripcion     text default 'Pendiente' check (inscripcion in ('Al día','Pendiente')),
  cuotas_al_dia   int default 0,
  cuotas_total    int default 0,
  aporte_total    numeric default 0
);

-- No hace falta tabla "admins" con rol/equipo_id: los dos usuarios
-- administradores viven directo en Supabase Auth (auth.users), sin
-- distinción de permisos — cualquiera que inicie sesión puede todo.

-- ============================================================
-- VISTAS CALCULADAS
-- ============================================================

-- TABLA DE POSICIONES (pts y dg ya calculados, lista para el frontend)
create view v_posiciones as
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
left join partidos p on p.equipo_local_id = e.id or p.equipo_visitante_id = e.id
group by e.id, e.nombre, e.ciudad, e.color
order by pts desc, dg desc, gf desc;

-- GOLEADORES
create view v_goleadores as
select j.id as jugador_id, j.nombre as name, e.nombre as team, coalesce(sum(g.cantidad), 0) as goals
from jugadores j
join equipos e on e.id = j.equipo_id
left join goles g on g.jugador_id = j.id
group by j.id, j.nombre, e.nombre
having coalesce(sum(g.cantidad), 0) > 0
order by goals desc;

-- PRÓXIMOS PARTIDOS (con nombres de equipo ya resueltos)
create view v_proximos_partidos as
select
  p.id, p.jornada, p.fecha, p.hora, p.cancha, p.estado,
  el.nombre as home, ev.nombre as away
from partidos p
join equipos el on el.id = p.equipo_local_id
join equipos ev on ev.id = p.equipo_visitante_id
where p.estado = 'Programado'
order by p.fecha asc, p.hora asc;

-- ============================================================
-- ROW LEVEL SECURITY
-- Lectura pública para todo lo que se muestra en el sitio.
-- Escritura SOLO desde las Netlify Functions, que usan la
-- service_role key (esa se salta RLS por diseño) — por eso no
-- hace falta ninguna política de INSERT/UPDATE/DELETE acá.
-- ============================================================
alter table equipos enable row level security;
alter table jugadores enable row level security;
alter table partidos enable row level security;
alter table goles enable row level security;
alter table imagenes enable row level security;
alter table finanzas_ingresos enable row level security;
alter table finanzas_gastos enable row level security;
alter table aportes_equipo enable row level security;

create policy "lectura publica" on equipos for select using (true);
create policy "lectura publica" on jugadores for select using (true);
create policy "lectura publica" on partidos for select using (true);
create policy "lectura publica" on goles for select using (true);
create policy "lectura publica" on imagenes for select using (true);
create policy "lectura publica" on finanzas_ingresos for select using (true);
create policy "lectura publica" on finanzas_gastos for select using (true);
create policy "lectura publica" on aportes_equipo for select using (true);

-- ============================================================
-- STORAGE — bucket público para las fotos de la galería
-- ============================================================
insert into storage.buckets (id, name, public)
values ('fotos-torneo', 'fotos-torneo', true)
on conflict (id) do nothing;

create policy "lectura publica de fotos"
  on storage.objects for select
  using (bucket_id = 'fotos-torneo');

-- ============================================================
-- DATOS DE EJEMPLO (opcional) — comentado.
-- Si querés arrancar con los mismos 16 equipos de prueba que ya
-- tenía el sitio, pedime y te genero los INSERT a partir de
-- data/teams.js, data/players.js, data/fixtures.js.
-- ============================================================
