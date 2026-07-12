import { NextRequest } from "next/server";
import { requireUser, okJson, errorJson, parseJsonBody, dbErrorJson } from "@/lib/api-helpers";
import { supabaseAdmin, borrarArchivoPorUrl, getTemporadaActivaIdAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const usuario = await requireUser();
  if (!usuario) return errorJson(["No autorizado. Iniciá sesión."], 401);

  const datos = await parseJsonBody(request);
  if (!datos) return errorJson(["Cuerpo de la solicitud inválido."]);
  const errores: string[] = [];
  if (typeof datos.nombre !== "string" || !datos.nombre.trim()) errores.push("El equipo necesita un nombre.");
  if (errores.length > 0) return errorJson(errores);

  const payload = {
    nombre: datos.nombre.trim(),
    ciudad: datos.ciudad || null,
    color: datos.color || "#0E5C6B",
    delegado: datos.delegado || null,
    telefono: datos.telefono || null,
    email: datos.email || null,
    cancha_local: datos.cancha_local || null,
    logo_url: datos.logo_url || null,
  };

  let logoAnterior: string | null = null;
  if (datos.id) {
    const { data: actual } = await supabaseAdmin.from("equipos").select("logo_url").eq("id", datos.id).maybeSingle();
    logoAnterior = actual?.logo_url ?? null;
  }

  // temporada_id se asigna solo al crear (la temporada activa en ese
  // momento) — al editar un equipo existente nunca se lo cambia de
  // temporada, aunque mientras tanto se haya activado otra.
  let query;
  if (datos.id) {
    query = supabaseAdmin.from("equipos").update(payload).eq("id", datos.id).select();
  } else {
    const temporadaActivaId = await getTemporadaActivaIdAdmin();
    if (!temporadaActivaId) return errorJson(["No hay ninguna temporada activa. Creá o activá una en Admin → Temporadas."]);
    query = supabaseAdmin.from("equipos").insert({ ...payload, temporada_id: temporadaActivaId }).select();
  }

  const { data, error } = await query;
  if (error) return dbErrorJson("guardar-equipo", error);
  const equipo = data?.[0];
  if (!equipo) return errorJson(["No se encontró ese equipo. Puede que ya haya sido eliminado."]);

  if (logoAnterior && logoAnterior !== payload.logo_url) {
    await borrarArchivoPorUrl(logoAnterior);
  }

  return okJson({ equipo });
}
