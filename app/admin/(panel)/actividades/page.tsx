"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { llamarFuncion, fileToBase64 } from "@/lib/admin-client";
import Mensaje from "@/components/admin/Mensaje";
import { panelCls, labelCls, inputCls, btnCls, btnDangerCls } from "@/lib/admin-ui";

type Partido = { id: string; jornada: number; fecha: string; local?: { nombre: string } | null; visitante?: { nombre: string } | null };
type Foto = { id: string; titulo: string | null; url_imagen: string };

export default function ActividadesAdminPage() {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [fotos, setFotos] = useState<Foto[] | null>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [partidoId, setPartidoId] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: "ok" | "error" } | null>(null);

  async function cargarPartidos() {
    const supabase = createClient();
    const { data } = await supabase
      .from("partidos")
      .select("id, jornada, fecha, local:equipo_local_id(nombre), visitante:equipo_visitante_id(nombre)")
      .order("fecha", { ascending: false })
      .limit(60);
    setPartidos((data as unknown as Partido[]) || []);
  }

  async function cargarFotos() {
    const supabase = createClient();
    const { data, error } = await supabase.from("imagenes").select("*").order("subida_en", { ascending: false });
    if (error) {
      setMensaje({ texto: `Error: ${error.message}`, tipo: "error" });
      return;
    }
    setFotos(data || []);
  }

  useEffect(() => {
    cargarPartidos();
    cargarFotos();
  }, []);

  async function eliminar(f: Foto) {
    if (!confirm("¿Eliminar esta foto de Actividades?")) return;
    try {
      await llamarFuncion("eliminar-foto", { id: f.id });
      cargarFotos();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setMensaje(null);
    if (!archivo) return;
    setSubiendo(true);
    try {
      const { base64, contentType, filename } = await fileToBase64(archivo);
      await llamarFuncion("subir-foto", {
        archivo_base64: base64,
        nombre_archivo: filename,
        content_type: contentType,
        titulo,
        descripcion,
        partido_id: partidoId || null,
      });
      setMensaje({ texto: "Foto subida correctamente.", tipo: "ok" });
      setArchivo(null);
      setTitulo("");
      setDescripcion("");
      setPartidoId("");
      cargarFotos();
    } catch (err) {
      setMensaje({ texto: err instanceof Error ? err.message : String(err), tipo: "error" });
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl m-0 mb-1.5 text-tms-teal-dark font-bold">Actividades</h1>
      <p className="text-tms-ink/60 m-0 mb-6 text-[15px]">
        Subí fotos de partidos y actividades. Las que asociés a un partido aparecen agrupadas en su propio carrusel en la página pública.
      </p>

      <div className={panelCls}>
        <h2 className="text-lg m-0 mb-4 text-tms-teal-dark font-bold">Subir foto</h2>
        {mensaje && <Mensaje texto={mensaje.texto} tipo={mensaje.tipo} />}
        <form onSubmit={handleSubmit}>
          <label className={labelCls}>Foto</label>
          <input type="file" accept="image/*" required className={inputCls} onChange={(e) => setArchivo(e.target.files?.[0] || null)} />
          <label className={labelCls}>Título</label>
          <input className={inputCls} placeholder="Ej: Jornada 3 - Sabaneros vs Costeños" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          <label className={labelCls}>Descripción (opcional)</label>
          <textarea className={`${inputCls} min-h-[70px]`} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          <label className={labelCls}>Partido relacionado (opcional)</label>
          <select className={inputCls} value={partidoId} onChange={(e) => setPartidoId(e.target.value)}>
            <option value="">Ninguno / actividad general</option>
            {partidos.map((p) => (
              <option key={p.id} value={p.id}>
                J{p.jornada} · {p.local?.nombre || "?"} vs {p.visitante?.nombre || "?"} ({p.fecha})
              </option>
            ))}
          </select>
          <button type="submit" disabled={subiendo} className={btnCls}>
            {subiendo ? "Subiendo…" : "Subir foto"}
          </button>
        </form>
      </div>

      <div className={panelCls}>
        <h2 className="text-lg m-0 mb-4 text-tms-teal-dark font-bold">Fotos publicadas</h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3.5">
          {fotos === null && <p>Cargando…</p>}
          {fotos?.length === 0 && <p>Todavía no hay fotos.</p>}
          {fotos?.map((f) => (
            <div key={f.id} className="bg-white rounded-lg overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.url_imagen} alt={f.titulo || ""} className="w-full aspect-[4/3] object-cover block" />
              <div className="p-2">
                <div className="text-[13px] font-bold mb-1.5">{f.titulo || "(sin título)"}</div>
                <button className={btnDangerCls} onClick={() => eliminar(f)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
