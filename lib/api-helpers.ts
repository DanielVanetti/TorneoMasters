import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";

// Misma forma de respuesta que usaban las Netlify Functions viejas
// ({ ok, errores } / { ok, ...datos }) para no tener que tocar el
// contrato que espera el frontend del admin.
export function errorJson(errores: string[], status = 400) {
  return NextResponse.json({ ok: false, errores }, { status });
}

export function okJson(data: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: true, ...data });
}

// Devuelve el usuario autenticado o null. El middleware ya bloquea el acceso
// a las páginas de /admin/*, pero cada Route Handler vuelve a verificar la
// sesión antes de escribir — así una llamada directa a la API sin pasar por
// el panel tampoco puede mutar datos.
export async function requireUser() {
  return await getSessionUser();
}

// Body JSON parseado a mano en cada Route Handler porque request.json()
// tira si el body no es JSON válido — sin este wrapper, un body corrupto
// devuelve la página de error 500 genérica de Next en vez de {ok:false}.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function parseJsonBody<T = Record<string, any>>(
  request: NextRequest
): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

// Loguea el error real de Supabase/Postgres en el servidor (para debug) y
// devuelve al cliente un mensaje genérico — evita filtrar nombres de
// tablas/columnas/constraints en la respuesta HTTP.
export function dbErrorJson(contexto: string, error: { message: string }, mensaje = "No se pudo guardar. Intentá de nuevo.") {
  console.error(`${contexto}:`, error.message);
  return errorJson([mensaje], 500);
}
