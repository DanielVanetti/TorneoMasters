import { NextRequest } from "next/server";
import { requireUser, okJson, errorJson } from "@/lib/api-helpers";
import { supabaseAdmin } from "@/lib/supabase/admin";

const CLAVES_VALIDAS = ["requisitos", "reglamento"];

export async function POST(request: NextRequest) {
  const usuario = await requireUser();
  if (!usuario) return errorJson(["No autorizado. Iniciá sesión."], 401);

  const { clave, titulo, contenido } = await request.json();
  if (!CLAVES_VALIDAS.includes(clave)) return errorJson(["Sección inválida."]);

  const { data, error } = await supabaseAdmin
    .from("contenido_paginas")
    .upsert({ clave, titulo: titulo || null, contenido: contenido || "", actualizado_en: new Date().toISOString() }, { onConflict: "clave" })
    .select();

  if (error) return errorJson([error.message], 500);

  return okJson({ contenido: data[0] });
}
