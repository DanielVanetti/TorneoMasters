"use client";

import { useEffect, useState } from "react";
import { contarPartidosPendientes, sincronizarPartidosPendientes } from "@/lib/offline-queue";

// Banner global (vive en el layout del admin, no solo en /admin/partidos)
// porque el admin puede recuperar señal en cualquier pantalla, no
// necesariamente en la de Partidos.
export default function PendientesPartidos() {
  const [pendientes, setPendientes] = useState(0);
  const [sincronizando, setSincronizando] = useState(false);

  useEffect(() => {
    async function sincronizar() {
      if (contarPartidosPendientes() === 0) {
        setPendientes(0);
        return;
      }
      setSincronizando(true);
      const { enviados, errores } = await sincronizarPartidosPendientes();
      setSincronizando(false);
      setPendientes(contarPartidosPendientes());
      if (enviados > 0) {
        window.dispatchEvent(new Event("tms:partidos-sincronizados"));
      }
      if (errores.length > 0) {
        alert(`${errores.length} partido(s) guardado(s) sin conexión no se pudieron enviar:\n\n${errores.join("\n")}`);
      }
    }

    setPendientes(contarPartidosPendientes());
    sincronizar();
    window.addEventListener("online", sincronizar);
    return () => window.removeEventListener("online", sincronizar);
  }, []);

  if (pendientes === 0) return null;

  return (
    <div className="bg-tms-gold text-[#3A2408] text-[13.5px] font-bold px-4 py-2.5 text-center" role="status">
      {sincronizando
        ? "Enviando partidos guardados sin conexión…"
        : `${pendientes} partido${pendientes === 1 ? "" : "s"} guardado${pendientes === 1 ? "" : "s"} sin conexión — se ${
            pendientes === 1 ? "va" : "van"
          } a enviar solo${pendientes === 1 ? "" : "s"} apenas vuelva la señal.`}
    </div>
  );
}
