import { NextRequest } from "next/server";
import { requireUser, okJson, errorJson, parseJsonBody, dbErrorJson } from "@/lib/api-helpers";
import { supabaseAdmin, borrarArchivoPorUrl } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const usuario = await requireUser();
  if (!usuario) return errorJson(["No autorizado. Iniciá sesión."], 401);

  const datos = await parseJsonBody<{ id?: string }>(request);
  if (!datos) return errorJson(["Cuerpo de la solicitud inválido."]);
  if (!datos.id) return errorJson(["Falta el id."]);

  const { data, error: errorLectura } = await supabaseAdmin
    .from("imagenes")
    .select("url_imagen")
    .eq("id", datos.id)
    .maybeSingle();
  if (errorLectura) return dbErrorJson("eliminar-foto:lectura", errorLectura);

  const { error } = await supabaseAdmin.from("imagenes").delete().eq("id", datos.id);
  if (error) return dbErrorJson("eliminar-foto", error);

  await borrarArchivoPorUrl(data?.url_imagen);

  return okJson();
}
