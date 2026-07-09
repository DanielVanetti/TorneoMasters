import { NextRequest } from "next/server";
import { requireUser, okJson, errorJson } from "@/lib/api-helpers";
import { supabaseAdmin, subirArchivo } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const usuario = await requireUser();
  if (!usuario) return errorJson(["No autorizado. Iniciá sesión."], 401);

  const { archivo_base64, nombre_archivo, titulo, descripcion, partido_id, content_type } = await request.json();
  if (!archivo_base64 || !nombre_archivo) return errorJson(["Falta la imagen."]);

  let url: string;
  try {
    url = await subirArchivo(archivo_base64, nombre_archivo, "galeria", content_type);
  } catch (e) {
    return errorJson([e instanceof Error ? e.message : String(e)], 500);
  }

  const { error } = await supabaseAdmin.from("imagenes").insert({
    partido_id: partido_id || null,
    titulo: titulo || null,
    descripcion: descripcion || null,
    url_imagen: url,
  });
  if (error) return errorJson([error.message], 500);

  return okJson({ url });
}
