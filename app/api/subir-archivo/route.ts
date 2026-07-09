import { NextRequest } from "next/server";
import { requireUser, okJson, errorJson } from "@/lib/api-helpers";
import { subirArchivo } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const usuario = await requireUser();
  if (!usuario) return errorJson(["No autorizado. Iniciá sesión."], 401);

  const { archivo_base64, nombre_archivo, carpeta, content_type } = await request.json();
  if (!archivo_base64 || !nombre_archivo) return errorJson(["Falta el archivo."]);
  const carpetaSegura = ["jugadores", "equipos"].includes(carpeta) ? carpeta : "otros";

  try {
    const url = await subirArchivo(archivo_base64, nombre_archivo, carpetaSegura, content_type);
    return okJson({ url });
  } catch (e) {
    return errorJson([e instanceof Error ? e.message : String(e)], 500);
  }
}
