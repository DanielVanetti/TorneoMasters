"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { llamarFuncion, fileToBase64 } from "@/lib/admin-client";
import Mensaje from "@/components/admin/Mensaje";
import { panelCls, labelCls, inputCls, btnCls, btnSecondaryCls, btnDangerCls, btnSmallSecondaryCls, formRowCls, tableCls, thCls, tdCls } from "@/lib/admin-ui";

type Equipo = { id: string; nombre: string };
type Jugador = {
  id: string;
  nombre: string;
  numero: number | null;
  posicion: string | null;
  fecha_nacimiento: string | null;
  foto_url: string | null;
  equipo_id: string;
  equipos?: { nombre: string } | null;
};

const VACIO = { id: "", equipo_id: "", nombre: "", numero: "", posicion: "", fecha_nacimiento: "" };

export default function JugadoresAdminPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [jugadores, setJugadores] = useState<Jugador[] | null>(null);
  const [filtroEquipo, setFiltroEquipo] = useState("");
  const [form, setForm] = useState(VACIO);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoUrlActual, setFotoUrlActual] = useState<string | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: "ok" | "error" } | null>(null);
  const formTopRef = useRef<HTMLDivElement>(null);

  async function cargarEquipos() {
    const supabase = createClient();
    const { data, error } = await supabase.from("equipos").select("id, nombre").order("nombre");
    if (!error) setEquipos(data || []);
  }

  async function cargarJugadores() {
    const supabase = createClient();
    let query = supabase.from("jugadores").select("*, equipos(nombre)").order("nombre");
    if (filtroEquipo) query = query.eq("equipo_id", filtroEquipo);
    const { data, error } = await query;
    if (error) {
      setMensaje({ texto: `Error: ${error.message}`, tipo: "error" });
      return;
    }
    setJugadores((data as unknown as Jugador[]) || []);
  }

  useEffect(() => {
    cargarEquipos();
  }, []);
  useEffect(() => {
    cargarJugadores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEquipo]);

  function limpiarForm() {
    setForm(VACIO);
    setFotoFile(null);
    setFotoUrlActual(null);
    setFotoPreview(null);
  }

  function editar(j: Jugador) {
    setForm({
      id: j.id,
      equipo_id: j.equipo_id || "",
      nombre: j.nombre || "",
      numero: j.numero != null ? String(j.numero) : "",
      posicion: j.posicion || "",
      fecha_nacimiento: j.fecha_nacimiento || "",
    });
    setFotoUrlActual(j.foto_url || null);
    setFotoPreview(j.foto_url || null);
    setFotoFile(null);
    formTopRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function eliminar(j: Jugador) {
    if (!confirm(`¿Eliminar a "${j.nombre}"?`)) return;
    try {
      await llamarFuncion("eliminar-jugador", { id: j.id });
      cargarJugadores();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setMensaje(null);
    setGuardando(true);
    try {
      let fotoUrl = fotoUrlActual;
      if (fotoFile) {
        const { base64, contentType, filename } = await fileToBase64(fotoFile);
        const res = await llamarFuncion("subir-archivo", { archivo_base64: base64, nombre_archivo: filename, content_type: contentType, carpeta: "jugadores" });
        fotoUrl = res.url as string;
      }
      await llamarFuncion("guardar-jugador", {
        id: form.id || undefined,
        equipo_id: form.equipo_id,
        nombre: form.nombre,
        numero: form.numero || null,
        posicion: form.posicion,
        fecha_nacimiento: form.fecha_nacimiento || null,
        foto_url: fotoUrl,
      });
      setMensaje({ texto: "Jugador guardado correctamente.", tipo: "ok" });
      limpiarForm();
      cargarJugadores();
    } catch (err) {
      setMensaje({ texto: err instanceof Error ? err.message : String(err), tipo: "error" });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl m-0 mb-1.5 text-tms-teal-dark font-bold">Jugadores</h1>
      <p className="text-tms-ink/60 m-0 mb-6 text-[15px]">Agregá o editá jugadores de cada plantel.</p>

      <div className={panelCls} ref={formTopRef}>
        <h2 className="text-lg m-0 mb-4 text-tms-teal-dark font-bold">{form.id ? `Editando: ${form.nombre}` : "Nuevo jugador"}</h2>
        {mensaje && <Mensaje texto={mensaje.texto} tipo={mensaje.tipo} />}
        <form onSubmit={handleSubmit}>
          <label className={labelCls}>Equipo</label>
          <select className={inputCls} required value={form.equipo_id} onChange={(e) => setForm({ ...form, equipo_id: e.target.value })}>
            <option value="">Elegí un equipo</option>
            {equipos.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>

          <div className={formRowCls}>
            <div>
              <label className={labelCls}>Nombre completo</label>
              <input className={inputCls} required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Número</label>
              <input type="number" min={0} max={99} className={inputCls} value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} />
            </div>
          </div>
          <div className={formRowCls}>
            <div>
              <label className={labelCls}>Posición</label>
              <select className={inputCls} value={form.posicion} onChange={(e) => setForm({ ...form, posicion: e.target.value })}>
                <option value="">—</option>
                <option>Portero</option>
                <option>Defensa</option>
                <option>Mediocampo</option>
                <option>Delantero</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Fecha de nacimiento</label>
              <input type="date" className={inputCls} value={form.fecha_nacimiento} onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })} />
            </div>
          </div>

          <label className={labelCls}>Foto (opcional)</label>
          <input
            type="file"
            accept="image/*"
            className={inputCls}
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              setFotoFile(f);
              if (f) setFotoPreview(URL.createObjectURL(f));
            }}
          />
          {fotoPreview && <img src={fotoPreview} alt="" className="w-[90px] h-[90px] rounded-[10px] object-cover mt-2" />}

          <div className="flex gap-2.5">
            <button type="submit" disabled={guardando} className={btnCls}>
              {guardando ? "Guardando…" : "Guardar jugador"}
            </button>
            {form.id && (
              <button type="button" className={btnSecondaryCls} onClick={limpiarForm}>
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </div>

      <div className={panelCls}>
        <h2 className="text-lg m-0 mb-4 text-tms-teal-dark font-bold">Jugadores existentes</h2>
        <label className={labelCls}>Filtrar por equipo</label>
        <select className={inputCls} value={filtroEquipo} onChange={(e) => setFiltroEquipo(e.target.value)}>
          <option value="">Todos los equipos</option>
          {equipos.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre}
            </option>
          ))}
        </select>
        <div className="overflow-x-auto mt-4">
          <table className={tableCls}>
            <thead>
              <tr>
                <th className={thCls}>Jugador</th>
                <th className={thCls}>Equipo</th>
                <th className={thCls}>#</th>
                <th className={thCls}>Posición</th>
                <th className={thCls}></th>
              </tr>
            </thead>
            <tbody>
              {jugadores === null && (
                <tr>
                  <td className={tdCls} colSpan={5}>Cargando…</td>
                </tr>
              )}
              {jugadores?.length === 0 && (
                <tr>
                  <td className={tdCls} colSpan={5}>No hay jugadores para mostrar.</td>
                </tr>
              )}
              {jugadores?.map((j) => (
                <tr key={j.id}>
                  <td className={tdCls}>{j.nombre}</td>
                  <td className={tdCls}>{j.equipos?.nombre || ""}</td>
                  <td className={tdCls}>{j.numero ?? ""}</td>
                  <td className={tdCls}>{j.posicion || ""}</td>
                  <td className={`${tdCls} whitespace-nowrap`}>
                    <button className={`${btnSmallSecondaryCls} mr-1.5`} onClick={() => editar(j)}>
                      Editar
                    </button>
                    <button className={btnDangerCls} onClick={() => eliminar(j)}>
                      Eliminar
                    </button>
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
