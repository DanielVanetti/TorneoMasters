import { NextRequest } from "next/server";
import { requireUser, okJson, errorJson, parseJsonBody } from "@/lib/api-helpers";
import { supabaseAdmin, getTemporadaActivaIdAdmin } from "@/lib/supabase/admin";

type FilaEquipo = { nombre?: string; ciudad?: string; color?: string };
type FilaJugador = { nombre?: string; equipo?: string; numero?: number; posicion?: string };

const MAX_FILAS = 500;

export async function POST(request: NextRequest) {
  const usuario = await requireUser();
  if (!usuario) return errorJson(["No autorizado. Iniciá sesión."], 401);

  const datos = await parseJsonBody<{ equipos?: FilaEquipo[]; jugadores?: FilaJugador[] }>(request);
  if (!datos) return errorJson(["Cuerpo de la solicitud inválido."]);
  const { equipos, jugadores } = datos;
  const totalFilas = (equipos?.length || 0) + (jugadores?.length || 0);
  if (totalFilas > MAX_FILAS) {
    return errorJson([`El archivo tiene demasiadas filas (${totalFilas}). Máximo ${MAX_FILAS} por importación — dividilo en partes.`]);
  }
  const resultado = { equiposCreados: 0, jugadoresCreados: 0, errores: [] as string[] };
  const idPorNombre: Record<string, string> = {};

  // Todo lo que se importa se crea en la temporada activa — nunca en una
  // archivada, aunque el Excel repita el nombre de un equipo de otra
  // temporada (el unique(nombre, temporada_id) los distingue igual).
  const temporadaActivaId = await getTemporadaActivaIdAdmin();
  if (!temporadaActivaId) return errorJson(["No hay ninguna temporada activa. Creá o activá una en Admin → Temporadas."]);

  if (Array.isArray(equipos)) {
    for (const eq of equipos) {
      const nombre = (eq.nombre || "").trim();
      if (!nombre) continue;
      const { data, error } = await supabaseAdmin
        .from("equipos")
        .upsert(
          { nombre, ciudad: eq.ciudad || null, color: eq.color || "#0E5C6B", temporada_id: temporadaActivaId },
          { onConflict: "nombre,temporada_id" }
        )
        .select();
      if (error) {
        resultado.errores.push(`Equipo "${nombre}": ${error.message}`);
        continue;
      }
      idPorNombre[nombre] = data[0].id;
      resultado.equiposCreados++;
    }
  }

  if (Array.isArray(jugadores)) {
    // Los jugadores también pueden apuntar a equipos que ya existían antes
    // de esta importación (no solo a los que vinieron en este mismo
    // archivo) — pero solo a equipos de la temporada activa, para no
    // engancharlos sin querer a un equipo homónimo de una temporada vieja.
    const { data: existentes } = await supabaseAdmin
      .from("equipos")
      .select("id, nombre")
      .eq("temporada_id", temporadaActivaId);
    for (const e of existentes || []) {
      if (!idPorNombre[e.nombre]) idPorNombre[e.nombre] = e.id;
    }

    for (const j of jugadores) {
      const nombre = (j.nombre || "").trim();
      const equipoId = idPorNombre[(j.equipo || "").trim()];
      if (!nombre || !equipoId) {
        resultado.errores.push(`Jugador "${nombre || "(sin nombre)"}": equipo "${j.equipo || ""}" no encontrado.`);
        continue;
      }
      // upsert por (equipo_id, nombre) para que volver a subir el mismo
      // Excel actualice al jugador existente en vez de duplicarlo.
      const { error } = await supabaseAdmin
        .from("jugadores")
        .upsert(
          { nombre, equipo_id: equipoId, numero: j.numero || null, posicion: j.posicion || null },
          { onConflict: "equipo_id,nombre" }
        );
      if (error) {
        resultado.errores.push(`Jugador "${nombre}": ${error.message}`);
        continue;
      }
      resultado.jugadoresCreados++;
    }
  }

  return okJson({ resultado });
}
