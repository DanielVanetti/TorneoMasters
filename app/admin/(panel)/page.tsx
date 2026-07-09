"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { panelCls, btnCls, btnSmallSecondaryCls } from "@/lib/admin-ui";

export default function DashboardPage() {
  const [stats, setStats] = useState({ equipos: "—", jugados: "—", programados: "—" });

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const [{ count: equipos }, { count: jugados }, { count: programados }] = await Promise.all([
        supabase.from("equipos").select("*", { count: "exact", head: true }),
        supabase.from("partidos").select("*", { count: "exact", head: true }).eq("estado", "Jugado"),
        supabase.from("partidos").select("*", { count: "exact", head: true }).eq("estado", "Programado"),
      ]);
      setStats({ equipos: String(equipos ?? 0), jugados: String(jugados ?? 0), programados: String(programados ?? 0) });
    })();
  }, []);

  return (
    <>
      <h1 className="text-2xl m-0 mb-1.5 text-tms-teal-dark font-bold">Panel de administración</h1>
      <p className="text-tms-ink/60 m-0 mb-6 text-[15px]">Cargá resultados, jugadores, equipos y fotos del torneo.</p>

      <div className={`${panelCls} grid grid-cols-3 gap-4 text-center`}>
        {[
          { label: "Equipos", value: stats.equipos },
          { label: "Partidos jugados", value: stats.jugados },
          { label: "Partidos por jugar", value: stats.programados },
        ].map((s) => (
          <div key={s.label}>
            <div className="text-[30px] font-extrabold text-tms-teal-dark">{s.value}</div>
            <div className="text-tms-ink/55 text-[13px] uppercase">{s.label}</div>
          </div>
        ))}
      </div>

      <div className={panelCls}>
        <h2 className="text-lg m-0 mb-4 text-tms-teal-dark font-bold">Accesos rápidos</h2>
        <div className="flex gap-3 flex-wrap">
          <Link href="/admin/partidos" className={`${btnCls} mt-0!`}>
            Cargar resultado
          </Link>
          <Link href="/admin/equipos" className={`${btnSmallSecondaryCls} px-5.5! py-3! text-[15px]!`}>
            Agregar equipo
          </Link>
          <Link href="/admin/jugadores" className={`${btnSmallSecondaryCls} px-5.5! py-3! text-[15px]!`}>
            Agregar jugador
          </Link>
          <Link href="/admin/actividades" className={`${btnSmallSecondaryCls} px-5.5! py-3! text-[15px]!`}>
            Subir fotos
          </Link>
          <Link href="/admin/importar" className={`${btnSmallSecondaryCls} px-5.5! py-3! text-[15px]!`}>
            Carga masiva
          </Link>
        </div>
      </div>
    </>
  );
}
