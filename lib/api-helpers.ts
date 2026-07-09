import { NextResponse } from "next/server";
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
