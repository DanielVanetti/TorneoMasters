# Torneo Máster Santa Cruz

Sitio web del torneo: páginas públicas (posiciones, goleadores, calendario, equipos, galería, reglamento) + un panel `/admin/` privado para cargar resultados, jugadores, equipos y fotos. Construido en [Next.js](https://nextjs.org) sobre [Supabase](https://supabase.com) (base de datos + autenticación + almacenamiento de fotos), desplegado en [Netlify](https://netlify.com) con su runtime oficial de Next.js.

- Sitio público: `https://tusitio.netlify.app/`
- Admin: `https://tusitio.netlify.app/admin/`
- Repo: https://github.com/DanielVanetti/TorneoMasters

## Índice

- [Cómo está armado](#cómo-está-armado)
- [Estructura de archivos](#estructura-de-archivos)
- [Puesta en marcha desde cero](#puesta-en-marcha-desde-cero)
- [Desarrollo local](#desarrollo-local)
- [Datos de prueba (seeder)](#datos-de-prueba-seeder)
- [Uso del día a día (contenido)](#uso-del-día-a-día-contenido)
- [Seguridad](#seguridad)
- [API interna (app/api/)](#api-interna-appapi)
- [Base de datos](#base-de-datos-supabaseschemasql)
- [Troubleshooting](#troubleshooting)

## Cómo está armado

El sitio es una sola app de Next.js (App Router + TypeScript), con tres capas:

1. **Páginas públicas** (`app/*/page.tsx`): Server Components — se renderizan en el servidor con los datos ya adentro (más rápido que pedirlos por JavaScript en el navegador) y se cachean con revalidación cada 30 segundos, así una edición en el admin se refleja rápido sin tener que re-desplegar el sitio.

2. **Datos**: las páginas públicas leen Supabase con la `anon key` (pública, protegida por RLS — ver [Seguridad](#seguridad)) a través de `lib/queries.ts`. Los archivos `data/*.js` de la versión anterior ya no existen — todo sale de la base de datos.

3. **Panel admin** (`app/admin/`): páginas React interactivas (Client Components) protegidas en dos capas — un `middleware.ts` que bloquea `/admin/*` a nivel de servidor si no hay sesión (antes de servir cualquier HTML), y cada endpoint de escritura (`app/api/*/route.ts`) que vuelve a verificar la sesión antes de tocar la base. El navegador nunca escribe directo a la base: siempre pasa por uno de estos endpoints.

```
Navegador (público)  ──lectura──▶  Supabase (anon key, RLS)
Navegador (/admin/)  ──login────▶  Supabase Auth
Navegador (/admin/)  ──escritura─▶ app/api/*  ──▶ Supabase (service_role key)
```

## Estructura de archivos

```
├── app/
│   ├── layout.tsx                → fuentes, <html>, globals.css
│   ├── page.tsx                  → home: hero, próximos partidos, top 5
│   ├── posiciones/page.tsx       → tabla de posiciones completa
│   ├── goleadores/page.tsx       → podio + tabla de goleadores
│   ├── calendario/page.tsx       → próximos partidos programados
│   ├── equipos/page.tsx          → grilla de equipos + planteles
│   ├── equipos/imprimir/page.tsx → misma info, con botón de imprimir/PDF
│   ├── galeria/page.tsx          → fotos del torneo
│   ├── reglamento/page.tsx       → requisitos para participar + reglamento
│   ├── admin/
│   │   ├── login/page.tsx
│   │   └── (panel)/              → todo lo protegido por middleware.ts
│   │       ├── layout.tsx        → header + nav del admin
│   │       ├── page.tsx          → dashboard
│   │       ├── equipos/ jugadores/ partidos/ galeria/ reglamento/ importar/
│   └── api/                      → endpoints de escritura (ver sección dedicada)
│
├── components/                   → Nav, Footer, PageHeader, EmptyState, EquiposGrid, admin/*
├── lib/
│   ├── supabase/
│   │   ├── public.ts             → cliente anon para páginas públicas (sin cookies, permite cache)
│   │   ├── server.ts             → cliente anon con cookies, para Server Components/rutas que necesitan sesión
│   │   ├── client.ts             → cliente para Client Components (admin, formularios)
│   │   ├── middleware.ts         → lógica de bloqueo de /admin/*
│   │   └── admin.ts              → cliente con service_role (SOLO server-side)
│   ├── queries.ts                → getPosiciones/getGoleadores/getProximosPartidos/etc.
│   ├── admin-client.ts           → llamarFuncion() + fileToBase64() para el admin
│   └── format.ts                 → formatFecha/formatHora/initials
├── middleware.ts                 → protege /admin/* a nivel de servidor
│
├── supabase/
│   ├── schema.sql                → esquema completo, para un proyecto Supabase nuevo
│   ├── migracion-2-reglamento.sql→ migración histórica ya aplicada
│   └── seed-prueba.sql           → datos de prueba (ver sección dedicada)
├── public/robots.txt             → bloquea /admin/ en buscadores
├── netlify.toml                  → runtime de Next.js + cabeceras de /admin/
└── package.json
```

## Puesta en marcha desde cero

Si algún día hay que levantar esto en otro proyecto de Supabase / otro sitio de Netlify:

1. **Crear el proyecto en Supabase** ([supabase.com](https://supabase.com) → New project).
2. **Correr el esquema**: SQL Editor → pegar todo `supabase/schema.sql` → Run. (Si da el error `cannot execute CREATE EXTENSION in a read-only transaction`, ver [Troubleshooting](#troubleshooting)).
3. **Crear los usuarios admin**: Authentication → Users → Add user, con "Auto Confirm User" activado. Uno por cada persona que va a administrar el sitio — todos tienen los mismos permisos, no hay roles distintos.
4. **Conectar el repo a Netlify**: Site configuration → Build & deploy → Link repository (GitHub → elegir el repo → rama `main`). `netlify.toml` ya trae el plugin de Next.js configurado, no hace falta tocar nada ahí.
5. **Cargar las variables de entorno en Netlify** (Site configuration → Environment variables):
   - `NEXT_PUBLIC_SUPABASE_URL` — Project Settings → API → Project URL (pública)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Project Settings → API → anon public key (pública)
   - `SUPABASE_SERVICE_ROLE_KEY` ← **esta es secreta**, sale de Project Settings → API → `service_role`. Nunca va en el código, solo acá.
6. **Redeploy** (Deploys → Trigger deploy) para que tome las variables nuevas.

## Desarrollo local

```
npm install
```

Crear `.env.local` (no se sube a git) con:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # solo hace falta para probar el admin en local
```

```
npm run dev       # http://localhost:3000
npm run build     # build de producción, igual al que corre Netlify
```

## Datos de prueba (seeder)

`supabase/seed-prueba.sql` carga datos ficticios pero completos para poder ver el sitio funcionando de punta a punta antes de que el admin cargue algo real: 16 equipos, 80 jugadores (5 por equipo), 3 jornadas ya jugadas con goleadores (para que Posiciones y Goleadores tengan algo que mostrar) y 1 jornada programada (para ver el Calendario). Las fechas son relativas a "hoy", así que siempre se ven vigentes sin importar cuándo lo corras.

Cómo usarlo:

1. Supabase → SQL Editor → New query.
2. Pegar todo el contenido de `supabase/seed-prueba.sql` → Run.
3. Refrescar el sitio público — ya debería verse todo con datos.

Para borrarlo cuando empiecen a cargar datos reales (sin tocar fotos de galería ni el texto de Reglamento, que viven en otras tablas): descomentá las 4 líneas del bloque `-- LIMPIEZA` al principio del archivo y corré solo esas líneas primero, o simplemente:

```sql
delete from goles;
delete from partidos;
delete from jugadores;
delete from equipos;
```

Si lo corrés dos veces sin limpiar antes, los equipos no se duplican (tienen nombre único), pero los jugadores y partidos sí — así que limpiá primero si vas a re-sembrar.

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

- **`/admin/` no tiene link en el menú público** y está bloqueado en `public/robots.txt` — pero eso solo evita que alguien lo encuentre por casualidad, no es la protección real.
- La protección real tiene dos capas: **`middleware.ts` bloquea las páginas de `/admin/*` en el servidor** si no hay sesión válida (redirige a login antes de mandar cualquier HTML), y **cada endpoint de escritura en `app/api/*` vuelve a exigir sesión** por su cuenta. Sin loguearse, no se puede crear, editar ni borrar nada, aunque alguien conozca la URL del admin o llame a la API directo.
- La **anon key** (pública, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) solo puede **leer** — las políticas RLS (`supabase/schema.sql`) le dan `select` público a todas las tablas, pero ninguna política de `insert`/`update`/`delete`.
- La **service_role key** (en Netlify, nunca en el repo) puede escribir sin restricciones — la usa exclusivamente el código server-side de `app/api/*`, después de validar el login.
- Si alguna vez la `service_role key` se expone por error (por ejemplo, pegada en un chat), se puede regenerar en Supabase: Project Settings → API → `service_role` → Reset, y después actualizarla en Netlify.

## API interna (`app/api/`)

Todos requieren sesión y se llaman desde el admin con el token de Supabase en el header `Authorization: Bearer <token>` (lo arma `lib/admin-client.ts: llamarFuncion()`).

| Endpoint | Qué hace |
|---|---|
| `guardar-equipo` | Crea/edita un equipo |
| `guardar-jugador` | Crea/edita un jugador |
| `guardar-partido` | Crea/edita un partido, incluyendo resultado, informe de árbitro y goleadores del partido |
| `guardar-contenido` | Guarda el texto de Requisitos / Reglamento |
| `subir-foto` | Sube una foto a la galería pública (tabla `imagenes`) |
| `subir-archivo` | Sube un archivo genérico (foto de jugador, logo de equipo) y devuelve la URL |
| `importar-datos` | Carga masiva de equipos/jugadores (usada por Admin → Importar) |
| `eliminar-equipo` / `eliminar-jugador` / `eliminar-partido` / `eliminar-foto` | Borran por id |

## Base de datos (`supabase/schema.sql`)

Tablas: `equipos`, `jugadores`, `partidos` (incluye informe de árbitro), `goles` (detalle por jugador, alimenta la tabla de goleadores), `imagenes` (galería), `contenido_paginas` (Requisitos/Reglamento).

Vistas (hacen los cálculos, el frontend solo las lee):
- `v_posiciones` — PJ/PG/PE/PP/GF/GC/DG/Pts por equipo, ya ordenada.
- `v_goleadores` — goles totales por jugador.
- `v_proximos_partidos` — partidos con estado "Programado", con nombres de equipo resueltos.

No hay tabla de roles de administrador — los usuarios de Supabase Auth ya cumplen esa función, todos con el mismo nivel de acceso.

## Troubleshooting

**`ERROR: 25006: cannot execute CREATE EXTENSION in a read-only transaction`** al correr el schema en un proyecto recién creado: la base todavía no terminó de aprovisionarse. Esperá 1-2 minutos, refrescá el SQL Editor y volvé a correrlo.

**El build de Netlify falla con "Secrets scanning found secrets in build output"**: revisá que no haya ninguna clave secreta (`service_role`) escrita en el código — solo debe existir como variable de entorno.

**Cambié algo y no se ve reflejado en el sitio**: confirmá que el push llegó a `main` en GitHub y que el deploy en Netlify (pestaña Deploys) terminó en verde ("Published"), no en rojo. Las páginas públicas cachean por 30 segundos (ver "Cómo está armado"), así que un cambio recién guardado puede tardar hasta medio minuto en aparecer.

**No puedo entrar a `/admin/`**: confirmá que el usuario existe en Supabase → Authentication → Users y que tiene el toggle de confirmado en verde (si lo creaste sin "Auto Confirm User", tenés que confirmarlo a mano ahí mismo).
