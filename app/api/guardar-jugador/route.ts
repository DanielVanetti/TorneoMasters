import { NextRequest } from "next/server";
import { requireUser, okJson, errorJson } from "@/lib/api-helpers";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const usuario = await requireUser();
  if (!usuario) return errorJson(["No autorizado. Iniciá sesión."], 401);

  const datos = await request.json();
  const errores: string[] = [];
  if (!datos.nombre || !datos.nombre.trim()) errores.push("El jugador necesita un nombre.");
  if (!datos.equipo_id) errores.push("Debés elegir el equipo del jugador.");
  if (errores.length > 0) return errorJson(errores);

  const payload = {
    nombre: datos.nombre.trim(),
    equipo_id: datos.equipo_id,
    numero: datos.numero || null,
    posicion: datos.posicion || null,
    fecha_nacimiento: datos.fecha_nacimiento || null,
    foto_url: datos.foto_url || null,
  };

  const query = datos.id
    ? supabaseAdmin.from("jugadores").update(payload).eq("id", datos.id).select()
    : supabaseAdmin.from("jugadores").insert(payload).select();

  const { data, error } = await query;
  if (error) return errorJson([error.message], 500);

  return okJson({ jugador: data[0] });
}
