import { NextRequest } from "next/server";
import { requireUser, okJson, errorJson, parseJsonBody, dbErrorJson } from "@/lib/api-helpers";
import { supabaseAdmin, borrarArchivoPorUrl, getTemporadaActivaIdAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const usuario = await requireUser();
  if (!usuario) return errorJson(["No autorizado. Iniciá sesión."], 401);

  const datos = await parseJsonBody(request);
  if (!datos) return errorJson(["Cuerpo de la solicitud inválido."]);
  const errores: string[] = [];
  if (typeof datos.nombre !== "string" || !datos.nombre.trim()) errores.push("El jugador necesita un nombre.");
  if (!datos.equipo_id) errores.push("Debés elegir el equipo del jugador.");
  if (errores.length > 0) return errorJson(errores);

  // jugadores no tiene temporada_id propio: hereda la temporada de su
  // equipo, así que el equipo elegido tiene que ser de la temporada
  // activa — si no, una llamada directa a la API (sin pasar por el
  // <select> del panel, que ya filtra por temporada activa) podría
  // enganchar un jugador a un equipo de una temporada archivada.
  const temporadaActivaId = await getTemporadaActivaIdAdmin();
  if (!temporadaActivaId) return errorJson(["No hay ninguna temporada activa. Creá o activá una en Admin → Temporadas."]);
  const { data: equipoElegido, error: errorEquipo } = await supabaseAdmin
    .from("equipos")
    .select("temporada_id")
    .eq("id", datos.equipo_id)
    .maybeSingle();
  if (errorEquipo) return dbErrorJson("guardar-jugador:equipo", errorEquipo);
  if (!equipoElegido || equipoElegido.temporada_id !== temporadaActivaId) {
    return errorJson(["El equipo elegido no pertenece a la temporada activa."]);
  }

  const numero = datos.numero === "" || datos.numero == null ? null : Number(datos.numero);
  if (numero !== null && !Number.isFinite(numero)) return errorJson(["El número de camiseta no es válido."]);

  const payload = {
    nombre: datos.nombre.trim(),
    equipo_id: datos.equipo_id,
    numero,
    posicion: datos.posicion || null,
    fecha_nacimiento: datos.fecha_nacimiento || null,
    foto_url: datos.foto_url || null,
  };

  let fotoAnterior: string | null = null;
  if (datos.id) {
    const { data: actual } = await supabaseAdmin.from("jugadores").select("foto_url").eq("id", datos.id).maybeSingle();
    fotoAnterior = actual?.foto_url ?? null;
  }

  const query = datos.id
    ? supabaseAdmin.from("jugadores").update(payload).eq("id", datos.id).select()
    : supabaseAdmin.from("jugadores").insert(payload).select();

  const { data, error } = await query;
  if (error) return dbErrorJson("guardar-jugador", error);
  const jugador = data?.[0];
  if (!jugador) return errorJson(["No se encontró ese jugador. Puede que ya haya sido eliminado."]);

  if (fotoAnterior && fotoAnterior !== payload.foto_url) {
    await borrarArchivoPorUrl(fotoAnterior);
  }

  return okJson({ jugador });
}
