-- ============================================================
-- SEEDER DE PRUEBA — Torneo Máster Santa Cruz
-- Carga 16 equipos, 240 jugadores (15 por equipo: plantel completo
-- de categoría Máster), 3 jornadas ya jugadas (con goleadores) y
-- 1 jornada programada, para poder ver TODO el sitio funcionando
-- (posiciones, goleadores, calendario, planteles) antes de que el
-- admin cargue datos reales.
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
-- TEMPORADA — todo lo de este seed cuelga de esta, y queda activa.
-- ------------------------------------------------------------
insert into temporadas (nombre, activa) values ('Temporada 2026', true)
on conflict (nombre) do nothing;

-- ------------------------------------------------------------
-- EQUIPOS
-- ------------------------------------------------------------
insert into equipos (nombre, ciudad, color, temporada_id)
select v.nombre, v.ciudad, v.color, (select id from temporadas where nombre = 'Temporada 2026')
from (values
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
) as v(nombre, ciudad, color)
on conflict (nombre, temporada_id) do nothing;

-- ------------------------------------------------------------
-- JUGADORES (15 por equipo: 2 porteros, 5 defensas, 5 mediocampistas,
-- 3 delanteros — plantel completo de categoría Máster)
-- ------------------------------------------------------------
insert into jugadores (nombre, equipo_id, numero, posicion)
select v.nombre, e.id, v.numero, v.posicion
from (values
  ('Sabaneros FC','Jorge Jiménez',49,'Portero'),
  ('Sabaneros FC','Fernando Salazar',25,'Defensa'),
  ('Sabaneros FC','Danilo Campos',8,'Defensa'),
  ('Sabaneros FC','Álvaro Obando',41,'Mediocampo'),
  ('Sabaneros FC','José Villalobos',66,'Delantero'),

  ('Sabaneros FC','Manuel Solano',77,'Portero'),
  ('Sabaneros FC','Danilo Pizarro',60,'Defensa'),
  ('Sabaneros FC','Roberto Obando',95,'Defensa'),
  ('Sabaneros FC','Fernando Chaves',79,'Defensa'),
  ('Sabaneros FC','Jorge Zúñiga',93,'Mediocampo'),
  ('Sabaneros FC','Geovanny Delgado',51,'Mediocampo'),
  ('Sabaneros FC','Freddy Jiménez',68,'Mediocampo'),
  ('Sabaneros FC','Norman Zúñiga',54,'Mediocampo'),
  ('Sabaneros FC','Sergio Cascante',13,'Delantero'),
  ('Sabaneros FC','Alexis Quesada',32,'Delantero'),

  ('Deportivo Santa Cruz Viejo','Rodrigo Rojas',24,'Portero'),
  ('Deportivo Santa Cruz Viejo','Marco Rojas',56,'Defensa'),
  ('Deportivo Santa Cruz Viejo','Alexis Elizondo',5,'Defensa'),
  ('Deportivo Santa Cruz Viejo','Fernando Elizondo',12,'Mediocampo'),
  ('Deportivo Santa Cruz Viejo','Roberto Campos',19,'Delantero'),

  ('Deportivo Santa Cruz Viejo','Randall Solano',17,'Portero'),
  ('Deportivo Santa Cruz Viejo','Norman Chaves',70,'Defensa'),
  ('Deportivo Santa Cruz Viejo','Jorge Cascante',91,'Defensa'),
  ('Deportivo Santa Cruz Viejo','Adrián Cascante',75,'Defensa'),
  ('Deportivo Santa Cruz Viejo','Fernando Rojas',67,'Mediocampo'),
  ('Deportivo Santa Cruz Viejo','Randall Rojas',37,'Mediocampo'),
  ('Deportivo Santa Cruz Viejo','Mario Cascante',52,'Mediocampo'),
  ('Deportivo Santa Cruz Viejo','Jorge Marín',89,'Mediocampo'),
  ('Deportivo Santa Cruz Viejo','Roberto Barquero',90,'Delantero'),
  ('Deportivo Santa Cruz Viejo','Ricardo Delgado',68,'Delantero'),

  ('Tamarindo Costero','Álvaro Rojas',67,'Portero'),
  ('Tamarindo Costero','Fernando Vargas',98,'Defensa'),
  ('Tamarindo Costero','Óscar Rojas',55,'Defensa'),
  ('Tamarindo Costero','Óscar Alvarado',77,'Mediocampo'),
  ('Tamarindo Costero','Alexis Vargas',8,'Delantero'),

  ('Tamarindo Costero','José Bolaños',62,'Portero'),
  ('Tamarindo Costero','Ricardo Guevara',33,'Defensa'),
  ('Tamarindo Costero','Fernando Corrales',96,'Defensa'),
  ('Tamarindo Costero','Miguel Araya',64,'Defensa'),
  ('Tamarindo Costero','Rodrigo Corrales',43,'Mediocampo'),
  ('Tamarindo Costero','Álvaro Jiménez',35,'Mediocampo'),
  ('Tamarindo Costero','Jorge Obando',3,'Mediocampo'),
  ('Tamarindo Costero','Danilo Quesada',59,'Mediocampo'),
  ('Tamarindo Costero','Luis Villalobos',26,'Delantero'),
  ('Tamarindo Costero','Marco Núñez',93,'Delantero'),

  ('Playa Grande FC','Fernando Vargas',88,'Portero'),
  ('Playa Grande FC','Roberto Obando',60,'Defensa'),
  ('Playa Grande FC','Miguel Vargas',65,'Defensa'),
  ('Playa Grande FC','Luis Solano',45,'Mediocampo'),
  ('Playa Grande FC','Édgar Guevara',41,'Delantero'),

  ('Playa Grande FC','Manuel Castillo',87,'Portero'),
  ('Playa Grande FC','Randall Delgado',66,'Defensa'),
  ('Playa Grande FC','Mario Marín',4,'Defensa'),
  ('Playa Grande FC','Manuel Obando',52,'Defensa'),
  ('Playa Grande FC','Ronald Mora',73,'Mediocampo'),
  ('Playa Grande FC','Rafael Araya',13,'Mediocampo'),
  ('Playa Grande FC','Manuel Baltodano',99,'Mediocampo'),
  ('Playa Grande FC','Wilberth Elizondo',64,'Mediocampo'),
  ('Playa Grande FC','Óscar Herra',17,'Delantero'),
  ('Playa Grande FC','Yeison Delgado',56,'Delantero'),

  ('Liga Nicoya Máster','Óscar Bolaños',95,'Portero'),
  ('Liga Nicoya Máster','Roberto Marín',50,'Defensa'),
  ('Liga Nicoya Máster','Roberto Chaves',45,'Defensa'),
  ('Liga Nicoya Máster','Wilberth Jiménez',24,'Mediocampo'),
  ('Liga Nicoya Máster','Minor Araya',27,'Delantero'),

  ('Liga Nicoya Máster','Mario Marín',31,'Portero'),
  ('Liga Nicoya Máster','Yeison Cascante',1,'Defensa'),
  ('Liga Nicoya Máster','Ronald Obando',74,'Defensa'),
  ('Liga Nicoya Máster','Ricardo Salazar',4,'Defensa'),
  ('Liga Nicoya Máster','Sergio Quesada',86,'Mediocampo'),
  ('Liga Nicoya Máster','Alexis Elizondo',41,'Mediocampo'),
  ('Liga Nicoya Máster','Alexis Guevara',72,'Mediocampo'),
  ('Liga Nicoya Máster','Danilo Sandí',78,'Mediocampo'),
  ('Liga Nicoya Máster','Manuel Sandí',88,'Delantero'),
  ('Liga Nicoya Máster','Miguel Jiménez',85,'Delantero'),

  ('Filadelfia Viejo','Alexis Araya',96,'Portero'),
  ('Filadelfia Viejo','Rodrigo Campos',74,'Defensa'),
  ('Filadelfia Viejo','Óscar Alvarado',3,'Defensa'),
  ('Filadelfia Viejo','Mario Quesada',22,'Mediocampo'),
  ('Filadelfia Viejo','Ricardo Elizondo',73,'Delantero'),

  ('Filadelfia Viejo','Sergio Herra',41,'Portero'),
  ('Filadelfia Viejo','Minor Rojas',27,'Defensa'),
  ('Filadelfia Viejo','Sergio Obando',84,'Defensa'),
  ('Filadelfia Viejo','Geovanny Baltodano',47,'Defensa'),
  ('Filadelfia Viejo','Geovanny Rojas',87,'Mediocampo'),
  ('Filadelfia Viejo','Manuel Solano',85,'Mediocampo'),
  ('Filadelfia Viejo','Sergio Pizarro',61,'Mediocampo'),
  ('Filadelfia Viejo','Jorge Zúñiga',64,'Mediocampo'),
  ('Filadelfia Viejo','Minor Mora',93,'Delantero'),
  ('Filadelfia Viejo','Minor Guevara',79,'Delantero'),

  ('Guanacaste Unido','Óscar Campos',1,'Portero'),
  ('Guanacaste Unido','Luis Elizondo',44,'Defensa'),
  ('Guanacaste Unido','Danilo Campos',46,'Defensa'),
  ('Guanacaste Unido','Miguel Obando',47,'Mediocampo'),
  ('Guanacaste Unido','Ricardo Solano',89,'Delantero'),

  ('Guanacaste Unido','Yeison Araya',63,'Portero'),
  ('Guanacaste Unido','Wilberth Campos',15,'Defensa'),
  ('Guanacaste Unido','Norman Castillo',70,'Defensa'),
  ('Guanacaste Unido','Roberto Alvarado',60,'Defensa'),
  ('Guanacaste Unido','Alexis Obando',71,'Mediocampo'),
  ('Guanacaste Unido','Ricardo Campos',25,'Mediocampo'),
  ('Guanacaste Unido','Geovanny Obando',27,'Mediocampo'),
  ('Guanacaste Unido','Geovanny Barquero',73,'Mediocampo'),
  ('Guanacaste Unido','Kenneth Salazar',37,'Delantero'),
  ('Guanacaste Unido','Álvaro Castillo',81,'Delantero'),

  ('Atlético Guaitil','Édgar Quesada',16,'Portero'),
  ('Atlético Guaitil','Danilo Vargas',66,'Defensa'),
  ('Atlético Guaitil','Rafael Solano',83,'Defensa'),
  ('Atlético Guaitil','Carlos Salazar',9,'Mediocampo'),
  ('Atlético Guaitil','Miguel Villalobos',84,'Delantero'),

  ('Atlético Guaitil','Sergio Pizarro',18,'Portero'),
  ('Atlético Guaitil','Norman Campos',36,'Defensa'),
  ('Atlético Guaitil','Fernando Solano',72,'Defensa'),
  ('Atlético Guaitil','Norman Obando',52,'Defensa'),
  ('Atlético Guaitil','Luis Núñez',63,'Mediocampo'),
  ('Atlético Guaitil','Sergio Quesada',59,'Mediocampo'),
  ('Atlético Guaitil','Kenneth Sandí',64,'Mediocampo'),
  ('Atlético Guaitil','Danilo Marín',49,'Mediocampo'),
  ('Atlético Guaitil','Rafael Jiménez',71,'Delantero'),
  ('Atlético Guaitil','Yeison Marín',37,'Delantero'),

  ('Deportivo Junquillal','Ricardo Villalobos',6,'Portero'),
  ('Deportivo Junquillal','Óscar Vargas',7,'Defensa'),
  ('Deportivo Junquillal','Minor Jiménez',30,'Defensa'),
  ('Deportivo Junquillal','Carlos Guevara',17,'Mediocampo'),
  ('Deportivo Junquillal','Roberto Jiménez',9,'Delantero'),

  ('Deportivo Junquillal','Ricardo Chaves',76,'Portero'),
  ('Deportivo Junquillal','Danilo Elizondo',56,'Defensa'),
  ('Deportivo Junquillal','Ronald Mora',29,'Defensa'),
  ('Deportivo Junquillal','Marco Cascante',58,'Defensa'),
  ('Deportivo Junquillal','Mario Baltodano',69,'Mediocampo'),
  ('Deportivo Junquillal','Mario Villalobos',13,'Mediocampo'),
  ('Deportivo Junquillal','Danilo Barquero',74,'Mediocampo'),
  ('Deportivo Junquillal','Óscar Delgado',77,'Mediocampo'),
  ('Deportivo Junquillal','Mario Quesada',83,'Delantero'),
  ('Deportivo Junquillal','Álvaro Marín',31,'Delantero'),

  ('27 de Abril FC','Roberto Solano',48,'Portero'),
  ('27 de Abril FC','Fernando Zúñiga',75,'Defensa'),
  ('27 de Abril FC','Alexis Zúñiga',34,'Defensa'),
  ('27 de Abril FC','Ricardo Alvarado',64,'Mediocampo'),
  ('27 de Abril FC','Sergio Cascante',8,'Delantero'),

  ('27 de Abril FC','Roberto Vargas',14,'Portero'),
  ('27 de Abril FC','Kenneth Delgado',86,'Defensa'),
  ('27 de Abril FC','Rodrigo Marín',57,'Defensa'),
  ('27 de Abril FC','Sergio Araya',52,'Defensa'),
  ('27 de Abril FC','Manuel Barquero',42,'Mediocampo'),
  ('27 de Abril FC','Danilo Delgado',78,'Mediocampo'),
  ('27 de Abril FC','Miguel Mora',18,'Mediocampo'),
  ('27 de Abril FC','José Vargas',95,'Mediocampo'),
  ('27 de Abril FC','Norman Sandí',58,'Delantero'),
  ('27 de Abril FC','Alexis Elizondo',11,'Delantero'),

  ('Diriá FC','Rafael Mora',7,'Portero'),
  ('Diriá FC','Ronald Bolaños',3,'Defensa'),
  ('Diriá FC','Gerardo Castillo',38,'Defensa'),
  ('Diriá FC','Roberto Jiménez',53,'Mediocampo'),
  ('Diriá FC','Rodrigo Villalobos',89,'Delantero'),

  ('Diriá FC','Gerardo Chaves',4,'Portero'),
  ('Diriá FC','Manuel Corrales',2,'Defensa'),
  ('Diriá FC','Miguel Chaves',79,'Defensa'),
  ('Diriá FC','Carlos Salazar',26,'Defensa'),
  ('Diriá FC','Sergio Zúñiga',29,'Mediocampo'),
  ('Diriá FC','Álvaro Solano',87,'Mediocampo'),
  ('Diriá FC','Manuel Obando',77,'Mediocampo'),
  ('Diriá FC','Ricardo Villalobos',92,'Mediocampo'),
  ('Diriá FC','Yeison Araya',63,'Delantero'),
  ('Diriá FC','Óscar Castillo',36,'Delantero'),

  ('Deportivo Ortega','Rodrigo Villalobos',90,'Portero'),
  ('Deportivo Ortega','Sergio Bolaños',96,'Defensa'),
  ('Deportivo Ortega','Édgar Obando',50,'Defensa'),
  ('Deportivo Ortega','Gerardo Elizondo',91,'Mediocampo'),
  ('Deportivo Ortega','Freddy Bolaños',63,'Delantero'),

  ('Deportivo Ortega','Álvaro Quesada',53,'Portero'),
  ('Deportivo Ortega','Kenneth Corrales',30,'Defensa'),
  ('Deportivo Ortega','Norman Herra',36,'Defensa'),
  ('Deportivo Ortega','Óscar Elizondo',15,'Defensa'),
  ('Deportivo Ortega','Gerardo Baltodano',97,'Mediocampo'),
  ('Deportivo Ortega','Kenneth Castillo',44,'Mediocampo'),
  ('Deportivo Ortega','Sergio Baltodano',39,'Mediocampo'),
  ('Deportivo Ortega','Rodrigo Chaves',1,'Mediocampo'),
  ('Deportivo Ortega','Jorge Salazar',3,'Delantero'),
  ('Deportivo Ortega','Óscar Jiménez',78,'Delantero'),

  ('Bagatzí Fútbol Club','Randall Campos',8,'Portero'),
  ('Bagatzí Fútbol Club','Mario Obando',65,'Defensa'),
  ('Bagatzí Fútbol Club','Marco Bolaños',78,'Defensa'),
  ('Bagatzí Fútbol Club','Wilberth Cascante',88,'Mediocampo'),
  ('Bagatzí Fútbol Club','Fernando Elizondo',37,'Delantero'),

  ('Bagatzí Fútbol Club','Alexis Herra',22,'Portero'),
  ('Bagatzí Fútbol Club','Luis Villalobos',39,'Defensa'),
  ('Bagatzí Fútbol Club','Fernando Núñez',60,'Defensa'),
  ('Bagatzí Fútbol Club','Jorge Rojas',18,'Defensa'),
  ('Bagatzí Fútbol Club','Óscar Quesada',87,'Mediocampo'),
  ('Bagatzí Fútbol Club','Miguel Quesada',47,'Mediocampo'),
  ('Bagatzí Fútbol Club','Fernando Bolaños',82,'Mediocampo'),
  ('Bagatzí Fútbol Club','Luis Salazar',69,'Mediocampo'),
  ('Bagatzí Fútbol Club','Geovanny Chaves',27,'Delantero'),
  ('Bagatzí Fútbol Club','José Chaves',53,'Delantero'),

  ('Santa Bárbara Viejo','Miguel Quesada',66,'Portero'),
  ('Santa Bárbara Viejo','Manuel Salazar',17,'Defensa'),
  ('Santa Bárbara Viejo','Carlos Elizondo',32,'Defensa'),
  ('Santa Bárbara Viejo','Carlos Alvarado',51,'Mediocampo'),
  ('Santa Bárbara Viejo','Rodrigo Vargas',19,'Delantero'),

  ('Santa Bárbara Viejo','Ronald Rojas',96,'Portero'),
  ('Santa Bárbara Viejo','Manuel Mora',40,'Defensa'),
  ('Santa Bárbara Viejo','Gerardo Marín',86,'Defensa'),
  ('Santa Bárbara Viejo','Ronald Corrales',79,'Defensa'),
  ('Santa Bárbara Viejo','Adrián Mora',27,'Mediocampo'),
  ('Santa Bárbara Viejo','Édgar Araya',45,'Mediocampo'),
  ('Santa Bárbara Viejo','Alexis Jiménez',61,'Mediocampo'),
  ('Santa Bárbara Viejo','Óscar Vargas',74,'Mediocampo'),
  ('Santa Bárbara Viejo','Sergio Núñez',39,'Delantero'),
  ('Santa Bárbara Viejo','Danilo Obando',36,'Delantero'),

  ('Cartagena Máster','Álvaro Castillo',74,'Portero'),
  ('Cartagena Máster','Mario Marín',60,'Defensa'),
  ('Cartagena Máster','Óscar Bolaños',18,'Defensa'),
  ('Cartagena Máster','Jorge Cascante',89,'Mediocampo'),
  ('Cartagena Máster','Marco Chaves',17,'Delantero'),

  ('Cartagena Máster','Carlos Zúñiga',58,'Portero'),
  ('Cartagena Máster','Randall Villalobos',93,'Defensa'),
  ('Cartagena Máster','Kenneth Castillo',21,'Defensa'),
  ('Cartagena Máster','Danilo Corrales',99,'Defensa'),
  ('Cartagena Máster','Rodrigo Salazar',34,'Mediocampo'),
  ('Cartagena Máster','Randall Araya',27,'Mediocampo'),
  ('Cartagena Máster','Ricardo Chaves',82,'Mediocampo'),
  ('Cartagena Máster','Alexis Corrales',86,'Mediocampo'),
  ('Cartagena Máster','Sergio Castillo',9,'Delantero'),
  ('Cartagena Máster','Miguel Jiménez',65,'Delantero'),

  ('Cuajiniquil United','Marco Mora',40,'Portero'),
  ('Cuajiniquil United','José Zúñiga',3,'Defensa'),
  ('Cuajiniquil United','Gerardo Castillo',46,'Defensa'),
  ('Cuajiniquil United','Roberto Vargas',11,'Mediocampo'),
  ('Cuajiniquil United','Carlos Jiménez',39,'Delantero'),

  ('Cuajiniquil United','Norman Rojas',23,'Portero'),
  ('Cuajiniquil United','Freddy Araya',31,'Defensa'),
  ('Cuajiniquil United','Norman Obando',94,'Defensa'),
  ('Cuajiniquil United','Ricardo Bolaños',34,'Defensa'),
  ('Cuajiniquil United','Adrián Rojas',42,'Mediocampo'),
  ('Cuajiniquil United','Óscar Salazar',43,'Mediocampo'),
  ('Cuajiniquil United','Édgar Salazar',59,'Mediocampo'),
  ('Cuajiniquil United','Norman Herra',52,'Mediocampo'),
  ('Cuajiniquil United','Yeison Castillo',47,'Delantero'),
  ('Cuajiniquil United','Geovanny Baltodano',49,'Delantero')
) as v(equipo, nombre, numero, posicion)
join equipos e on e.nombre = v.equipo and e.temporada_id = (select id from temporadas where nombre = 'Temporada 2026');

-- ------------------------------------------------------------
-- PARTIDOS — jornadas 1 a 3 jugadas, jornada 4 programada
-- (fechas relativas a hoy, para que siempre se vea "vigente")
-- ------------------------------------------------------------
insert into partidos (temporada_id, jornada, fecha, hora, cancha, equipo_local_id, equipo_visitante_id, estado, goles_local, goles_visitante)
select (select id from temporadas where nombre = 'Temporada 2026'), v.jornada, current_date + (v.dias_offset || ' days')::interval, v.hora::time, v.cancha,
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
join equipos el on el.nombre = v.local and el.temporada_id = (select id from temporadas where nombre = 'Temporada 2026')
join equipos ev on ev.nombre = v.visitante and ev.temporada_id = (select id from temporadas where nombre = 'Temporada 2026');

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
 and p.temporada_id = (select id from temporadas where nombre = 'Temporada 2026')
 and p.equipo_local_id = (select id from equipos where nombre = v.local and temporada_id = (select id from temporadas where nombre = 'Temporada 2026'))
 and p.equipo_visitante_id = (select id from equipos where nombre = v.visitante and temporada_id = (select id from temporadas where nombre = 'Temporada 2026'))
join equipos e on e.nombre = v.equipo_jugador and e.temporada_id = (select id from temporadas where nombre = 'Temporada 2026')
join jugadores j on j.nombre = v.jugador and j.equipo_id = e.id;
