"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { llamarFuncion, fileToBase64, getTemporadaActivaId } from "@/lib/admin-client";
import Mensaje from "@/components/admin/Mensaje";
import { panelCls, labelCls, inputCls, btnCls, btnSecondaryCls, btnDangerCls, btnSmallSecondaryCls, formRowCls, tableCls, thCls, tdCls } from "@/lib/admin-ui";

type Equipo = {
  id: string;
  nombre: string;
  ciudad: string | null;
  color: string | null;
  cancha_local: string | null;
  delegado: string | null;
  telefono: string | null;
  email: string | null;
  logo_url: string | null;
};

const VACIO = { id: "", nombre: "", ciudad: "", color: "#0E5C6B", cancha_local: "", delegado: "", telefono: "", email: "" };

export default function EquiposAdminPage() {
  const [equipos, setEquipos] = useState<Equipo[] | null>(null);
  const [form, setForm] = useState(VACIO);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrlActual, setLogoUrlActual] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: "ok" | "error" } | null>(null);
  const formTopRef = useRef<HTMLDivElement>(null);

  async function cargarEquipos() {
    const supabase = createClient();
    const temporadaActivaId = await getTemporadaActivaId();
    const { data, error } = await supabase
      .from("equipos")
      .select("*")
      .eq("temporada_id", temporadaActivaId)
      .order("nombre");
    if (error) {
      setMensaje({ texto: `Error cargando equipos: ${error.message}`, tipo: "error" });
      return;
    }
    setEquipos(data || []);
  }

  useEffect(() => {
    cargarEquipos();
  }, []);

  function limpiarForm() {
    setForm(VACIO);
    setLogoFile(null);
    setLogoUrlActual(null);
    setLogoPreview(null);
  }

  function editar(e: Equipo) {
    setForm({
      id: e.id,
      nombre: e.nombre || "",
      ciudad: e.ciudad || "",
      color: e.color || "#0E5C6B",
      cancha_local: e.cancha_local || "",
      delegado: e.delegado || "",
      telefono: e.telefono || "",
      email: e.email || "",
    });
    setLogoUrlActual(e.logo_url || null);
    setLogoPreview(e.logo_url || null);
    setLogoFile(null);
    formTopRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function eliminar(e: Equipo) {
    if (!confirm(`¿Eliminar el equipo "${e.nombre}"? Esto también borra sus jugadores.`)) return;
    try {
      await llamarFuncion("eliminar-equipo", { id: e.id });
      cargarEquipos();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setMensaje(null);
    setGuardando(true);
    try {
      let logoUrl = logoUrlActual;
      if (logoFile) {
        const { base64, contentType, filename } = await fileToBase64(logoFile);
        const res = await llamarFuncion("subir-archivo", { archivo_base64: base64, nombre_archivo: filename, content_type: contentType, carpeta: "equipos" });
        logoUrl = res.url as string;
      }
      await llamarFuncion("guardar-equipo", { ...form, id: form.id || undefined, logo_url: logoUrl });
      setMensaje({ texto: "Equipo guardado correctamente.", tipo: "ok" });
      limpiarForm();
      cargarEquipos();
    } catch (err) {
      setMensaje({ texto: err instanceof Error ? err.message : String(err), tipo: "error" });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl m-0 mb-1.5 text-tms-teal-dark font-bold">Equipos</h1>
      <p className="text-tms-ink/60 m-0 mb-6 text-[15px]">Agregá o editá los equipos del torneo.</p>

      <div className={panelCls} ref={formTopRef}>
        <h2 className="text-lg m-0 mb-4 text-tms-teal-dark font-bold">{form.id ? `Editando: ${form.nombre}` : "Nuevo equipo"}</h2>
        {mensaje && <Mensaje texto={mensaje.texto} tipo={mensaje.tipo} />}
        <form onSubmit={handleSubmit}>
          <div className={formRowCls}>
            <div>
              <label className={labelCls}>Nombre del equipo</label>
              <input className={inputCls} required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Ciudad / pueblo</label>
              <input className={inputCls} value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} />
            </div>
          </div>
          <div className={formRowCls}>
            <div>
              <label className={labelCls}>Color del equipo</label>
              <input type="color" className={`${inputCls} h-11 p-1`} value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Cancha local</label>
              <input className={inputCls} value={form.cancha_local} onChange={(e) => setForm({ ...form, cancha_local: e.target.value })} />
            </div>
          </div>
          <div className={formRowCls}>
            <div>
              <label className={labelCls}>Delegado</label>
              <input className={inputCls} value={form.delegado} onChange={(e) => setForm({ ...form, delegado: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Teléfono</label>
              <input className={inputCls} value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            </div>
          </div>
          <label className={labelCls}>Correo</label>
          <input type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />

          <label className={labelCls}>Logo (opcional)</label>
          <input
            type="file"
            accept="image/*"
            className={inputCls}
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              setLogoFile(f);
              if (f) setLogoPreview(URL.createObjectURL(f));
            }}
          />
          {logoPreview && <img src={logoPreview} alt="" className="w-[90px] h-[90px] rounded-[10px] object-cover mt-2" />}

          <div className="flex gap-2.5">
            <button type="submit" disabled={guardando} className={btnCls}>
              {guardando ? "Guardando…" : "Guardar equipo"}
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
        <h2 className="text-lg m-0 mb-4 text-tms-teal-dark font-bold">Equipos existentes</h2>
        <div className="overflow-x-auto">
          <table className={tableCls}>
            <thead>
              <tr>
                <th className={thCls}>Equipo</th>
                <th className={thCls}>Ciudad</th>
                <th className={thCls}>Delegado</th>
                <th className={thCls}></th>
              </tr>
            </thead>
            <tbody>
              {equipos === null && (
                <tr>
                  <td className={tdCls} colSpan={4}>Cargando…</td>
                </tr>
              )}
              {equipos?.length === 0 && (
                <tr>
                  <td className={tdCls} colSpan={4}>Todavía no hay equipos.</td>
                </tr>
              )}
              {equipos?.map((e) => (
                <tr key={e.id}>
                  <td className={tdCls}>
                    <span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ background: e.color || "#0E5C6B" }} />
                    {e.nombre}
                  </td>
                  <td className={tdCls}>{e.ciudad || ""}</td>
                  <td className={tdCls}>{e.delegado || ""}</td>
                  <td className={tdCls}>
                    <div className="flex flex-wrap gap-2">
                      <button className={btnSmallSecondaryCls} onClick={() => editar(e)}>
                        Editar
                      </button>
                      <button className={btnDangerCls} onClick={() => eliminar(e)}>
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
