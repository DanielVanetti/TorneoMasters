# Notas técnicas — Torneo Máster Santa Cruz

Registro de decisiones, límites y pendientes que no se ven a simple vista leyendo el código. Pensado para no repetir la misma discusión dos veces. Última actualización: 2026-07-10.

## Plan de Supabase

Proyecto en plan **Free** (`xqlehmuoyagdmiagfhvn`). Esto limita:

- **Leaked Password Protection** (chequeo de contraseñas filtradas contra HaveIBeenPwned): requiere plan **Pro** o superior. Intentamos activarlo el 2026-07-10 y Supabase lo rechazó por el plan. Decisión: **no vale la pena upgradear solo por esto** — son 2 cuentas admin, sin registro público. Revisar si el proyecto pasa a un plan pago por otra razón (más storage, más requests) y aprovechar para activarlo de paso.

## Seguridad del panel admin — pendientes, en orden de costo/beneficio

Ninguno de estos 4 está implementado todavía. Quedaron para "otro día" (decisión del usuario, 2026-07-10):

1. **IP allowlisting en Netlify para `/admin/*`** — la medida más efectiva dado que solo hay 2 admins con IP más o menos estable. Se configura en Netlify, no en el código.
2. **CAPTCHA (Cloudflare Turnstile) en el login** — requiere: (a) crear cuenta en Turnstile y un widget para el dominio del sitio, (b) pegar la Secret Key en Supabase Dashboard → Authentication → Attack Protection → Bot and Abuse Protection, (c) agregar el widget visual a `app/admin/login/page.tsx` y mandar el `captchaToken` en el `signInWithPassword`. Sin el paso (c) el toggle de Supabase no hace nada.
3. **MFA (2FA) real para las 2 cuentas admin** — se activa por usuario en Supabase Auth.
4. **Rate limits de Supabase Auth** — revisar los valores por defecto en Authentication → Rate Limits.

## Advisors de seguridad de Supabase — estado

Resueltos (2026-07-10, vía Supabase MCP con acceso OAuth):

- 3 vistas (`v_posiciones`, `v_goleadores`, `v_proximos_partidos`) con `SECURITY DEFINER` implícito → `security_invoker = on`. Ver `supabase/migracion-4-advisors.sql`.
- Bucket público `fotos-torneo` permitía **listar** todos los archivos (no solo accederlos por URL conocida) → se borró esa policy de `storage.objects`. El acceso público por URL sigue funcionando igual (el bucket público se sirve por un endpoint separado que no depende de RLS).

Pendiente, no accionable por plan (ver arriba): Leaked Password Protection.

Correr `mcp__supabase__get_advisors` de nuevo después de cualquier cambio de esquema para chequear que no aparezca nada nuevo.

## Migraciones aplicadas directo en producción vía Supabase MCP

Desde que se conectó el servidor MCP de Supabase (2026-07-10), algunas migraciones se corrieron directo contra la base de producción con `apply_migration` en vez de pedirle al usuario que las pegue en el SQL Editor. Quedan igual como archivo en `supabase/` para que el historial no se pierda y un proyecto nuevo se levante ya con esos fixes:

- `migracion-3-seguridad.sql` — corrida por el usuario a mano en el SQL Editor.
- `migracion-4-advisors.sql` — corrida por Claude vía MCP (`apply_migration`), con confirmación explícita del usuario antes de cada ejecución.
- `migracion-5-temporadas.sql` — feature de temporadas, corrida vía MCP con confirmación previa (ver sección de arriba).

`schema.sql` ya se actualizó para que un proyecto Supabase **nuevo** nazca directamente con estos dos fixes (no hace falta correr las migraciones 3 y 4 en un proyecto que arranca de cero).

## Inconsistencia encontrada: tablas de finanzas

`migracion-2-reglamento.sql` dice que borra `finanzas_ingresos`, `finanzas_gastos` y `aportes_equipo`, y el README las lista como ya quitadas. Pero al inspeccionar la base real (2026-07-10) **esas 3 tablas siguen existiendo** (vacías, con RLS activado). O sea, esa migración nunca se corrió en este proyecto, a pesar de lo que dice el archivo/README. No se tocó nada todavía — queda pendiente decidir: ¿se quitan de una vez (corriendo la migración 2 de verdad), o se recupera esa función de finanzas en el admin? Está documentado en el "Reporte de estado" que se generó el mismo día.

## Feature "temporadas" (activar/gestionar temporadas del torneo)

**Implementada el 2026-07-10.** Modelo "contenedor completo": tabla `temporadas` (una `activa` a la vez, forzado por índice único parcial), con `temporada_id` en `equipos`/`partidos`/`imagenes` (`jugadores`/`goles` heredan la temporada vía `equipo_id`/`partido_id`, sin columna propia). Las 3 vistas públicas (`v_posiciones`, `v_goleadores`, `v_proximos_partidos`) filtran solas a la temporada activa. Alcance decidido con el usuario: **el sitio público no tiene selector de temporada** — siempre muestra la activa, igual que antes de esta feature; las archivadas solo son consultables por SQL o reactivándolas.

Piezas nuevas: `app/api/{guardar,activar,eliminar}-temporada`, `app/admin/(panel)/temporadas`, `supabase/migracion-5-temporadas.sql` (ya aplicada en producción), `supabase/seed-temporada-anterior.sql` (seed chico para probar el cambio de activa sin tocar los datos de `seed-prueba.sql`).

Detalle importante para no reintroducir el bug: **`temporada_id` se resuelve server-side, nunca del cliente. Al crear se asigna la activa; al editar nunca se toca.** Ver `README.md` → sección "Temporadas" para el resto de las reglas (unicidad de nombre por temporada, etc.).




● User answered Claude's questions:
· Para terminar de verificar el mecanismo de cambio de temporada, necesito activar brevemente 'Temporada 2025 (archivada)' (los 4 equipos ficticios) y volver a activar 'Temporada 2026' after. Mientras tanto el sitio público mostraría los datos ficticios en vez de los reales. ¿Cómo preferís que lo pruebe? → Hacelo vos ahora, es breve (Recomendado)

  Called supabase

Ahora reviso rápido y reactivo la temporada real de inmediato.

  Ran 1 shell command

Confirmado: al activar la temporada archivada, el sitio público pasó a mostrar sus 4 equipos y dejó de mostrar los de la temporada real. Reactivo "Temporada 2026" ya mismo.

  Called supabase 2 times, ran 1 shell command

Confirmado: Temporada 2026 (real) vuelve a estar activa. Apago el servidor de desarrollo.

Feature "Temporadas" — lista y verificada en producción

Qué se hizo:
- Tabla temporadas (una sola puede estar "activa"), con temporada_id en equipos/partidos/imagenes; jugadores/goles heredan la temporada vía sus relaciones.
- Las 3 vistas públicas (v_posiciones, v_goleadores, v_proximos_partidos) filtran solas por la temporada activa — cero cambios en las páginas públicas.
- getJugadores()/getActividades() y todas las pantallas del admin (Equipos, Jugadores, Partidos, Actividades, dashboard) también quedaron acotadas a la temporada activa — si no lo hacía, en cuanto hubiera una 2ª temporada el panel se llenaría de datos archivados mezclados con los actuales.
- 3 rutas nuevas (guardar-temporada, activar-temporada, eliminar-temporada) + página /admin/temporadas.
- Regla aplicada en todos los guardar-*/importar-datos: la temporada se asigna server-side solo al crear; editar nunca mueve un registro de temporada.
- migracion-5-temporadas.sql ya aplicada en tu Supabase real (con tu confirmación): tus 17 equipos/80 jugadores/32 partidos reales quedaron en una temporada nueva "Temporada 2026", activa. Nada se borró ni se movió.
- seed-temporada-anterior.sql ya cargado también: una 2ª temporada chica y archivada ("Temporada 2025 (archivada)", 4 equipos/12 jugadores/2 partidos, con un equipo deliberadamente homónimo "Sabaneros FC" para probar que no choca).

Verificación real hecha: npm run build limpio, levanté el sitio en local, confirmé que las páginas públicas muestran solo tus datos reales, activé la temporada archivada (con tu confirmación explícita, porque afectaba el sitio público en vivo por unos segundos), confirmé que el sitio cambió a mostrar los 4 equipos ficticios y no los reales, y reactivé "Temporada 2026" de inmediato — quedó verificado en ambas direcciones.

Documentado en README.md (sección "Temporadas" + tabla de uso diario) y NOTAS-TECNICAS.md.

Para probar vos mismo: entrá a /admin/temporadas, vas a ver "Temporada 2026" (activa) y "Temporada 2025 (archivada)". Podés jugar con el botón "Marcar como activa" cuando quieras, y borrar la de prueba desde ahí cuando ya no la necesites.

Nada de esto está commiteado todavía (sigue pendiente desde el reporte de antes) — avisame cuándo querés que arme el commit.

✻ Crunched for 26m 24s

※ recap: We built and shipped the "temporadas" (seasons) feature end-to-end on your live Supabase project, fully tested and working. Nothing's committed to git yet, so let me know when you want that commit made. (disable recaps in /config)
● Update(NOTAS-TECNICAS.md)
Added 5 lines, removed 1 line

## Feature "temporadas" (activar/gestionar temporadas del torneo)

Al 2026-07-10 **no existe nada implementado**: no hay columna, tabla, ni referencia en el código, esquema o git log a "temporada". Si esto se pidió en una conversación anterior, no llegó
a implementarse — hay que retomar desde cero: definir alcance (¿una tabla `tem scopeados a una temporada activa? ¿simplemente un flag para "cerrar" la tempora
da actual y arrancar planillas en blanco?) antes de tocar el esquema.
**Implementada el 2026-07-10.** Modelo "contenedor completo": tabla `temporadarzado por índice único parcial), con `temporada_id` en `equipos`/`partidos`/`ima
genes` (`jugadores`/`goles` heredan la temporada vía `equipo_id`/`partido_id`, sin columna propia). Las 3 vistas públicas (`v_posiciones`, `v_goleadores`, `v_proximos_partidos`) filtran s
olas a la temporada activa. Alcance decidido con el usuario: **el sitio público no tiene selector de temporada** — siempre muestra la activa, igual que antes de esta feature; las archivad
as solo son consultables por SQL o reactivándolas.

Piezas nuevas: `app/api/{guardar,activar,eliminar}-temporada`, `app/admin/(panel)/temporadas`, `supabase/migracion-5-temporadas.sql` (ya aplicada en producción), `supabase/seed-temporada-
anterior.sql` (seed chico para probar el cambio de activa sin tocar los datos

Detalle importante para no reintroducir el bug: **`temporada_id` se resuelve server-side, nunca del cliente. Al crear se asigna la activa; al editar nunca se toca.** Ver `README.md` → sec
ción "Temporadas" para el resto de las reglas (unicidad de nombre por temporad

● Update(NOTAS-TECNICAS.md)
Added 1 line

- `migracion-3-seguridad.sql` — corrida por el usuario a mano en el SQL Editor.
- `migracion-4-advisors.sql` — corrida por Claude vía MCP (`apply_migration`),el usuario antes de cada ejecución.
- `migracion-5-temporadas.sql` — feature de temporadas, corrida vía MCP con confirmación previa (ver sección de arriba).

`schema.sql` ya se actualizó para que un proyecto Supabase **nuevo** nazca dir (no hace falta correr las migraciones 3 y 4 en un proyecto que arranca de cero)
.


  Ran 1 shell command

npm run build compila y tipa limpio — los únicos errores que aparecieron durante la generación estática son esperados: la migración todavía no está aplicada en Supabase, así que temporadas no existe todavía ahí (y el código lo maneja bien, sin romper el build). Antes de aplicar la migración a producción, necesito que confirmes dos cosas:

● User answered Claude's questions:
· ¿Aplico ahora supabase/migracion-5-temporadas.sql en tu Supabase de producción? Crea la tabla temporadas y agrega temporada_id a equipos/partidos/imagenes, migrando todo lo que ya tenés cargado a
una temporada nueva llamada 'Temporada 2026' (activa). No borra nada. → Sí, aplical
· supabase/seed-temporada-anterior.sql crea una segunda temporada chica con datos ficticios (4 equipos, 12 jugadores, 2 partidos) para poder probar el cambio de temporada activa. Tu Supabase ya tiene
datos reales del torneo (17 equipos, 80 jugadores, 32 partidos). ¿Cargo estos datosferís otra forma de probarlo? → Sí, cargalos igual (Recomendado)

Perfecto, confirmado. Primero un chequeo rápido de datos antes de aplicar.

  Called supabase 2 times, ran 1 shell command

Sin duplicados y sin jugadores huérfanos. Aplico la migración 5.

  Read 1 file, called supabase 2 times

Migración aplicada. Verifico los advisors de seguridad y cargo el seed de la temporada archivada.

  Called supabase, ran 1 shell command

Solo el warning esperado (plan Free). Ahora cargo seed-temporada-anterior.sql.

  Read 1 file, called supabase 2 times

Cargado. Confirmo que las 2 temporadas quedaron bien separadas.

  Called supabase
                                                                                                                                                                                                     ll(run)
Successfully loaded skill
Allowed by auto mode classifier                                                                                                                                                                 
  Read 1 file, ran 4 shell commands
                                                                                                                                                                                                     vidor arriba. Reviso las páginas públicas y busco errores en consola/servidor.
                                                                                                                                                                                                      2 shell commands
                                                                                                                                                                                                     as devuelven 200. Reviso el log del servidor por errores y confirmo que los datos ren.
                                                                                                                                                                                                     rched for 1 pattern, called MCP, ran 1 shell command

Ahora simulo el cambio de temporada activa (como haría el botón "Marcar como activa") para confirmar que el sitio público conmuta correctamente.
                                                                                                                                                                                                     led supabase
                                                                                                                                                                                                     és razón en que el sistema me frenó acá — cambiar la temporada activa en produccións, hace que el sitio público real le muestre datos ficticios a cualquiera que lo estévisitando en ese momento. No lo hice.                                                                                                                                                              
● User answered Claude's questions:
· Para terminar de verificar el mecanismo de cambio de temporada, necesito activar brevemente 'Temporada 2025 (archivada)' (los 4 equipos ficticios) y volver a activar 'Temporada 2026' after. Mientras tanto el sitio público mostraría los datos ficticios en vez de los reales.? → Hacelo vos ahora, es breve (Recomendado)

  Called supabase, ran 1 shell command

Ahora reviso rápido y reactivo la temporada real de inmediato.

  Called MCP, ran 1 shell command

Confirmado: al activar la temporada archivada, el sitio público pasó a mostrar sus 4 equipos y dejó de mostrar los de la temporada real. Reactivo "Temporada 2026" ya mismo.

  Called supabase 2 times, ran 2 shell commands

Confirmado: Temporada 2026 (real) vuelve a estar activa. Apago el servidor de desarrollo.

  Ran 1 shell command

Feature "Temporadas" — lista y verificada en producción

Qué se hizo:
- Tabla temporadas (una sola puede estar "activa"), con temporada_id en equipos/partidos/imagenes; jugadores/goles heredan la temporada vía sus relaciones.
- Las 3 vistas públicas (v_posiciones, v_goleadores, v_proximos_partidos) filtran solaero cambios en las páginas públicas.
- getJugadores()/getActividades() y todas las pantallas del admin (Equipos, Jugadores, Partidos, Actividades, dashboard) también quedaron acotadas a la temporada activa — si no lo hacía, en cuanto
hubiera una 2ª temporada el panel se llenaría de datos archivados mezclados con los ac
- 3 rutas nuevas (guardar-temporada, activar-temporada, eliminar-temporada) + página /admin/temporadas.
- Regla aplicada en todos los guardar-*/importar-datos: la temporada se asigna server-nca mueve un registro de temporada.
- migracion-5-temporadas.sql ya aplicada en tu Supabase real (con tu confirmación): tus 17 equipos/80 jugadores/32 partidos reales quedaron en una temporada nueva "Temporada 2026", activa. Nada se borró ni se movió.
- seed-temporada-anterior.sql ya cargado también: una 2ª temporada chica y archivada ( 4 equipos/12 jugadores/2 partidos, con un equipo deliberadamente homónimo "Sabaneroshubiera una 2ª temporada el panel se llenaría de datos archivados mezclados con los actuales.
- 3 rutas nuevas (guardar-temporada, activar-temporada, eliminar-temporada) + página /admin/temporadas.
- Regla aplicada en todos los guardar-*/importar-datos: la temporada se asigna server-nca mueve un registro de temporada.
- migracion-5-temporadas.sql ya aplicada en tu Supabase real (con tu confirmación): tus 17 equipos/80 jugadores/32 partidos reales quedaron en una temporada nueva "Temporada 2026", activa. Nada se borró ni se movió.
- seed-temporada-anterior.sql ya cargado también: una 2ª temporada chica y archivada ( 4 equipos/12 jugadores/2 partidos, con un equipo deliberadamente homónimo "SabanerosFC" para probar que no choca).

Verificación real hecha: npm run build limpio, levanté el sitio en local, confirmé quen solo tus datos reales, activé la temporada archivada (con tu confirmación explícita,porque afectaba el sitio público en vivo por unos segundos), confirmé que el sitio cambió a mostrar los 4 equipos ficticios y no los reales, y reactivé "Temporada 2026" de inmediato — quedó verificado en ambas direcciones.

Documentado en README.md (sección "Temporadas" + tabla de uso diario) y NOTAS-TECNICAS

Para probar vos mismo: entrá a /admin/temporadas, vas a ver "Temporada 2026" (activa) ". Podés jugar con el botón "Marcar como activa" cuando quieras, y borrar la de pruebadesde ahí cuando ya no la necesites.

Nada de esto está commiteado todavía (sigue pendiente desde el reporte de antes) — avisame cuándo querés que arme el commit.

✻ Cooked for 26m 24s

※ recap: We built and shipped the "temporadas" (seasons) feature end-to-end on your live Supabase project, fully tested and working. Nothing's committed to git yet, so let me know when you want that commit made. (disable recaps in /config)