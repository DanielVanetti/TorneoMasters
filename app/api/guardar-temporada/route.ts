import { NextRequest } from "next/server";
import { requireUser, okJson, errorJson, parseJsonBody, dbErrorJson } from "@/lib/api-helpers";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const usuario = await requireUser();
  if (!usuario) return errorJson(["No autorizado. Iniciá sesión."], 401);

  const datos = await parseJsonBody(request);
  if (!datos) return errorJson(["Cuerpo de la solicitud inválido."]);
  if (typeof datos.nombre !== "string" || !datos.nombre.trim()) {
    return errorJson(["La temporada necesita un nombre."]);
  }

  const payload = { nombre: datos.nombre.trim() };

  const query = datos.id
    ? supabaseAdmin.from("temporadas").update(payload).eq("id", datos.id).select()
    : supabaseAdmin.from("temporadas").insert({ ...payload, activa: false }).select();

  const { data, error } = await query;
  if (error) return dbErrorJson("guardar-temporada", error);
  const temporada = data?.[0];
  if (!temporada) return errorJson(["No se encontró esa temporada. Puede que ya haya sido eliminada."]);

  return okJson({ temporada });
}
