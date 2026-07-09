import { NextRequest } from "next/server";
import { requireUser, okJson, errorJson } from "@/lib/api-helpers";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const usuario = await requireUser();
  if (!usuario) return errorJson(["No autorizado. Iniciá sesión."], 401);

  const datos = await request.json();
  const errores: string[] = [];
  if (!datos.nombre || !datos.nombre.trim()) errores.push("El equipo necesita un nombre.");
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

  const query = datos.id
    ? supabaseAdmin.from("equipos").update(payload).eq("id", datos.id).select()
    : supabaseAdmin.from("equipos").insert(payload).select();

  const { data, error } = await query;
  if (error) return errorJson([error.message], 500);

  return okJson({ equipo: data[0] });
}
