"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { llamarFuncion } from "@/lib/admin-client";
import Mensaje from "@/components/admin/Mensaje";
import { panelCls, labelCls, inputCls, btnCls, btnSecondaryCls, btnDangerCls, btnSmallSecondaryCls, formRowCls, tableCls, thCls, tdCls } from "@/lib/admin-ui";

type Temporada = { id: string; nombre: string; activa: boolean; creado_en: string };

const VACIO = { id: "", nombre: "" };

export default function TemporadasAdminPage() {
  const [temporadas, setTemporadas] = useState<Temporada[] | null>(null);
  const [form, setForm] = useState(VACIO);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: "ok" | "error" } | null>(null);
  const formTopRef = useRef<HTMLDivElement>(null);

  async function cargarTemporadas() {
    const supabase = createClient();
    const { data, error } = await supabase.from("temporadas").select("*").order("creado_en", { ascending: false });
    if (error) {
      setMensaje({ texto: `Error cargando temporadas: ${error.message}`, tipo: "error" });
      return;
    }
    setTemporadas(data || []);
  }

  useEffect(() => {
    cargarTemporadas();
  }, []);

  function limpiarForm() {
    setForm(VACIO);
  }

  function editar(t: Temporada) {
    setForm({ id: t.id, nombre: t.nombre });
    formTopRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function activar(t: Temporada) {
    try {
      await llamarFuncion("activar-temporada", { id: t.id });
      setMensaje({ texto: `"${t.nombre}" es ahora la temporada activa.`, tipo: "ok" });
      cargarTemporadas();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  }

  async function eliminar(t: Temporada) {
    if (t.activa) return;
    if (!confirm(`¿Eliminar la temporada "${t.nombre}"? Solo se puede si no tiene equipos, partidos ni fotos cargados.`)) return;
    try {
      await llamarFuncion("eliminar-temporada", { id: t.id });
      cargarTemporadas();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setMensaje(null);
    setGuardando(true);
    try {
      await llamarFuncion("guardar-temporada", { ...form, id: form.id || undefined });
      setMensaje({ texto: "Temporada guardada correctamente.", tipo: "ok" });
      limpiarForm();
      cargarTemporadas();
    } catch (err) {
      setMensaje({ texto: err instanceof Error ? err.message : String(err), tipo: "error" });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl m-0 mb-1.5 text-tms-teal-dark font-bold">Temporadas</h1>
      <p className="text-tms-ink/60 m-0 mb-6 text-[15px]">
        Cada temporada tiene sus propios equipos, jugadores y partidos. El sitio público y el resto del panel solo muestran la temporada
        marcada como activa — las demás quedan archivadas, no se borra nada.
      </p>

      <div className={panelCls} ref={formTopRef}>
        <h2 className="text-lg m-0 mb-4 text-tms-teal-dark font-bold">{form.id ? `Editando: ${form.nombre}` : "Nueva temporada"}</h2>
        {mensaje && <Mensaje texto={mensaje.texto} tipo={mensaje.tipo} />}
        <form onSubmit={handleSubmit}>
          <div className={formRowCls}>
            <div>
              <label className={labelCls}>Nombre</label>
              <input
                className={inputCls}
                required
                placeholder="Ej: Temporada 2027"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2.5">
            <button type="submit" disabled={guardando} className={btnCls}>
              {guardando ? "Guardando…" : form.id ? "Guardar cambios" : "Crear temporada"}
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
        <h2 className="text-lg m-0 mb-4 text-tms-teal-dark font-bold">Temporadas existentes</h2>
        <div className="overflow-x-auto">
          <table className={tableCls}>
            <thead>
              <tr>
                <th className={thCls}>Nombre</th>
                <th className={thCls}>Estado</th>
                <th className={thCls}></th>
              </tr>
            </thead>
            <tbody>
              {temporadas === null && (
                <tr>
                  <td className={tdCls} colSpan={3}>Cargando…</td>
                </tr>
              )}
              {temporadas?.length === 0 && (
                <tr>
                  <td className={tdCls} colSpan={3}>Todavía no hay temporadas.</td>
                </tr>
              )}
              {temporadas?.map((t) => (
                <tr key={t.id}>
                  <td className={tdCls}>{t.nombre}</td>
                  <td className={tdCls}>
                    {t.activa ? (
                      <span className="inline-block bg-tms-gold text-[#3A2408] px-2.5 py-1 rounded-full text-[12px] font-bold uppercase">
                        Activa
                      </span>
                    ) : (
                      "Archivada"
                    )}
                  </td>
                  <td className={tdCls}>
                    <div className="flex flex-wrap gap-2">
                      <button className={btnSmallSecondaryCls} disabled={t.activa} onClick={() => activar(t)}>
                        Marcar como activa
                      </button>
                      <button className={btnSmallSecondaryCls} onClick={() => editar(t)}>
                        Editar
                      </button>
                      <button className={btnDangerCls} disabled={t.activa} onClick={() => eliminar(t)}>
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
