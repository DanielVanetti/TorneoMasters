import { NextRequest } from "next/server";
import { requireUser, okJson, errorJson, parseJsonBody, dbErrorJson } from "@/lib/api-helpers";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const usuario = await requireUser();
  if (!usuario) return errorJson(["No autorizado. Iniciá sesión."], 401);

  const datos = await parseJsonBody<{ id?: string }>(request);
  if (!datos) return errorJson(["Cuerpo de la solicitud inválido."]);
  if (!datos.id) return errorJson(["Falta el id."]);

  // Se desactivan todas primero: el índice único parcial de "temporadas"
  // (una sola fila con activa = true) impide que quede más de una activa
  // aunque algo falle a mitad de camino entre este update y el siguiente.
  const { error: errorDesactivar } = await supabaseAdmin.from("temporadas").update({ activa: false }).eq("activa", true);
  if (errorDesactivar) return dbErrorJson("activar-temporada:desactivar", errorDesactivar);

  const { data, error } = await supabaseAdmin.from("temporadas").update({ activa: true }).eq("id", datos.id).select();
  if (error) return dbErrorJson("activar-temporada:activar", error);
  if (!data || data.length === 0) return errorJson(["No se encontró esa temporada."]);

  return okJson({ temporada: data[0] });
}
