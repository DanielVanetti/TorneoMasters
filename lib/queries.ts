import { createClient } from "@/lib/supabase/public";
import { formatFecha, formatHora } from "@/lib/format";

// Puerto de js/supabase-client.js — mismas vistas/tablas, misma forma de
// dato de salida, ahora llamado desde Server Components en vez de un
// fetch en el navegador después de montar la página.

export type Equipo = {
  id: string;
  name: string;
  city: string | null;
  color: string | null;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  pts: number;
  dg: number;
};

export async function getPosiciones(): Promise<Equipo[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_posiciones")
    .select("*")
    .order("pts", { ascending: false })
    .order("dg", { ascending: false })
    .order("gf", { ascending: false });
  if (error) {
    console.error("getPosiciones:", error.message);
    return [];
  }
  return (data || []).map((t) => ({
    id: t.equipo_id,
    name: t.equipo,
    city: t.city,
    color: t.color,
    pj: t.pj,
    pg: t.pg,
    pe: t.pe,
    pp: t.pp,
    gf: t.gf,
    gc: t.gc,
    pts: t.pts,
    dg: t.dg,
  }));
}

export type Goleador = { name: string; team: string; goals: number };

export async function getGoleadores(): Promise<Goleador[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_goleadores")
    .select("*")
    .order("goals", { ascending: false });
  if (error) {
    console.error("getGoleadores:", error.message);
    return [];
  }
  return (data || []).map((s) => ({ name: s.name, team: s.team, goals: s.goals }));
}

export type Partido = {
  jornada: number;
  date: string;
  time: string;
  venue: string;
  home: string;
  away: string;
};

export async function getProximosPartidos(limite?: number): Promise<Partido[]> {
  const supabase = await createClient();
  let query = supabase
    .from("v_proximos_partidos")
    .select("*")
    .order("fecha", { ascending: true })
    .order("hora", { ascending: true });
  if (limite) query = query.limit(limite);
  const { data, error } = await query;
  if (error) {
    console.error("getProximosPartidos:", error.message);
    return [];
  }
  return (data || []).map((p) => ({
    jornada: p.jornada,
    date: formatFecha(p.fecha),
    time: formatHora(p.hora),
    venue: p.cancha || "",
    home: p.home,
    away: p.away,
  }));
}

export type Jugador = {
  id: string;
  team: string;
  name: string;
  number: number | null;
  position: string | null;
  fotoUrl: string | null;
};

export async function getJugadores(): Promise<Jugador[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jugadores")
    .select("id, nombre, numero, posicion, equipo_id, foto_url");
  if (error) {
    console.error("getJugadores:", error.message);
    return [];
  }
  return (data || []).map((p) => ({
    id: p.id,
    team: p.equipo_id,
    name: p.nombre,
    number: p.numero,
    position: p.posicion,
    fotoUrl: p.foto_url,
  }));
}

export type Contenido = { titulo: string | null; contenido: string | null } | null;

export async function getContenido(): Promise<{ requisitos: Contenido; reglamento: Contenido }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contenido_paginas")
    .select("clave, titulo, contenido");
  if (error) {
    console.error("getContenido:", error.message);
    return { requisitos: null, reglamento: null };
  }
  const porClave: Record<string, Contenido> = {};
  (data || []).forEach((row) => {
    porClave[row.clave] = row;
  });
  return { requisitos: porClave.requisitos || null, reglamento: porClave.reglamento || null };
}

export type Foto = { id: string; titulo: string | null; descripcion: string | null; url: string };

export type GrupoActividades = {
  key: string;
  titulo: string;
  subtitulo: string;
  fotos: Foto[];
};

// Agrupa las fotos por el partido al que están asociadas (o un grupo
// "general" para las que no tienen partido_id) — cada grupo se muestra
// como un carrusel propio en la página pública de Actividades.
export async function getActividades(): Promise<GrupoActividades[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("imagenes")
    .select(
      "id, titulo, descripcion, url_imagen, subida_en, partido_id, partidos(jornada, fecha, equipo_local:equipo_local_id(nombre), equipo_visitante:equipo_visitante_id(nombre))"
    )
    .order("subida_en", { ascending: false });
  if (error) {
    console.error("getActividades:", error.message);
    return [];
  }

  type Row = {
    id: string;
    titulo: string | null;
    descripcion: string | null;
    url_imagen: string;
    subida_en: string;
    partido_id: string | null;
    partidos: { jornada: number; fecha: string; equipo_local: { nombre: string } | null; equipo_visitante: { nombre: string } | null } | null;
  };

  const grupos = new Map<string, GrupoActividades & { orden: string }>();
  for (const f of (data || []) as unknown as Row[]) {
    const key = f.partido_id || "general";
    if (!grupos.has(key)) {
      const p = f.partidos;
      const titulo = p ? `Jornada ${p.jornada} · ${p.equipo_local?.nombre || "?"} vs ${p.equipo_visitante?.nombre || "?"}` : "Actividades generales";
      const subtitulo = p ? formatFecha(p.fecha) : "Fotos del torneo sin partido asociado";
      grupos.set(key, { key, titulo, subtitulo, fotos: [], orden: f.subida_en });
    }
    grupos.get(key)!.fotos.push({ id: f.id, titulo: f.titulo, descripcion: f.descripcion, url: f.url_imagen });
  }

  return [...grupos.values()].sort((a, b) => (a.orden < b.orden ? 1 : -1));
}
