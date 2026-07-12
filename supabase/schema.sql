-- ============================================================
-- Torneo Máster Santa Cruz — esquema completo de Supabase
-- Corré este archivo entero en: Supabase → SQL Editor → New query → Run
-- Es seguro correrlo una sola vez sobre un proyecto nuevo y vacío.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- TEMPORADAS
-- Cada temporada es un contenedor completo: sus propios equipos,
-- jugadores, partidos y goles. Solo una puede estar "activa" a la vez
-- (el sitio público y el panel muestran esa); las demás quedan
-- archivadas en la base, no se borran.
-- ------------------------------------------------------------
create table temporadas (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null unique,
  activa      boolean not null default false,
  creado_en   timestamptz default now()
);

-- Garantiza a nivel de base que nunca haya 2 temporadas activas a la
-- vez (índice único parcial: solo indexa las filas con activa = true).
create unique index una_temporada_activa on temporadas (activa) where activa;

-- ------------------------------------------------------------
-- EQUIPOS
-- ------------------------------------------------------------
create table equipos (
  id            uuid primary key default gen_random_uuid(),
  temporada_id  uuid not null references temporadas(id),
  nombre        text not null,
  ciudad        text,
  color         text default '#0E5C6B',
  delegado      text,
  telefono      text,
  email         text,
  cancha_local  text,
  logo_url      text,
  creado_en     timestamptz default now(),
  unique (nombre, temporada_id)
);

-- ------------------------------------------------------------
-- JUGADORES
-- No tiene temporada_id propio: hereda la temporada de su equipo
-- (equipo_id → equipos.temporada_id).
-- ------------------------------------------------------------
create table jugadores (
  id                uuid primary key default gen_random_uuid(),
  nombre            text not null,
  equipo_id         uuid not null references equipos(id) on delete cascade,
  numero            int,
  posicion          text,
  fecha_nacimiento  date,
  foto_url          text,
  creado_en         timestamptz default now(),
  unique (equipo_id, nombre)
);

-- ------------------------------------------------------------
-- PARTIDOS (incluye informe del árbitro)
-- ------------------------------------------------------------
create table partidos (
  id                    uuid primary key default gen_random_uuid(),
  temporada_id          uuid not null references temporadas(id),
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
-- Sin temporada_id propio: hereda vía partido_id.
-- ------------------------------------------------------------
create table goles (
  id          uuid primary key default gen_random_uuid(),
  partido_id  uuid references partidos(id) on delete cascade,
  jugador_id  uuid references jugadores(id) on delete cascade,
  cantidad    int not null default 1
);

-- ------------------------------------------------------------
-- GALERÍA DE IMÁGENES
-- temporada_id propio (a diferencia de goles/jugadores) porque no
-- todas las fotos tienen partido_id — hay fotos generales del torneo
-- sin partido asociado, y de ahí no se puede inferir la temporada.
-- ------------------------------------------------------------
create table imagenes (
  id            uuid primary key default gen_random_uuid(),
  temporada_id  uuid not null references temporadas(id),
  partido_id    uuid references partidos(id) on delete set null,
  titulo        text,
  descripcion   text,
  url_imagen    text not null,
  subida_en     timestamptz default now()
);

-- ------------------------------------------------------------
-- CONTENIDO DE PÁGINAS (Reglamento / Requisitos para participar)
-- Una fila por sección, editable desde el admin. El contenido se
-- guarda como texto plano con saltos de línea.
-- ------------------------------------------------------------
create table contenido_paginas (
  clave           text primary key check (clave in ('requisitos','reglamento')),
  titulo          text,
  contenido       text,
  actualizado_en  timestamptz default now()
);

-- No hace falta tabla "admins" con rol/equipo_id: los dos usuarios
-- administradores viven directo en Supabase Auth (auth.users), sin
-- distinción de permisos — cualquiera que inicie sesión puede todo.

-- ============================================================
-- VISTAS CALCULADAS
-- ============================================================

-- TABLA DE POSICIONES (pts y dg ya calculados, lista para el frontend)
-- security_invoker: la vista corre con los privilegios de quien consulta
-- (no del creador), así respeta la RLS de equipos/partidos en vez de
-- saltársela.
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

-- GOLEADORES
create view v_goleadores with (security_invoker = true) as
select j.id as jugador_id, j.nombre as name, e.nombre as team, coalesce(sum(g.cantidad), 0) as goals
from jugadores j
join equipos e on e.id = j.equipo_id
join temporadas t on t.id = e.temporada_id and t.activa
left join goles g on g.jugador_id = j.id
group by j.id, j.nombre, e.nombre
having coalesce(sum(g.cantidad), 0) > 0
order by goals desc;

-- PRÓXIMOS PARTIDOS (con nombres de equipo ya resueltos)
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

-- ============================================================
-- ROW LEVEL SECURITY
-- Lectura pública para todo lo que se muestra en el sitio.
-- Escritura SOLO desde las rutas app/api/*, que usan la
-- service_role key (esa se salta RLS por diseño) — por eso no
-- hace falta ninguna política de INSERT/UPDATE/DELETE acá.
--
-- En equipos/jugadores/partidos, además, el rol "anon" (visitante
-- público sin sesión) solo puede LEER las columnas que el sitio
-- realmente muestra — no teléfono/email/delegado de equipos, ni
-- fecha de nacimiento de jugadores, ni informe/incidencias del
-- árbitro. El panel admin corre como rol "authenticated" (no hay
-- registro público, así que "authenticated" = los administradores)
-- y sí ve todas las columnas, porque las necesita para editar.
-- ============================================================
alter table temporadas enable row level security;
alter table equipos enable row level security;
alter table jugadores enable row level security;
alter table partidos enable row level security;
alter table goles enable row level security;
alter table imagenes enable row level security;
alter table contenido_paginas enable row level security;

-- Sin columnas sensibles (solo nombre y si está activa) — lectura
-- pública total. Además, las 3 vistas de arriba necesitan que "anon"
-- pueda leerla, porque el join a "temporadas" corre con los
-- privilegios de quien consulta (security_invoker).
create policy "lectura publica" on temporadas for select using (true);

create policy "lectura publica" on equipos for select to anon, authenticated using (true);
revoke select on equipos from anon;
grant select (id, temporada_id, nombre, ciudad, color, logo_url, creado_en) on equipos to anon;
grant select on equipos to authenticated;

create policy "lectura publica" on jugadores for select to anon, authenticated using (true);
revoke select on jugadores from anon;
grant select (id, nombre, equipo_id, numero, posicion, foto_url, creado_en) on jugadores to anon;
grant select on jugadores to authenticated;

create policy "lectura publica" on partidos for select to anon, authenticated using (true);
revoke select on partidos from anon;
grant select (
  id, temporada_id, jornada, fecha, hora, cancha, equipo_local_id, equipo_visitante_id,
  goles_local, goles_visitante, estado, creado_en
) on partidos to anon;
grant select on partidos to authenticated;

-- goles, imagenes y contenido_paginas no tienen columnas sensibles.
create policy "lectura publica" on goles for select using (true);
create policy "lectura publica" on imagenes for select using (true);
create policy "lectura publica" on contenido_paginas for select using (true);

-- Las vistas calculadas corren con los privilegios de quien las
-- consulta (security_invoker), así que si dependen de los grants de
-- arriba — confirmamos el acceso a las vistas en sí igual.
grant select on v_posiciones to anon, authenticated;
grant select on v_goleadores to anon, authenticated;
grant select on v_proximos_partidos to anon, authenticated;
grant select on temporadas to anon, authenticated;

-- ============================================================
-- STORAGE — bucket público para las fotos de la galería
-- ============================================================
insert into storage.buckets (id, name, public)
values ('fotos-torneo', 'fotos-torneo', true)
on conflict (id) do nothing;

-- No hace falta una policy de SELECT acá: el bucket es público, así que
-- las URLs públicas (/storage/v1/object/public/...) ya funcionan sin
-- ninguna policy de RLS. Agregar una de "using (true)" solo habilitaría
-- que cualquiera liste/enumere todos los archivos del bucket vía la API
-- de Storage (list()), que no hace falta para servir fotos por URL.

-- ============================================================
-- Filas iniciales de contenido_paginas, para que el admin tenga
-- algo que editar desde el primer momento.
-- ============================================================
insert into contenido_paginas (clave, titulo, contenido) values
  ('requisitos', 'Requisitos para participar', 'Editá este texto desde el panel admin → Reglamento.'),
  ('reglamento', 'Reglamento del torneo', 'Editá este texto desde el panel admin → Reglamento.')
on conflict (clave) do nothing;

-- ============================================================
-- Temporada inicial, activa por defecto — para que equipos/partidos
-- tengan dónde colgarse desde el primer momento. Podés renombrarla
-- desde Admin → Temporadas.
-- ============================================================
insert into temporadas (nombre, activa) values ('Temporada actual', true)
on conflict (nombre) do nothing;

-- ============================================================
-- DATOS DE EJEMPLO (opcional) — comentado.
-- Si querés arrancar con los mismos 16 equipos de prueba que ya
-- tenía el sitio, pedime y te genero los INSERT a partir de
-- data/teams.js, data/players.js, data/fixtures.js.
-- ============================================================
