import { NextRequest } from "next/server";
import { requireUser, okJson, errorJson } from "@/lib/api-helpers";
import { borrarPorId } from "@/lib/supabase/admin";

// Fábrica de handlers "eliminar por id" — reemplaza a
// netlify/functions/_borrar.js, usada por los 4 endpoints app/api/eliminar-*.
export function crearBorrador(tabla: string) {
  return async function POST(request: NextRequest) {
    const usuario = await requireUser();
    if (!usuario) return errorJson(["No autorizado. Iniciá sesión."], 401);

    const { id } = await request.json();
    if (!id) return errorJson(["Falta el id."]);

    const error = await borrarPorId(tabla, id);
    if (error) return errorJson([error.message], 500);

    return okJson();
  };
}
