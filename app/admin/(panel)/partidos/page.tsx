"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { llamarFuncion, getTemporadaActivaId, ErrorDeRed } from "@/lib/admin-client";
import { guardarPartidoOffline } from "@/lib/offline-queue";
import Mensaje from "@/components/admin/Mensaje";
import { panelCls, labelCls, inputCls, btnCls, btnSecondaryCls, btnDangerCls, btnSmallSecondaryCls, formRowCls, tableCls, thCls, tdCls } from "@/lib/admin-ui";

type Equipo = { id: string; nombre: string };
type Jugador = { id: string; nombre: string; equipo_id: string };
type GolFila = { jugador_id: string; cantidad: number };
type Partido = {
  id: string;
  jornada: number;
  fecha: string;
  hora: string | null;
  cancha: string | null;
  estado: string;
  equipo_local_id: string;
  equipo_visitante_id: string;
  goles_local: number | null;
  goles_visitante: number | null;
  arbitro_nombre: string | null;
  informe_arbitro: string | null;
  incidencias: string | null;
  local?: { nombre: string } | null;
  visitante?: { nombre: string } | null;
};

const VACIO = {
  id: "",
  jornada: "",
  estado: "Programado",
  fecha: "",
  hora: "",
  cancha: "",
  equipo_local_id: "",
  equipo_visitante_id: "",
  goles_local: "",
  goles_visitante: "",
  arbitro_nombre: "",
  informe_arbitro: "",
  incidencias: "",
};

export default function PartidosAdminPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [partidos, setPartidos] = useState<Partido[] | null>(null);
  const [form, setForm] = useState(VACIO);
  const [jugadoresDisponibles, setJugadoresDisponibles] = useState<Jugador[]>([]);
  const [goles, setGoles] = useState<GolFila[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: "ok" | "error" } | null>(null);
  const formTopRef = useRef<HTMLDivElement>(null);

  async function cargarEquipos() {
    const supabase = createClient();
    const temporadaActivaId = await getTemporadaActivaId();
    const { data, error } = await supabase
      .from("equipos")
      .select("id, nombre")
      .eq("temporada_id", temporadaActivaId)
      .order("nombre");
    if (!error) setEquipos(data || []);
  }

  async function cargarPartidos() {
    const supabase = createClient();
    const temporadaActivaId = await getTemporadaActivaId();
    const { data, error } = await supabase
      .from("partidos")
      .select("*, local:equipo_local_id(nombre), visitante:equipo_visitante_id(nombre)")
      .eq("temporada_id", temporadaActivaId)
      .order("fecha", { ascending: false });
    if (error) {
      setMensaje({ texto: `Error: ${error.message}`, tipo: "error" });
      return;
    }
    setPartidos((data as unknown as Partido[]) || []);
  }

  useEffect(() => {
    cargarEquipos();
    cargarPartidos();
    // El banner de PendientesPartidos (en el layout del admin) sincroniza
    // los partidos guardados sin conexión y avisa acá para refrescar la
    // lista si el admin ya estaba parado en esta pantalla.
    window.addEventListener("tms:partidos-sincronizados", cargarPartidos);
    return () => window.removeEventListener("tms:partidos-sincronizados", cargarPartidos);
  }, []);

  async function cargarJugadoresDeEquipos(localId: string, visitanteId: string) {
    const ids = [localId, visitanteId].filter(Boolean);
    if (!ids.length) {
      setJugadoresDisponibles([]);
      return;
    }
    const supabase = createClient();
    const { data, error } = await supabase.from("jugadores").select("id, nombre, equipo_id").in("equipo_id", ids);
    setJugadoresDisponibles(error ? [] : data || []);
  }

  function limpiarForm() {
    setForm(VACIO);
    setGoles([]);
    setJugadoresDisponibles([]);
  }

  async function editar(p: Partido) {
    setForm({
      id: p.id,
      jornada: String(p.jornada),
      estado: p.estado,
      fecha: p.fecha,
      hora: p.hora || "",
      cancha: p.cancha || "",
      equipo_local_id: p.equipo_local_id,
      equipo_visitante_id: p.equipo_visitante_id,
      goles_local: p.goles_local != null ? String(p.goles_local) : "",
      goles_visitante: p.goles_visitante != null ? String(p.goles_visitante) : "",
      arbitro_nombre: p.arbitro_nombre || "",
      informe_arbitro: p.informe_arbitro || "",
      incidencias: p.incidencias || "",
    });
    await cargarJugadoresDeEquipos(p.equipo_local_id, p.equipo_visitante_id);
    const supabase = createClient();
    const { data: golesDb } = await supabase.from("goles").select("jugador_id, cantidad").eq("partido_id", p.id);
    setGoles((golesDb || []).map((g) => ({ jugador_id: g.jugador_id, cantidad: g.cantidad })));
    formTopRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function eliminar(p: Partido) {
    if (!confirm("¿Eliminar este partido? También se borran sus goles.")) return;
    try {
      await llamarFuncion("eliminar-partido", { id: p.id });
      cargarPartidos();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  }

  async function onEquipoChange(campo: "equipo_local_id" | "equipo_visitante_id", valor: string) {
    const next = { ...form, [campo]: valor };
    setForm(next);
    setGoles([]);
    await cargarJugadoresDeEquipos(next.equipo_local_id, next.equipo_visitante_id);
  }

  function agregarFilaGol() {
    if (!form.equipo_local_id || !form.equipo_visitante_id) {
      alert("Elegí primero el equipo local y visitante.");
      return;
    }
    setGoles([...goles, { jugador_id: "", cantidad: 1 }]);
  }

  function actualizarGol(i: number, campo: "jugador_id" | "cantidad", valor: string) {
    const next = [...goles];
    next[i] = { ...next[i], [campo]: campo === "cantidad" ? Number(valor) : valor };
    setGoles(next);
  }

  function quitarGol(i: number) {
    setGoles(goles.filter((_, idx) => idx !== i));
  }

  function nombreJugador(id: string) {
    const j = jugadoresDisponibles.find((x) => x.id === id);
    if (!j) return "";
    const equipo = equipos.find((e) => e.id === j.equipo_id);
    return equipo ? `${j.nombre} (${equipo.nombre})` : j.nombre;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setMensaje(null);
    if (form.equipo_local_id === form.equipo_visitante_id) {
      setMensaje({ texto: "El equipo local y visitante no pueden ser el mismo.", tipo: "error" });
      return;
    }
    setGuardando(true);
    const payload = {
      id: form.id || undefined,
      jornada: Number(form.jornada),
      estado: form.estado,
      fecha: form.fecha,
      hora: form.hora || null,
      cancha: form.cancha,
      equipo_local_id: form.equipo_local_id,
      equipo_visitante_id: form.equipo_visitante_id,
      goles_local: form.goles_local === "" ? null : Number(form.goles_local),
      goles_visitante: form.goles_visitante === "" ? null : Number(form.goles_visitante),
      arbitro_nombre: form.arbitro_nombre,
      informe_arbitro: form.informe_arbitro,
      incidencias: form.incidencias,
      goles: goles.filter((g) => g.jugador_id && g.cantidad > 0),
    };
    try {
      await llamarFuncion("guardar-partido", payload);
      setMensaje({ texto: "Partido guardado correctamente.", tipo: "ok" });
      limpiarForm();
      cargarPartidos();
    } catch (err) {
      if (err instanceof ErrorDeRed) {
        guardarPartidoOffline(payload);
        setMensaje({
          texto: "Sin conexión: el partido quedó guardado en este celular y se va a enviar solo apenas vuelva la señal.",
          tipo: "ok",
        });
        limpiarForm();
        return;
      }
      setMensaje({ texto: err instanceof Error ? err.message : String(err), tipo: "error" });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl m-0 mb-1.5 text-tms-teal-dark font-bold">Partidos</h1>
      <p className="text-tms-ink/60 m-0 mb-6 text-[15px]">Programá partidos y cargá el resultado + informe del árbitro.</p>

      <div className={panelCls} ref={formTopRef}>
        <h2 className="text-lg m-0 mb-4 text-tms-teal-dark font-bold">
          {form.id ? `Editando jornada ${form.jornada}` : "Nuevo partido"}
        </h2>
        {mensaje && <Mensaje texto={mensaje.texto} tipo={mensaje.tipo} />}
        <form onSubmit={handleSubmit}>
          <div className={formRowCls}>
            <div>
              <label className={labelCls}>Jornada</label>
              <input type="number" min={1} required className={inputCls} value={form.jornada} onChange={(e) => setForm({ ...form, jornada: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Estado</label>
              <select className={inputCls} value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                <option>Programado</option>
                <option>Jugado</option>
                <option>Suspendido</option>
              </select>
            </div>
          </div>
          <div className={formRowCls}>
            <div>
              <label className={labelCls}>Fecha</label>
              <input type="date" required className={inputCls} value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Hora</label>
              <input type="time" className={inputCls} value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} />
            </div>
          </div>
          <label className={labelCls}>Cancha</label>
          <input className={inputCls} value={form.cancha} onChange={(e) => setForm({ ...form, cancha: e.target.value })} />

          <div className={formRowCls}>
            <div>
              <label className={labelCls}>Equipo local</label>
              <select className={inputCls} required value={form.equipo_local_id} onChange={(e) => onEquipoChange("equipo_local_id", e.target.value)}>
                <option value="">Elegí un equipo</option>
                {equipos.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Equipo visitante</label>
              <select className={inputCls} required value={form.equipo_visitante_id} onChange={(e) => onEquipoChange("equipo_visitante_id", e.target.value)}>
                <option value="">Elegí un equipo</option>
                {equipos.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={formRowCls}>
            <div>
              <label className={labelCls}>Goles local</label>
              <input type="number" min={0} className={inputCls} value={form.goles_local} onChange={(e) => setForm({ ...form, goles_local: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Goles visitante</label>
              <input type="number" min={0} className={inputCls} value={form.goles_visitante} onChange={(e) => setForm({ ...form, goles_visitante: e.target.value })} />
            </div>
          </div>

          <label className={labelCls}>Goleadores del partido</label>
          <div className="flex flex-col gap-2 mb-2">
            {goles.map((g, i) => (
              <div key={i} className="flex gap-2.5 items-center">
                <select className={`${inputCls} flex-1`} value={g.jugador_id} onChange={(e) => actualizarGol(i, "jugador_id", e.target.value)}>
                  <option value="">Elegí jugador</option>
                  {jugadoresDisponibles.map((j) => (
                    <option key={j.id} value={j.id}>
                      {nombreJugador(j.id)}
                    </option>
                  ))}
                </select>
                <input type="number" min={1} className={`${inputCls} w-20`} value={g.cantidad} onChange={(e) => actualizarGol(i, "cantidad", e.target.value)} />
                <button type="button" className={btnDangerCls} onClick={() => quitarGol(i)}>
                  Quitar
                </button>
              </div>
            ))}
          </div>
          <button type="button" className={btnSmallSecondaryCls} onClick={agregarFilaGol}>
            + Agregar gol
          </button>

          <label className={labelCls}>Árbitro</label>
          <input className={inputCls} value={form.arbitro_nombre} onChange={(e) => setForm({ ...form, arbitro_nombre: e.target.value })} />
          <label className={labelCls}>Informe del árbitro</label>
          <textarea
            className={`${inputCls} min-h-[70px]`}
            placeholder="Resumen del partido, observaciones, etc."
            value={form.informe_arbitro}
            onChange={(e) => setForm({ ...form, informe_arbitro: e.target.value })}
          />
          <label className={labelCls}>Incidencias (tarjetas, expulsiones, otros)</label>
          <textarea className={`${inputCls} min-h-[70px]`} value={form.incidencias} onChange={(e) => setForm({ ...form, incidencias: e.target.value })} />

          {/* sticky en mobile: el formulario es largo (goleadores, informe,
              incidencias) y sin esto había que scrollear todo de vuelta
              para llegar al botón de guardar parado en la cancha */}
          <div className="flex gap-2.5 sticky bottom-0 bg-white/95 backdrop-blur-sm py-3 -mx-5.5 px-5.5 sm:static sm:bg-transparent sm:backdrop-blur-none sm:py-0 sm:mx-0 sm:px-0">
            <button type="submit" disabled={guardando} className={`${btnCls} mt-0!`}>
              {guardando ? "Guardando…" : "Guardar partido"}
            </button>
            {form.id && (
              <button type="button" className={`${btnSecondaryCls} mt-0!`} onClick={limpiarForm}>
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </div>

      <div className={panelCls}>
        <h2 className="text-lg m-0 mb-4 text-tms-teal-dark font-bold">Partidos</h2>
        <div className="overflow-x-auto">
          <table className={tableCls}>
            <thead>
              <tr>
                <th className={thCls}>Jornada</th>
                <th className={thCls}>Fecha</th>
                <th className={thCls}>Partido</th>
                <th className={thCls}>Marcador</th>
                <th className={thCls}>Estado</th>
                <th className={thCls}></th>
              </tr>
            </thead>
            <tbody>
              {partidos === null && (
                <tr>
                  <td className={tdCls} colSpan={6}>Cargando…</td>
                </tr>
              )}
              {partidos?.length === 0 && (
                <tr>
                  <td className={tdCls} colSpan={6}>Todavía no hay partidos cargados.</td>
                </tr>
              )}
              {partidos?.map((p) => (
                <tr key={p.id}>
                  <td className={tdCls}>{p.jornada}</td>
                  <td className={tdCls}>{p.fecha}</td>
                  <td className={tdCls}>
                    {p.local?.nombre || "?"} vs {p.visitante?.nombre || "?"}
                  </td>
                  <td className={tdCls}>{p.estado === "Jugado" ? `${p.goles_local} - ${p.goles_visitante}` : "—"}</td>
                  <td className={tdCls}>{p.estado}</td>
                  <td className={tdCls}>
                    <div className="flex flex-wrap gap-2">
                      <button className={btnSmallSecondaryCls} onClick={() => editar(p)}>
                        Editar
                      </button>
                      <button className={btnDangerCls} onClick={() => eliminar(p)}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
