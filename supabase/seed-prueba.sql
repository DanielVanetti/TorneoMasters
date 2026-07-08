-- ============================================================
-- SEEDER DE PRUEBA — Torneo Máster Santa Cruz
-- Carga 16 equipos, 80 jugadores, 3 jornadas ya jugadas (con
-- goleadores) y 1 jornada programada, para poder ver TODO el sitio
-- funcionando (posiciones, goleadores, calendario, planteles) antes
-- de que el admin cargue datos reales.
--
-- Corré este archivo entero en: Supabase → SQL Editor → New query → Run.
-- Pensado para correr sobre una base vacía (después de schema.sql).
--
-- Para borrar estos datos de prueba más adelante (sin tocar fotos
-- de la galería ni el texto del reglamento), descomentá y corré
-- primero el bloque de LIMPIEZA de abajo.
-- ============================================================

-- ---- LIMPIEZA (opcional) ----
-- delete from goles;
-- delete from partidos;
-- delete from jugadores;
-- delete from equipos;

-- ------------------------------------------------------------
-- EQUIPOS
-- ------------------------------------------------------------
insert into equipos (nombre, ciudad, color) values
  ('Sabaneros FC', 'Santa Cruz', '#0E5C6B'),
  ('Deportivo Santa Cruz Viejo', 'Santa Cruz', '#C97B2E'),
  ('Tamarindo Costero', 'Tamarindo', '#D9A62E'),
  ('Playa Grande FC', 'Playa Grande', '#2F7D4F'),
  ('Liga Nicoya Máster', 'Nicoya', '#A6452B'),
  ('Filadelfia Viejo', 'Filadelfia', '#1B3A5C'),
  ('Guanacaste Unido', 'Santa Cruz', '#6B7A3A'),
  ('Atlético Guaitil', 'Guaitil', '#B08D57'),
  ('Deportivo Junquillal', 'Junquillal', '#0E5C6B'),
  ('27 de Abril FC', '27 de Abril', '#C97B2E'),
  ('Diriá FC', 'Diriá', '#D9A62E'),
  ('Deportivo Ortega', 'Ortega', '#2F7D4F'),
  ('Bagatzí Fútbol Club', 'Bagatzí', '#A6452B'),
  ('Santa Bárbara Viejo', 'Santa Bárbara', '#1B3A5C'),
  ('Cartagena Máster', 'Cartagena', '#6B7A3A'),
  ('Cuajiniquil United', 'Cuajiniquil', '#B08D57')
on conflict (nombre) do nothing;

-- ------------------------------------------------------------
-- JUGADORES (5 por equipo: portero, 2 defensas, mediocampo, delantero)
-- ------------------------------------------------------------
insert into jugadores (nombre, equipo_id, numero, posicion)
select v.nombre, e.id, v.numero, v.posicion
from (values
  ('Sabaneros FC','Jorge Jiménez',49,'Portero'),
  ('Sabaneros FC','Fernando Salazar',25,'Defensa'),
  ('Sabaneros FC','Danilo Campos',8,'Defensa'),
  ('Sabaneros FC','Álvaro Obando',41,'Mediocampo'),
  ('Sabaneros FC','José Villalobos',66,'Delantero'),

  ('Deportivo Santa Cruz Viejo','Rodrigo Rojas',24,'Portero'),
  ('Deportivo Santa Cruz Viejo','Marco Rojas',56,'Defensa'),
  ('Deportivo Santa Cruz Viejo','Alexis Elizondo',5,'Defensa'),
  ('Deportivo Santa Cruz Viejo','Fernando Elizondo',12,'Mediocampo'),
  ('Deportivo Santa Cruz Viejo','Roberto Campos',19,'Delantero'),

  ('Tamarindo Costero','Álvaro Rojas',67,'Portero'),
  ('Tamarindo Costero','Fernando Vargas',98,'Defensa'),
  ('Tamarindo Costero','Óscar Rojas',55,'Defensa'),
  ('Tamarindo Costero','Óscar Alvarado',77,'Mediocampo'),
  ('Tamarindo Costero','Alexis Vargas',8,'Delantero'),

  ('Playa Grande FC','Fernando Vargas',88,'Portero'),
  ('Playa Grande FC','Roberto Obando',60,'Defensa'),
  ('Playa Grande FC','Miguel Vargas',65,'Defensa'),
  ('Playa Grande FC','Luis Solano',45,'Mediocampo'),
  ('Playa Grande FC','Édgar Guevara',41,'Delantero'),

  ('Liga Nicoya Máster','Óscar Bolaños',95,'Portero'),
  ('Liga Nicoya Máster','Roberto Marín',50,'Defensa'),
  ('Liga Nicoya Máster','Roberto Chaves',45,'Defensa'),
  ('Liga Nicoya Máster','Wilberth Jiménez',24,'Mediocampo'),
  ('Liga Nicoya Máster','Minor Araya',27,'Delantero'),

  ('Filadelfia Viejo','Alexis Araya',96,'Portero'),
  ('Filadelfia Viejo','Rodrigo Campos',74,'Defensa'),
  ('Filadelfia Viejo','Óscar Alvarado',3,'Defensa'),
  ('Filadelfia Viejo','Mario Quesada',22,'Mediocampo'),
  ('Filadelfia Viejo','Ricardo Elizondo',73,'Delantero'),

  ('Guanacaste Unido','Óscar Campos',1,'Portero'),
  ('Guanacaste Unido','Luis Elizondo',44,'Defensa'),
  ('Guanacaste Unido','Danilo Campos',46,'Defensa'),
  ('Guanacaste Unido','Miguel Obando',47,'Mediocampo'),
  ('Guanacaste Unido','Ricardo Solano',89,'Delantero'),

  ('Atlético Guaitil','Édgar Quesada',16,'Portero'),
  ('Atlético Guaitil','Danilo Vargas',66,'Defensa'),
  ('Atlético Guaitil','Rafael Solano',83,'Defensa'),
  ('Atlético Guaitil','Carlos Salazar',9,'Mediocampo'),
  ('Atlético Guaitil','Miguel Villalobos',84,'Delantero'),

  ('Deportivo Junquillal','Ricardo Villalobos',6,'Portero'),
  ('Deportivo Junquillal','Óscar Vargas',7,'Defensa'),
  ('Deportivo Junquillal','Minor Jiménez',30,'Defensa'),
  ('Deportivo Junquillal','Carlos Guevara',17,'Mediocampo'),
  ('Deportivo Junquillal','Roberto Jiménez',9,'Delantero'),

  ('27 de Abril FC','Roberto Solano',48,'Portero'),
  ('27 de Abril FC','Fernando Zúñiga',75,'Defensa'),
  ('27 de Abril FC','Alexis Zúñiga',34,'Defensa'),
  ('27 de Abril FC','Ricardo Alvarado',64,'Mediocampo'),
  ('27 de Abril FC','Sergio Cascante',8,'Delantero'),

  ('Diriá FC','Rafael Mora',7,'Portero'),
  ('Diriá FC','Ronald Bolaños',3,'Defensa'),
  ('Diriá FC','Gerardo Castillo',38,'Defensa'),
  ('Diriá FC','Roberto Jiménez',53,'Mediocampo'),
  ('Diriá FC','Rodrigo Villalobos',89,'Delantero'),

  ('Deportivo Ortega','Rodrigo Villalobos',90,'Portero'),
  ('Deportivo Ortega','Sergio Bolaños',96,'Defensa'),
  ('Deportivo Ortega','Édgar Obando',50,'Defensa'),
  ('Deportivo Ortega','Gerardo Elizondo',91,'Mediocampo'),
  ('Deportivo Ortega','Freddy Bolaños',63,'Delantero'),

  ('Bagatzí Fútbol Club','Randall Campos',8,'Portero'),
  ('Bagatzí Fútbol Club','Mario Obando',65,'Defensa'),
  ('Bagatzí Fútbol Club','Marco Bolaños',78,'Defensa'),
  ('Bagatzí Fútbol Club','Wilberth Cascante',88,'Mediocampo'),
  ('Bagatzí Fútbol Club','Fernando Elizondo',37,'Delantero'),

  ('Santa Bárbara Viejo','Miguel Quesada',66,'Portero'),
  ('Santa Bárbara Viejo','Manuel Salazar',17,'Defensa'),
  ('Santa Bárbara Viejo','Carlos Elizondo',32,'Defensa'),
  ('Santa Bárbara Viejo','Carlos Alvarado',51,'Mediocampo'),
  ('Santa Bárbara Viejo','Rodrigo Vargas',19,'Delantero'),

  ('Cartagena Máster','Álvaro Castillo',74,'Portero'),
  ('Cartagena Máster','Mario Marín',60,'Defensa'),
  ('Cartagena Máster','Óscar Bolaños',18,'Defensa'),
  ('Cartagena Máster','Jorge Cascante',89,'Mediocampo'),
  ('Cartagena Máster','Marco Chaves',17,'Delantero'),

  ('Cuajiniquil United','Marco Mora',40,'Portero'),
  ('Cuajiniquil United','José Zúñiga',3,'Defensa'),
  ('Cuajiniquil United','Gerardo Castillo',46,'Defensa'),
  ('Cuajiniquil United','Roberto Vargas',11,'Mediocampo'),
  ('Cuajiniquil United','Carlos Jiménez',39,'Delantero')
) as v(equipo, nombre, numero, posicion)
join equipos e on e.nombre = v.equipo;

-- ------------------------------------------------------------
-- PARTIDOS — jornadas 1 a 3 jugadas, jornada 4 programada
-- (fechas relativas a hoy, para que siempre se vea "vigente")
-- ------------------------------------------------------------
insert into partidos (jornada, fecha, hora, cancha, equipo_local_id, equipo_visitante_id, estado, goles_local, goles_visitante)
select v.jornada, current_date + (v.dias_offset || ' days')::interval, v.hora::time, v.cancha,
       el.id, ev.id, v.estado, v.gl, v.gv
from (values
  -- Jornada 1 (hace 3 semanas)
  (1,-21,'15:00','Cancha Municipal Santa Cruz','Sabaneros FC','Cuajiniquil United','Jugado',3,0),
  (1,-21,'15:00','Cancha Diriá','Deportivo Santa Cruz Viejo','Cartagena Máster','Jugado',2,1),
  (1,-21,'16:30','Cancha Tamarindo','Tamarindo Costero','Santa Bárbara Viejo','Jugado',2,0),
  (1,-21,'16:30','Cancha Guaitil','Playa Grande FC','Bagatzí Fútbol Club','Jugado',1,1),
  (1,-21,'09:00','Cancha Junquillal','Liga Nicoya Máster','Deportivo Ortega','Jugado',2,1),
  (1,-21,'09:00','Cancha Filadelfia','Filadelfia Viejo','Diriá FC','Jugado',1,0),
  (1,-21,'10:30','Cancha 27 de Abril','Guanacaste Unido','27 de Abril FC','Jugado',2,2),
  (1,-21,'10:30','Cancha Ortega','Atlético Guaitil','Deportivo Junquillal','Jugado',1,0),

  -- Jornada 2 (hace 2 semanas)
  (2,-14,'15:00','Cancha Municipal Santa Cruz','Sabaneros FC','Deportivo Santa Cruz Viejo','Jugado',2,1),
  (2,-14,'16:30','Cancha Tamarindo','Tamarindo Costero','Playa Grande FC','Jugado',3,1),
  (2,-14,'09:00','Cancha Junquillal','Liga Nicoya Máster','Filadelfia Viejo','Jugado',1,1),
  (2,-14,'10:30','Cancha 27 de Abril','Guanacaste Unido','Atlético Guaitil','Jugado',0,1),
  (2,-14,'15:00','Cancha Ortega','Deportivo Junquillal','27 de Abril FC','Jugado',2,0),
  (2,-14,'16:30','Cancha Diriá','Diriá FC','Deportivo Ortega','Jugado',1,2),
  (2,-14,'09:00','Cancha Guaitil','Bagatzí Fútbol Club','Santa Bárbara Viejo','Jugado',1,1),
  (2,-14,'10:30','Cancha Filadelfia','Cartagena Máster','Cuajiniquil United','Jugado',0,2),

  -- Jornada 3 (hace 1 semana)
  (3,-7,'15:00','Cancha Municipal Santa Cruz','Sabaneros FC','Tamarindo Costero','Jugado',4,1),
  (3,-7,'16:30','Cancha Diriá','Deportivo Santa Cruz Viejo','Playa Grande FC','Jugado',2,2),
  (3,-7,'09:00','Cancha Junquillal','Liga Nicoya Máster','Guanacaste Unido','Jugado',2,0),
  (3,-7,'10:30','Cancha Filadelfia','Filadelfia Viejo','Atlético Guaitil','Jugado',1,1),
  (3,-7,'15:00','Cancha Ortega','Deportivo Junquillal','Diriá FC','Jugado',1,2),
  (3,-7,'16:30','Cancha 27 de Abril','27 de Abril FC','Deportivo Ortega','Jugado',2,1),
  (3,-7,'09:00','Cancha Guaitil','Bagatzí Fútbol Club','Cartagena Máster','Jugado',0,3),
  (3,-7,'10:30','Cancha Tamarindo','Santa Bárbara Viejo','Cuajiniquil United','Jugado',1,1),

  -- Jornada 4 (en 1 semana, sin jugar todavía)
  (4,7,'15:00','Cancha Municipal Santa Cruz','Sabaneros FC','Playa Grande FC','Programado',null,null),
  (4,7,'16:30','Cancha Diriá','Deportivo Santa Cruz Viejo','Tamarindo Costero','Programado',null,null),
  (4,7,'09:00','Cancha Junquillal','Liga Nicoya Máster','Atlético Guaitil','Programado',null,null),
  (4,7,'10:30','Cancha Filadelfia','Filadelfia Viejo','Guanacaste Unido','Programado',null,null),
  (4,7,'15:00','Cancha Ortega','Deportivo Junquillal','Deportivo Ortega','Programado',null,null),
  (4,7,'16:30','Cancha 27 de Abril','27 de Abril FC','Diriá FC','Programado',null,null),
  (4,7,'09:00','Cancha Guaitil','Bagatzí Fútbol Club','Cuajiniquil United','Programado',null,null),
  (4,7,'10:30','Cancha Tamarindo','Santa Bárbara Viejo','Cartagena Máster','Programado',null,null)
) as v(jornada, dias_offset, hora, cancha, local, visitante, estado, gl, gv)
join equipos el on el.nombre = v.local
join equipos ev on ev.nombre = v.visitante;

-- ------------------------------------------------------------
-- GOLES — alimenta la tabla de goleadores, consistente con el
-- marcador de cada partido de arriba.
-- ------------------------------------------------------------
insert into goles (partido_id, jugador_id, cantidad)
select p.id, j.id, v.cantidad
from (values
  -- Jornada 1
  (1,'Sabaneros FC','Cuajiniquil United','Sabaneros FC','José Villalobos',2),
  (1,'Sabaneros FC','Cuajiniquil United','Sabaneros FC','Álvaro Obando',1),
  (1,'Deportivo Santa Cruz Viejo','Cartagena Máster','Deportivo Santa Cruz Viejo','Roberto Campos',2),
  (1,'Deportivo Santa Cruz Viejo','Cartagena Máster','Cartagena Máster','Marco Chaves',1),
  (1,'Tamarindo Costero','Santa Bárbara Viejo','Tamarindo Costero','Alexis Vargas',2),
  (1,'Playa Grande FC','Bagatzí Fútbol Club','Playa Grande FC','Édgar Guevara',1),
  (1,'Playa Grande FC','Bagatzí Fútbol Club','Bagatzí Fútbol Club','Fernando Elizondo',1),
  (1,'Liga Nicoya Máster','Deportivo Ortega','Liga Nicoya Máster','Minor Araya',2),
  (1,'Liga Nicoya Máster','Deportivo Ortega','Deportivo Ortega','Freddy Bolaños',1),
  (1,'Filadelfia Viejo','Diriá FC','Filadelfia Viejo','Ricardo Elizondo',1),
  (1,'Guanacaste Unido','27 de Abril FC','Guanacaste Unido','Ricardo Solano',2),
  (1,'Guanacaste Unido','27 de Abril FC','27 de Abril FC','Sergio Cascante',2),
  (1,'Atlético Guaitil','Deportivo Junquillal','Atlético Guaitil','Miguel Villalobos',1),

  -- Jornada 2
  (2,'Sabaneros FC','Deportivo Santa Cruz Viejo','Sabaneros FC','José Villalobos',2),
  (2,'Sabaneros FC','Deportivo Santa Cruz Viejo','Deportivo Santa Cruz Viejo','Roberto Campos',1),
  (2,'Tamarindo Costero','Playa Grande FC','Tamarindo Costero','Alexis Vargas',2),
  (2,'Tamarindo Costero','Playa Grande FC','Tamarindo Costero','Óscar Alvarado',1),
  (2,'Tamarindo Costero','Playa Grande FC','Playa Grande FC','Édgar Guevara',1),
  (2,'Liga Nicoya Máster','Filadelfia Viejo','Liga Nicoya Máster','Minor Araya',1),
  (2,'Liga Nicoya Máster','Filadelfia Viejo','Filadelfia Viejo','Ricardo Elizondo',1),
  (2,'Guanacaste Unido','Atlético Guaitil','Atlético Guaitil','Miguel Villalobos',1),
  (2,'Deportivo Junquillal','27 de Abril FC','Deportivo Junquillal','Roberto Jiménez',2),
  (2,'Diriá FC','Deportivo Ortega','Diriá FC','Rodrigo Villalobos',1),
  (2,'Diriá FC','Deportivo Ortega','Deportivo Ortega','Freddy Bolaños',2),
  (2,'Bagatzí Fútbol Club','Santa Bárbara Viejo','Bagatzí Fútbol Club','Fernando Elizondo',1),
  (2,'Bagatzí Fútbol Club','Santa Bárbara Viejo','Santa Bárbara Viejo','Rodrigo Vargas',1),
  (2,'Cartagena Máster','Cuajiniquil United','Cuajiniquil United','Carlos Jiménez',2),

  -- Jornada 3
  (3,'Sabaneros FC','Tamarindo Costero','Sabaneros FC','José Villalobos',3),
  (3,'Sabaneros FC','Tamarindo Costero','Sabaneros FC','Álvaro Obando',1),
  (3,'Sabaneros FC','Tamarindo Costero','Tamarindo Costero','Alexis Vargas',1),
  (3,'Deportivo Santa Cruz Viejo','Playa Grande FC','Deportivo Santa Cruz Viejo','Roberto Campos',2),
  (3,'Deportivo Santa Cruz Viejo','Playa Grande FC','Playa Grande FC','Édgar Guevara',2),
  (3,'Liga Nicoya Máster','Guanacaste Unido','Liga Nicoya Máster','Minor Araya',2),
  (3,'Filadelfia Viejo','Atlético Guaitil','Filadelfia Viejo','Ricardo Elizondo',1),
  (3,'Filadelfia Viejo','Atlético Guaitil','Atlético Guaitil','Miguel Villalobos',1),
  (3,'Deportivo Junquillal','Diriá FC','Deportivo Junquillal','Roberto Jiménez',1),
  (3,'Deportivo Junquillal','Diriá FC','Diriá FC','Rodrigo Villalobos',2),
  (3,'27 de Abril FC','Deportivo Ortega','27 de Abril FC','Sergio Cascante',2),
  (3,'27 de Abril FC','Deportivo Ortega','Deportivo Ortega','Freddy Bolaños',1),
  (3,'Bagatzí Fútbol Club','Cartagena Máster','Cartagena Máster','Marco Chaves',2),
  (3,'Bagatzí Fútbol Club','Cartagena Máster','Cartagena Máster','Jorge Cascante',1),
  (3,'Santa Bárbara Viejo','Cuajiniquil United','Santa Bárbara Viejo','Rodrigo Vargas',1),
  (3,'Santa Bárbara Viejo','Cuajiniquil United','Cuajiniquil United','Carlos Jiménez',1)
) as v(jornada, local, visitante, equipo_jugador, jugador, cantidad)
join partidos p
  on p.jornada = v.jornada
 and p.equipo_local_id = (select id from equipos where nombre = v.local)
 and p.equipo_visitante_id = (select id from equipos where nombre = v.visitante)
join equipos e on e.nombre = v.equipo_jugador
join jugadores j on j.nombre = v.jugador and j.equipo_id = e.id;
