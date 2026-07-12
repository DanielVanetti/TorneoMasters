import { NextRequest } from "next/server";
import { requireUser, okJson, errorJson, parseJsonBody } from "@/lib/api-helpers";
import { supabaseAdmin, subirArchivo, getTemporadaActivaIdAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const usuario = await requireUser();
  if (!usuario) return errorJson(["No autorizado. Iniciá sesión."], 401);

  const datos = await parseJsonBody<{
    archivo_base64?: string;
    nombre_archivo?: string;
    titulo?: string;
    descripcion?: string;
    partido_id?: string;
  }>(request);
  if (!datos) return errorJson(["Cuerpo de la solicitud inválido."]);
  const { archivo_base64, nombre_archivo, titulo, descripcion, partido_id } = datos;
  if (!archivo_base64 || !nombre_archivo) return errorJson(["Falta la imagen."]);

  // Se chequea antes de subir el archivo al bucket: si no hay temporada
  // activa, el insert de abajo va a fallar de todas formas (temporada_id
  // es not null) y no queremos dejar un archivo huérfano en Storage.
  const temporadaActivaId = await getTemporadaActivaIdAdmin();
  if (!temporadaActivaId) return errorJson(["No hay ninguna temporada activa. Creá o activá una en Admin → Temporadas."]);

  let url: string;
  try {
    url = await subirArchivo(archivo_base64, nombre_archivo, "galeria");
  } catch (e) {
    return errorJson([e instanceof Error ? e.message : "No se pudo subir la imagen."]);
  }

  const { error } = await supabaseAdmin.from("imagenes").insert({
    temporada_id: temporadaActivaId,
    partido_id: partido_id || null,
    titulo: titulo || null,
    descripcion: descripcion || null,
    url_imagen: url,
  });
  if (error) {
    console.error("subir-foto:", error.message);
    return errorJson(["No se pudo guardar la foto. Intentá de nuevo."], 500);
  }

  return okJson({ url });
}
