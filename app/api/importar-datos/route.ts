import { NextRequest } from "next/server";
import { requireUser, okJson, errorJson } from "@/lib/api-helpers";
import { supabaseAdmin } from "@/lib/supabase/admin";

type FilaEquipo = { nombre?: string; ciudad?: string; color?: string };
type FilaJugador = { nombre?: string; equipo?: string; numero?: number; posicion?: string };

export async function POST(request: NextRequest) {
  const usuario = await requireUser();
  if (!usuario) return errorJson(["No autorizado. Iniciá sesión."], 401);

  const { equipos, jugadores } = (await request.json()) as { equipos?: FilaEquipo[]; jugadores?: FilaJugador[] };
  const resultado = { equiposCreados: 0, jugadoresCreados: 0, errores: [] as string[] };
  const idPorNombre: Record<string, string> = {};

  if (Array.isArray(equipos)) {
    for (const eq of equipos) {
      const nombre = (eq.nombre || "").trim();
      if (!nombre) continue;
      const { data, error } = await supabaseAdmin
        .from("equipos")
        .upsert({ nombre, ciudad: eq.ciudad || null, color: eq.color || "#0E5C6B" }, { onConflict: "nombre" })
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
    // de esta importación (no solo a los que vinieron en este mismo archivo).
    const { data: existentes } = await supabaseAdmin.from("equipos").select("id, nombre");
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
      const { error } = await supabaseAdmin.from("jugadores").insert({
        nombre,
        equipo_id: equipoId,
        numero: j.numero || null,
        posicion: j.posicion || null,
      });
      if (error) {
        resultado.errores.push(`Jugador "${nombre}": ${error.message}`);
        continue;
      }
      resultado.jugadoresCreados++;
    }
  }

  return okJson({ resultado });
}
