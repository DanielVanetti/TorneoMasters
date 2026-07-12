import { NextRequest } from "next/server";
import { requireUser, okJson, errorJson, parseJsonBody, dbErrorJson } from "@/lib/api-helpers";
import { supabaseAdmin, getTemporadaActivaIdAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const usuario = await requireUser();
  if (!usuario) return errorJson(["No autorizado. Iniciá sesión."], 401);

  const datos = await parseJsonBody(request);
  if (!datos) return errorJson(["Cuerpo de la solicitud inválido."]);
  const errores: string[] = [];

  if (!datos.equipo_local_id || !datos.equipo_visitante_id) {
    errores.push("Debés elegir equipo local y visitante.");
  }
  if (datos.equipo_local_id === datos.equipo_visitante_id) {
    errores.push("El equipo local y visitante no pueden ser el mismo.");
  }
  if (!datos.jornada) errores.push("Falta la jornada.");
  if (!datos.fecha) errores.push("Falta la fecha.");
  if (
    datos.estado === "Jugado" &&
    (datos.goles_local === "" || datos.goles_local == null || datos.goles_visitante === "" || datos.goles_visitante == null)
  ) {
    errores.push("Si el partido ya se jugó, necesitás cargar el marcador.");
  }

  if (errores.length > 0) return errorJson(errores);

  // temporada_id se asigna solo al crear (ver guardar-equipo para el mismo
  // razonamiento: editar no debe mover el partido de temporada). Al editar,
  // la temporada "objetivo" contra la que se validan los equipos es la que
  // ya tiene el partido, no la activa.
  let temporadaObjetivo: string | null;
  if (datos.id) {
    const { data: partidoExistente, error: errorPartido } = await supabaseAdmin
      .from("partidos")
      .select("temporada_id")
      .eq("id", datos.id)
      .maybeSingle();
    if (errorPartido) return dbErrorJson("guardar-partido:lectura", errorPartido);
    if (!partidoExistente) return errorJson(["No se encontró ese partido. Puede que ya haya sido eliminado."]);
    temporadaObjetivo = partidoExistente.temporada_id;
  } else {
    temporadaObjetivo = await getTemporadaActivaIdAdmin();
    if (!temporadaObjetivo) return errorJson(["No hay ninguna temporada activa. Creá o activá una en Admin → Temporadas."]);
  }

  const { data: equiposDatos, error: errorEquipos } = await supabaseAdmin
    .from("equipos")
    .select("id, temporada_id")
    .in("id", [datos.equipo_local_id, datos.equipo_visitante_id]);
  if (errorEquipos) return dbErrorJson("guardar-partido:equipos", errorEquipos);
  const equiposOk = (equiposDatos || []).every((e) => e.temporada_id === temporadaObjetivo);
  if (!equiposOk || (equiposDatos || []).length !== 2) {
    return errorJson(["El equipo local y visitante deben pertenecer a la misma temporada que el partido."]);
  }

  const payload = {
    jornada: datos.jornada,
    fecha: datos.fecha,
    hora: datos.hora || null,
    cancha: datos.cancha || null,
    equipo_local_id: datos.equipo_local_id,
    equipo_visitante_id: datos.equipo_visitante_id,
    goles_local: datos.goles_local === "" ? null : datos.goles_local,
    goles_visitante: datos.goles_visitante === "" ? null : datos.goles_visitante,
    estado: datos.estado || "Programado",
    arbitro_nombre: datos.arbitro_nombre || null,
    informe_arbitro: datos.informe_arbitro || null,
    tarjetas_amarillas: datos.tarjetas_amarillas || null,
    tarjetas_rojas: datos.tarjetas_rojas || null,
    incidencias: datos.incidencias || null,
  };

  const query = datos.id
    ? supabaseAdmin.from("partidos").update(payload).eq("id", datos.id).select()
    : supabaseAdmin.from("partidos").insert({ ...payload, temporada_id: temporadaObjetivo }).select();

  const { data, error } = await query;
  if (error) return dbErrorJson("guardar-partido", error);
  const partido = data?.[0];
  if (!partido) return errorJson(["No se encontró ese partido. Puede que ya haya sido eliminado."]);

  // Goleadores del partido: se reemplazan por completo en cada guardado
  // (borrar + insertar) para que editar un resultado no deje goles viejos.
  if (Array.isArray(datos.goles)) {
    const filas = datos.goles
      .filter(
        (g: unknown): g is { jugador_id: string; cantidad: number } =>
          typeof g === "object" &&
          g !== null &&
          typeof (g as { jugador_id?: unknown }).jugador_id === "string" &&
          Number((g as { cantidad?: unknown }).cantidad) > 0
      )
      .map((g) => ({
        partido_id: partido.id,
        jugador_id: g.jugador_id,
        cantidad: Number(g.cantidad),
      }));

    if (filas.length) {
      // Un jugador solo puede anotar por uno de los dos equipos de este
      // partido — sin esto, una llamada directa a la API (sin pasar por el
      // <select> del panel) podría asignarle goles a un jugador ajeno.
      const idsJugadores = [...new Set(filas.map((f) => f.jugador_id))];
      const { data: jugadoresValidos, error: errorJugadores } = await supabaseAdmin
        .from("jugadores")
        .select("id, equipo_id")
        .in("id", idsJugadores);
      if (errorJugadores) return dbErrorJson("guardar-partido:jugadores", errorJugadores);

      const equiposDelPartido = new Set([partido.equipo_local_id, partido.equipo_visitante_id]);
      const idsValidos = new Set(
        (jugadoresValidos || []).filter((j) => equiposDelPartido.has(j.equipo_id)).map((j) => j.id)
      );
      const invalidos = idsJugadores.filter((id) => !idsValidos.has(id));
      if (invalidos.length > 0) {
        return errorJson(["Uno o más goleadores no pertenecen a ninguno de los dos equipos de este partido."]);
      }
    }

    const { error: errorBorrar } = await supabaseAdmin.from("goles").delete().eq("partido_id", partido.id);
    if (errorBorrar) return dbErrorJson("guardar-partido:borrar-goles", errorBorrar);

    if (filas.length) {
      const { error: errorGoles } = await supabaseAdmin.from("goles").insert(filas);
      if (errorGoles) return dbErrorJson("guardar-partido:insertar-goles", errorGoles);
    }
  }

  return okJson({ partido });
}
