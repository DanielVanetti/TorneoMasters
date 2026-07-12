import { NextRequest } from "next/server";
import { requireUser, okJson, errorJson, parseJsonBody } from "@/lib/api-helpers";
import { subirArchivo } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const usuario = await requireUser();
  if (!usuario) return errorJson(["No autorizado. Iniciá sesión."], 401);

  const datos = await parseJsonBody<{ archivo_base64?: string; nombre_archivo?: string; carpeta?: string }>(request);
  if (!datos) return errorJson(["Cuerpo de la solicitud inválido."]);
  const { archivo_base64, nombre_archivo, carpeta } = datos;
  if (!archivo_base64 || !nombre_archivo) return errorJson(["Falta el archivo."]);
  const carpetaSegura = carpeta && ["jugadores", "equipos"].includes(carpeta) ? carpeta : "otros";

  try {
    const url = await subirArchivo(archivo_base64, nombre_archivo, carpetaSegura);
    return okJson({ url });
  } catch (e) {
    return errorJson([e instanceof Error ? e.message : "No se pudo subir el archivo."]);
  }
}
