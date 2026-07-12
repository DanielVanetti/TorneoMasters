-- ============================================================
-- SEED CHICO PARA PROBAR EL CAMBIO DE TEMPORADA ACTIVA
-- Torneo Máster Santa Cruz
--
-- Crea una SEGUNDA temporada ("Temporada 2025 (archivada)"), separada
-- de la que carga supabase/seed-prueba.sql ("Temporada 2026"), con
-- muy pocos datos (4 equipos, 3 jugadores cada uno, 2 partidos
-- jugados) — lo mínimo para poder verificar en el admin
-- (Admin → Temporadas → "Marcar como activa") que:
--
--   1. el sitio público y el resto del panel cambian a mostrar SOLO
--      los datos de la temporada que se acaba de activar,
--   2. los datos de la otra temporada siguen intactos en la base
--      (no se borra nada, solo deja de ser la "activa"),
--   3. un mismo nombre de equipo puede repetirse entre temporadas sin
--      chocar — por eso "Sabaneros FC" aparece acá también, a
--      propósito, con un plantel totalmente distinto al de
--      seed-prueba.sql.
--
-- Corré esto DESPUÉS de seed-prueba.sql (asume que "Temporada 2026"
-- ya existe y está activa). Al terminar, "Temporada 2026" sigue
-- siendo la activa — para probar el cambio, hacelo desde
-- Admin → Temporadas, no corriendo SQL.
--
-- Para borrar SOLO esta temporada de prueba más adelante: Admin →
-- Temporadas → Eliminar (falla con un mensaje claro si está activa o
-- si le queda algo cargado que no sea de estas 4 tablas).
-- ============================================================

insert into temporadas (nombre, activa) values ('Temporada 2025 (archivada)', false)
on conflict (nombre) do nothing;

-- ------------------------------------------------------------
-- EQUIPOS (4)
-- ------------------------------------------------------------
insert into equipos (nombre, ciudad, color, temporada_id)
select v.nombre, v.ciudad, v.color, (select id from temporadas where nombre = 'Temporada 2025 (archivada)')
from (values
  ('Sabaneros FC', 'Santa Cruz', '#0E5C6B'),
  ('Deportivo Viejo Sur', 'Nicoya', '#C97B2E'),
  ('Costa Unida', 'Tamarindo', '#D9A62E'),
  ('Nicoya Antiguo', 'Nicoya', '#2F7D4F')
) as v(nombre, ciudad, color)
on conflict (nombre, temporada_id) do nothing;

-- ------------------------------------------------------------
-- JUGADORES (3 por equipo)
-- ------------------------------------------------------------
insert into jugadores (nombre, equipo_id, numero, posicion)
select v.nombre, e.id, v.numero, v.posicion
from (values
  ('Sabaneros FC','Mario Quesada',1,'Portero'),
  ('Sabaneros FC','Luis Barrantes',5,'Defensa'),
  ('Sabaneros FC','Kevin Aguilar',9,'Delantero'),

  ('Deportivo Viejo Sur','Esteban Rojas',1,'Portero'),
  ('Deportivo Viejo Sur','Warner Solís',4,'Defensa'),
  ('Deportivo Viejo Sur','Diego Fallas',10,'Delantero'),

  ('Costa Unida','Pablo Mena',1,'Portero'),
  ('Costa Unida','Jonathan Vega',6,'Defensa'),
  ('Costa Unida','Randall Ureña',11,'Delantero'),

  ('Nicoya Antiguo','Sergio Blanco',1,'Portero'),
  ('Nicoya Antiguo','Andrés Miranda',3,'Defensa'),
  ('Nicoya Antiguo','Marvin Cordero',7,'Delantero')
) as v(equipo, nombre, numero, posicion)
join equipos e on e.nombre = v.equipo and e.temporada_id = (select id from temporadas where nombre = 'Temporada 2025 (archivada)');

-- ------------------------------------------------------------
-- PARTIDOS (2, ya jugados)
-- ------------------------------------------------------------
insert into partidos (temporada_id, jornada, fecha, hora, cancha, equipo_local_id, equipo_visitante_id, estado, goles_local, goles_visitante)
select (select id from temporadas where nombre = 'Temporada 2025 (archivada)'), v.jornada, current_date + (v.dias_offset || ' days')::interval, v.hora::time, v.cancha,
       el.id, ev.id, v.estado, v.gl, v.gv
from (values
  (1,-200,'15:00','Cancha Municipal Santa Cruz','Sabaneros FC','Costa Unida','Jugado',2,1),
  (1,-200,'16:30','Cancha Nicoya','Deportivo Viejo Sur','Nicoya Antiguo','Jugado',1,1)
) as v(jornada, dias_offset, hora, cancha, local, visitante, estado, gl, gv)
join equipos el on el.nombre = v.local and el.temporada_id = (select id from temporadas where nombre = 'Temporada 2025 (archivada)')
join equipos ev on ev.nombre = v.visitante and ev.temporada_id = (select id from temporadas where nombre = 'Temporada 2025 (archivada)');

-- ------------------------------------------------------------
-- GOLES
-- ------------------------------------------------------------
insert into goles (partido_id, jugador_id, cantidad)
select p.id, j.id, v.cantidad
from (values
  (1,'Sabaneros FC','Costa Unida','Sabaneros FC','Kevin Aguilar',2),
  (1,'Sabaneros FC','Costa Unida','Costa Unida','Randall Ureña',1),
  (1,'Deportivo Viejo Sur','Nicoya Antiguo','Deportivo Viejo Sur','Diego Fallas',1),
  (1,'Deportivo Viejo Sur','Nicoya Antiguo','Nicoya Antiguo','Marvin Cordero',1)
) as v(jornada, local, visitante, equipo_jugador, jugador, cantidad)
join partidos p
  on p.jornada = v.jornada
 and p.temporada_id = (select id from temporadas where nombre = 'Temporada 2025 (archivada)')
 and p.equipo_local_id = (select id from equipos where nombre = v.local and temporada_id = (select id from temporadas where nombre = 'Temporada 2025 (archivada)'))
 and p.equipo_visitante_id = (select id from equipos where nombre = v.visitante and temporada_id = (select id from temporadas where nombre = 'Temporada 2025 (archivada)'))
join equipos e on e.nombre = v.equipo_jugador and e.temporada_id = (select id from temporadas where nombre = 'Temporada 2025 (archivada)')
join jugadores j on j.nombre = v.jugador and j.equipo_id = e.id;
