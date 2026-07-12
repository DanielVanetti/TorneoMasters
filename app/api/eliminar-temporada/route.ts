import { NextRequest } from "next/server";
import { requireUser, okJson, errorJson, parseJsonBody, dbErrorJson } from "@/lib/api-helpers";
import { supabaseAdmin, borrarPorId } from "@/lib/supabase/admin";

// No usa la fábrica crearBorrador genérica: a diferencia de equipos/jugadores/
// partidos, acá hace falta bloquear el borrado de la temporada activa —
// borrarla deja el sitio público (y el resto del admin) sin ninguna
// temporada activa, mostrando todo vacío sin ningún aviso de la causa.
export async function POST(request: NextRequest) {
  const usuario = await requireUser();
  if (!usuario) return errorJson(["No autorizado. Iniciá sesión."], 401);

  const datos = await parseJsonBody<{ id?: string }>(request);
  if (!datos) return errorJson(["Cuerpo de la solicitud inválido."]);
  if (!datos.id) return errorJson(["Falta el id."]);

  const { data, error: errorLectura } = await supabaseAdmin
    .from("temporadas")
    .select("activa")
    .eq("id", datos.id)
    .maybeSingle();
  if (errorLectura) return dbErrorJson("eliminar-temporada:lectura", errorLectura);
  if (data?.activa) return errorJson(["No podés eliminar la temporada activa. Marcá otra como activa primero."]);

  const error = await borrarPorId("temporadas", datos.id);
  if (error) {
    if (error.code === "23503") {
      return errorJson(["No se puede eliminar: hay otros datos que todavía dependen de este registro."]);
    }
    return dbErrorJson("borrar temporadas", error);
  }

  return okJson();
}
