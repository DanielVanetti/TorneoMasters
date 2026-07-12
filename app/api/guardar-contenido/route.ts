import { NextRequest } from "next/server";
import { requireUser, okJson, errorJson, parseJsonBody, dbErrorJson } from "@/lib/api-helpers";
import { supabaseAdmin } from "@/lib/supabase/admin";

const CLAVES_VALIDAS = ["requisitos", "reglamento"];

export async function POST(request: NextRequest) {
  const usuario = await requireUser();
  if (!usuario) return errorJson(["No autorizado. Iniciá sesión."], 401);

  const datos = await parseJsonBody<{ clave?: string; titulo?: string; contenido?: string }>(request);
  if (!datos) return errorJson(["Cuerpo de la solicitud inválido."]);
  const { clave, titulo, contenido } = datos;
  if (!clave || !CLAVES_VALIDAS.includes(clave)) return errorJson(["Sección inválida."]);

  const { data, error } = await supabaseAdmin
    .from("contenido_paginas")
    .upsert({ clave, titulo: titulo || null, contenido: contenido || "", actualizado_en: new Date().toISOString() }, { onConflict: "clave" })
    .select();

  if (error) return dbErrorJson("guardar-contenido", error);

  return okJson({ contenido: data[0] });
}
