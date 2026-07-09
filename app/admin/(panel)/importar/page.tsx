"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { llamarFuncion } from "@/lib/admin-client";
import Mensaje from "@/components/admin/Mensaje";
import { panelCls, inputCls, btnCls } from "@/lib/admin-ui";

type FilaEquipo = { nombre: string; ciudad?: string; color?: string };
type FilaJugador = { nombre: string; equipo?: string; numero?: number; posicion?: string };

function normalizarClaves(fila: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const k in fila) out[k.trim().toLowerCase()] = fila[k];
  return out;
}

function buscarHoja(workbook: XLSX.WorkBook, nombre: string) {
  const clave = Object.keys(workbook.Sheets).find((n) => n.trim().toLowerCase() === nombre);
  return clave ? XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[clave]) : [];
}

export default function ImportarAdminPage() {
  const [preview, setPreview] = useState("");
  const [parsed, setParsed] = useState<{ equipos: FilaEquipo[]; jugadores: FilaJugador[] }>({ equipos: [], jugadores: [] });
  const [puedeImportar, setPuedeImportar] = useState(false);
  const [importando, setImportando] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: "ok" | "error" } | null>(null);

  function handleArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    setMensaje(null);
    setParsed({ equipos: [], jugadores: [] });
    setPuedeImportar(false);
    setPreview("");
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const workbook = XLSX.read(ev.target?.result, { type: "array" });
        const filasEquipos = buscarHoja(workbook, "equipos").map(normalizarClaves);
        const filasJugadores = buscarHoja(workbook, "jugadores").map(normalizarClaves);

        const equipos = filasEquipos.map((f) => ({ nombre: String(f.nombre || ""), ciudad: f.ciudad as string, color: f.color as string }));
        const jugadores = filasJugadores.map((f) => ({
          nombre: String(f.nombre || ""),
          equipo: f.equipo as string,
          numero: f.numero as number,
          posicion: f.posicion as string,
        }));
        setParsed({ equipos, jugadores });

        if (!equipos.length && !jugadores.length) {
          setPreview("No se encontraron hojas 'Equipos' o 'Jugadores' con datos en este archivo.");
          return;
        }
        setPreview(`Se encontraron ${equipos.length} equipo(s) y ${jugadores.length} jugador(es) en el archivo. Revisá que sean los correctos antes de importar.`);
        setPuedeImportar(true);
      } catch (err) {
        setPreview(`No se pudo leer el archivo: ${err instanceof Error ? err.message : String(err)}`);
      }
    };
    reader.readAsArrayBuffer(archivo);
  }

  async function handleImportar() {
    setMensaje(null);
    setPuedeImportar(false);
    setImportando(true);
    try {
      const res = await llamarFuncion("importar-datos", parsed);
      const r = res.resultado as { equiposCreados: number; jugadoresCreados: number; errores: string[] };
      let texto = `Listo: ${r.equiposCreados} equipo(s) y ${r.jugadoresCreados} jugador(es) guardados.`;
      if (r.errores.length) texto += ` ${r.errores.length} fila(s) con problemas: ${r.errores.slice(0, 5).join(" | ")}`;
      setMensaje({ texto, tipo: r.errores.length ? "error" : "ok" });
    } catch (err) {
      setMensaje({ texto: err instanceof Error ? err.message : String(err), tipo: "error" });
    } finally {
      setImportando(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl m-0 mb-1.5 text-tms-teal-dark font-bold">Carga masiva desde Excel</h1>
      <p className="text-tms-ink/60 m-0 mb-6 text-[15px]">
        Subí un .xlsx con hojas llamadas <strong>Equipos</strong> y/o <strong>Jugadores</strong>.
      </p>

      <div className={panelCls}>
        <h2 className="text-lg m-0 mb-4 text-tms-teal-dark font-bold">Formato esperado</h2>
        <p className="text-[14px] text-tms-ink/70">
          Hoja <strong>Equipos</strong>: columnas <code>nombre</code>, <code>ciudad</code>, <code>color</code> (opcional, ej: #0E5C6B).
          <br />
          Hoja <strong>Jugadores</strong>: columnas <code>nombre</code>, <code>equipo</code> (debe coincidir con el nombre del equipo), <code>numero</code>, <code>posicion</code>.
          <br />
          Los equipos que ya existan (mismo nombre) no se duplican, solo se actualizan.
        </p>
      </div>

      <div className={panelCls}>
        <h2 className="text-lg m-0 mb-4 text-tms-teal-dark font-bold">Subir archivo</h2>
        {mensaje && <Mensaje texto={mensaje.texto} tipo={mensaje.tipo} />}
        <label className="block font-bold text-[13px] uppercase tracking-wide text-tms-ink/65 mb-1.5">Archivo .xlsx o .csv</label>
        <input type="file" accept=".xlsx,.xls,.csv" className={inputCls} onChange={handleArchivo} />
        {preview && <div className="mt-4 text-[14.5px] text-tms-ink/70">{preview}</div>}
        <button type="button" disabled={!puedeImportar || importando} className={btnCls} onClick={handleImportar}>
          {importando ? "Importando…" : "Importar"}
        </button>
      </div>
    </>
  );
}
