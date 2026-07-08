# Torneo Máster Santa Cruz

Sitio web del torneo: páginas públicas (posiciones, goleadores, calendario, equipos, galería, reglamento) + un panel `/admin/` privado para cargar resultados, jugadores, equipos y fotos. Backend en [Supabase](https://supabase.com) (base de datos + autenticación + almacenamiento de fotos), funciones serverless en [Netlify Functions](https://docs.netlify.com/functions/overview/), hosting en [Netlify](https://netlify.com).

- Sitio público: `https://tusitio.netlify.app/`
- Admin: `https://tusitio.netlify.app/admin/`
- Repo: https://github.com/DanielVanetti/TorneoMasters

## Índice

- [Cómo está armado](#cómo-está-armado)
- [Estructura de archivos](#estructura-de-archivos)
- [Puesta en marcha desde cero](#puesta-en-marcha-desde-cero)
- [Uso del día a día (contenido)](#uso-del-día-a-día-contenido)
- [Seguridad](#seguridad)
- [Netlify Functions](#netlify-functions-netlifyfunctions)
- [Base de datos](#base-de-datos-supabaseschemasql)
- [Troubleshooting](#troubleshooting)

## Cómo está armado

El sitio tiene tres capas:

1. **Páginas públicas** (`*.dc.html` en la raíz): usan un framework de plantillas propio ("dc-runtime", cargado por `support.js`) con sintaxis `{{ variable }}` y `<sc-for>`/`<sc-if>` para listas y condicionales. No hay build step — son HTML que el navegador interpreta directo. `Nav.dc.html` y `Footer.dc.html` se importan en cada página con `<dc-import name="Nav">`.

2. **Datos**: cada página pública carga sus datos con `window.TorneoDBReady` (definido en `js/supabase-client.js`), que es un cliente de Supabase de **solo lectura** usando la `anon key` (pública, protegida por RLS — ver [Seguridad](#seguridad)). Antes estos datos eran archivos estáticos en `data/*.js`; esos archivos ya no se usan en producción, quedaron solo como referencia histórica.

3. **Panel admin** (`admin/`): HTML plano (sin el framework de plantillas) + JS vanilla. Cada página hace login contra Supabase Auth y llama a **Netlify Functions** (`netlify/functions/`) para escribir datos — el navegador nunca escribe directo a la base, siempre pasa por una function que valida la sesión primero.

```
Navegador (público)  ──lectura──▶  Supabase (anon key, RLS)
Navegador (/admin/)  ──login────▶  Supabase Auth
Navegador (/admin/)  ──escritura─▶ Netlify Function ──▶ Supabase (service_role key)
```

## Estructura de archivos

```
├── index.html                    → redirige a Inicio.dc.html
├── Inicio.dc.html                → home: hero, próximos partidos, top 5
├── Posiciones.dc.html            → tabla de posiciones completa
├── Goleadores.dc.html            → podio + tabla de goleadores
├── Calendario.dc.html            → próximos partidos programados
├── Equipos.dc.html               → grilla de equipos + planteles
├── Equipos-print-c4uyar.dc.html  → variante de Equipos para exportar/imprimir
├── Galeria.dc.html               → fotos del torneo
├── Reglamento.dc.html            → requisitos para participar + reglamento
├── Nav.dc.html / Footer.dc.html  → header y footer, importados en cada página
├── support.js                    → runtime del framework de plantillas (no tocar)
├── robots.txt                    → bloquea /admin/ en buscadores
│
├── js/
│   ├── supabase-config.js        → URL + anon key de Supabase (público, versionado)
│   └── supabase-client.js        → cliente de solo lectura + helpers (getPosiciones, etc.)
│
├── data/                         → datos de ejemplo originales, YA NO SE USAN
│
├── admin/                        → panel privado (protegido por login, no por la URL)
│   ├── index.html                → redirige a login.html
│   ├── login.html / js/login.js
│   ├── dashboard.html            → accesos rápidos + estadísticas
│   ├── equipos.html              → alta/edición/borrado de equipos
│   ├── jugadores.html            → alta/edición/borrado de jugadores
│   ├── partidos.html             → alta/edición de partidos, resultado, goleadores, informe de árbitro
│   ├── galeria.html              → subir/borrar fotos
│   ├── reglamento.html           → editar Requisitos y Reglamento
│   ├── importar-excel.html       → carga masiva de equipos/jugadores desde .xlsx
│   ├── css/admin.css             → estilos del panel
│   └── js/                       → un archivo de lógica por página + admin-common.js (sesión, helpers)
│
├── netlify/functions/            → backend (ver sección dedicada)
├── supabase/
│   ├── schema.sql                → esquema completo, para un proyecto Supabase nuevo
│   └── migracion-2-reglamento.sql→ migración aplicada sobre el proyecto actual
├── netlify.toml                  → config de Netlify (publish dir, functions, headers)
└── package.json                  → dependencia: @supabase/supabase-js (la usan las Functions)
```

## Puesta en marcha desde cero

Si algún día hay que levantar esto en otro proyecto de Supabase / otro sitio de Netlify:

1. **Crear el proyecto en Supabase** ([supabase.com](https://supabase.com) → New project).
2. **Correr el esquema**: SQL Editor → pegar todo `supabase/schema.sql` → Run. (Si da el error `cannot execute CREATE EXTENSION in a read-only transaction`, ver [Troubleshooting](#troubleshooting)).
3. **Crear los usuarios admin**: Authentication → Users → Add user, con "Auto Confirm User" activado. Uno por cada persona que va a administrar el sitio — todos tienen los mismos permisos, no hay roles distintos.
4. **Cargar las credenciales del sitio público**: en Project Settings → API, copiar **Project URL** y **anon public key**, pegarlas en `js/supabase-config.js`. Esto es público y va commiteado al repo — no es la clave secreta.
5. **Conectar el repo a Netlify**: Site configuration → Build & deploy → Link repository (GitHub → elegir el repo → rama `main`). `netlify.toml` ya define todo lo necesario (publish dir, carpeta de functions).
6. **Cargar las variables de entorno en Netlify**: Site configuration → Environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` ← **esta es secreta**, sale de Project Settings → API → `service_role`. Nunca va en el código, solo acá.
7. **Redeploy** (Deploys → Trigger deploy) para que tome las variables nuevas.

## Uso del día a día (contenido)

Todo se administra desde `/admin/` (login con el email/contraseña creados en el paso 3 de arriba):

| Quiero... | Dónde |
|---|---|
| Agregar/editar un equipo | Admin → Equipos |
| Agregar/editar un jugador (con foto) | Admin → Jugadores |
| Programar un partido | Admin → Partidos (elegí "Programado" como estado) |
| Cargar el resultado de un partido jugado | Admin → Partidos → editar ese partido → estado "Jugado", marcador, y agregar los goleadores con el botón "+ Agregar gol" (así se actualiza la tabla de Goleadores sola) |
| Subir fotos de un partido/actividad | Admin → Galería |
| Editar los requisitos o el reglamento | Admin → Reglamento |
| Cargar muchos equipos/jugadores de una | Admin → Importar (subís un .xlsx con hojas "Equipos" y/o "Jugadores", ver instrucciones en esa misma página) |

Las páginas públicas (Posiciones, Goleadores, tabla de Equipos) **se calculan solas**: la tabla de posiciones sale de los partidos jugados, los goleadores salen de los goles cargados en cada partido. No hay que tocar nada a mano ahí.

Mientras no haya datos cargados, cada página pública muestra un mensaje tipo "Aún no hay partidos programados" en vez de verse rota o vacía.

## Seguridad

- **`/admin/` no tiene link en el menú público** y está bloqueado en `robots.txt` — pero eso solo evita que alguien lo encuentre por casualidad, no es la protección real.
- La protección real es que **cada Netlify Function que escribe datos exige una sesión válida de Supabase Auth** (`netlify/functions/auth-check.js`). Sin loguearse, no se puede crear, editar ni borrar nada, aunque alguien conozca la URL del admin.
- La **anon key** (en `js/supabase-config.js`, pública) solo puede **leer** — las políticas RLS (`supabase/schema.sql`) le dan `select` público a todas las tablas, pero ninguna política de `insert`/`update`/`delete`.
- La **service_role key** (en Netlify, nunca en el repo) puede escribir sin restricciones — la usan exclusivamente las Functions, después de validar el login.
- Si alguna vez la `service_role key` se expone por error (por ejemplo, pegada en un chat), se puede regenerar en Supabase: Project Settings → API → `service_role` → Reset, y después actualizarla en Netlify.

## Netlify Functions (`netlify/functions/`)

Todas (excepto las que empiezan con `_`) requieren sesión y se llaman desde el admin con el token de Supabase en el header `Authorization: Bearer <token>`.

| Function | Qué hace |
|---|---|
| `auth-check.js` | Helper interno: valida el token de sesión. Lo usan todas las demás. |
| `_storage.js` | Helper interno: sube archivos a Supabase Storage. |
| `_borrar.js` | Helper interno: fábrica de handlers "borrar por id". |
| `guardar-equipo.js` | Crea/edita un equipo |
| `guardar-jugador.js` | Crea/edita un jugador |
| `guardar-partido.js` | Crea/edita un partido, incluyendo resultado, informe de árbitro y goleadores del partido |
| `guardar-contenido.js` | Guarda el texto de Requisitos / Reglamento |
| `subir-foto.js` | Sube una foto a la galería pública (tabla `imagenes`) |
| `subir-archivo.js` | Sube un archivo genérico (foto de jugador, logo de equipo) y devuelve la URL |
| `importar-datos.js` | Carga masiva de equipos/jugadores (usada por Admin → Importar) |
| `eliminar-equipo.js` / `eliminar-jugador.js` / `eliminar-partido.js` / `eliminar-foto.js` | Borran por id |

## Base de datos (`supabase/schema.sql`)

Tablas: `equipos`, `jugadores`, `partidos` (incluye informe de árbitro), `goles` (detalle por jugador, alimenta la tabla de goleadores), `imagenes` (galería), `contenido_paginas` (Requisitos/Reglamento).

Vistas (hacen los cálculos, el frontend solo las lee):
- `v_posiciones` — PJ/PG/PE/PP/GF/GC/DG/Pts por equipo, ya ordenada.
- `v_goleadores` — goles totales por jugador.
- `v_proximos_partidos` — partidos con estado "Programado", con nombres de equipo resueltos.

No hay tabla de roles de administrador — los usuarios de Supabase Auth ya cumplen esa función, todos con el mismo nivel de acceso.

## Troubleshooting

**`ERROR: 25006: cannot execute CREATE EXTENSION in a read-only transaction`** al correr el schema en un proyecto recién creado: la base todavía no terminó de aprovisionarse. Esperá 1-2 minutos, refrescá el SQL Editor y volvé a correrlo.

**El build de Netlify falla con "Secrets scanning found secrets in build output"**: es el escáner de Netlify marcando la URL/anon key de `js/supabase-config.js` porque coinciden con las variables de entorno del mismo nombre — son públicas a propósito. Ya está resuelto vía `SECRETS_SCAN_OMIT_PATHS` en `netlify.toml`; si vuelve a pasar en un archivo nuevo, agregarlo a esa misma lista.

**Cambié algo y no se ve reflejado en el sitio**: confirmá que el push llegó a `main` en GitHub y que el deploy en Netlify (pestaña Deploys) terminó en verde ("Published"), no en rojo.

**No puedo entrar a `/admin/`**: confirmá que el usuario existe en Supabase → Authentication → Users y que tiene el toggle de confirmado en verde (si lo creaste sin "Auto Confirm User", tenés que confirmarlo a mano ahí mismo).
