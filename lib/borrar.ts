import { NextRequest } from "next/server";
import { requireUser, okJson, errorJson, parseJsonBody, dbErrorJson } from "@/lib/api-helpers";
import { borrarPorId } from "@/lib/supabase/admin";

// Fábrica de handlers "eliminar por id" — reemplaza a
// netlify/functions/_borrar.js, usada por los 4 endpoints app/api/eliminar-*.
export function crearBorrador(tabla: string) {
  return async function POST(request: NextRequest) {
    const usuario = await requireUser();
    if (!usuario) return errorJson(["No autorizado. Iniciá sesión."], 401);

    const datos = await parseJsonBody<{ id?: string }>(request);
    if (!datos) return errorJson(["Cuerpo de la solicitud inválido."]);
    if (!datos.id) return errorJson(["Falta el id."]);

    const error = await borrarPorId(tabla, datos.id);
    if (error) {
      if (error.code === "23503") {
        return errorJson(["No se puede eliminar: hay otros datos que todavía dependen de este registro."]);
      }
      return dbErrorJson(`borrar ${tabla}`, error);
    }

    return okJson();
  };
}
