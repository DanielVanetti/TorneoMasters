"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { llamarFuncion } from "@/lib/admin-client";
import Mensaje from "@/components/admin/Mensaje";
import { panelCls, labelCls, inputCls, btnCls } from "@/lib/admin-ui";

export default function ReglamentoAdminPage() {
  const [reqTitulo, setReqTitulo] = useState("Requisitos para participar");
  const [reqContenido, setReqContenido] = useState("");
  const [regTitulo, setRegTitulo] = useState("Reglamento del torneo");
  const [regContenido, setRegContenido] = useState("");
  const [guardandoReq, setGuardandoReq] = useState(false);
  const [guardandoReg, setGuardandoReg] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: "ok" | "error" } | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("contenido_paginas").select("clave, titulo, contenido");
      if (error) {
        setMensaje({ texto: `Error cargando contenido: ${error.message}`, tipo: "error" });
        return;
      }
      const porClave: Record<string, { titulo: string | null; contenido: string | null }> = {};
      (data || []).forEach((row) => {
        porClave[row.clave] = row;
      });
      if (porClave.requisitos) {
        setReqTitulo(porClave.requisitos.titulo || "Requisitos para participar");
        setReqContenido(porClave.requisitos.contenido || "");
      }
      if (porClave.reglamento) {
        setRegTitulo(porClave.reglamento.titulo || "Reglamento del torneo");
        setRegContenido(porClave.reglamento.contenido || "");
      }
    })();
  }, []);

  async function guardar(clave: "requisitos" | "reglamento", titulo: string, contenido: string, setGuardando: (v: boolean) => void) {
    setMensaje(null);
    setGuardando(true);
    try {
      await llamarFuncion("guardar-contenido", { clave, titulo, contenido });
      setMensaje({ texto: "Guardado correctamente.", tipo: "ok" });
    } catch (err) {
      setMensaje({ texto: err instanceof Error ? err.message : String(err), tipo: "error" });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl m-0 mb-1.5 text-tms-teal-dark font-bold">Reglamento</h1>
      <p className="text-tms-ink/60 m-0 mb-6 text-[15px]">Este texto se publica tal cual en la página pública de Reglamento.</p>
      {mensaje && <Mensaje texto={mensaje.texto} tipo={mensaje.tipo} />}

      <div className={panelCls}>
        <h2 className="text-lg m-0 mb-4 text-tms-teal-dark font-bold">Requisitos para participar</h2>
        <label className={labelCls}>Título</label>
        <input className={inputCls} value={reqTitulo} onChange={(e) => setReqTitulo(e.target.value)} />
        <label className={labelCls}>Contenido</label>
        <textarea className={`${inputCls} min-h-[220px]`} value={reqContenido} onChange={(e) => setReqContenido(e.target.value)} />
        <button type="button" disabled={guardandoReq} className={btnCls} onClick={() => guardar("requisitos", reqTitulo, reqContenido, setGuardandoReq)}>
          {guardandoReq ? "Guardando…" : "Guardar requisitos"}
        </button>
      </div>

      <div className={panelCls}>
        <h2 className="text-lg m-0 mb-4 text-tms-teal-dark font-bold">Reglamento del torneo</h2>
        <label className={labelCls}>Título</label>
        <input className={inputCls} value={regTitulo} onChange={(e) => setRegTitulo(e.target.value)} />
        <label className={labelCls}>Contenido</label>
        <textarea className={`${inputCls} min-h-[280px]`} value={regContenido} onChange={(e) => setRegContenido(e.target.value)} />
        <button type="button" disabled={guardandoReg} className={btnCls} onClick={() => guardar("reglamento", regTitulo, regContenido, setGuardandoReg)}>
          {guardandoReg ? "Guardando…" : "Guardar reglamento"}
        </button>
      </div>
    </>
  );
}
