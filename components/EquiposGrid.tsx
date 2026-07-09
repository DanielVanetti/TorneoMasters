"use client";

import { useState } from "react";
import EmptyState from "@/components/EmptyState";
import { initials } from "@/lib/format";
import type { Equipo, Jugador } from "@/lib/queries";

export default function EquiposGrid({
  teams,
  players,
  interactive = true,
}: {
  teams: Equipo[];
  players: Jugador[];
  interactive?: boolean;
}) {
  const [abiertos, setAbiertos] = useState<Set<string>>(new Set());

  if (teams.length === 0) {
    return <EmptyState>Aún no hay equipos registrados. Volvé pronto.</EmptyState>;
  }

  const ranked = teams.map((t, i) => ({ ...t, rank: i + 1, initials: initials(t.name), anchor: `roster-${t.id}` }));

  function toggle(id: string, scroll: boolean) {
    if (!interactive) return;
    setAbiertos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (scroll) {
      requestAnimationFrame(() => {
        document.getElementById(`roster-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4.5 mb-10">
        {ranked.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => toggle(t.id, true)}
            className="text-left no-underline bg-white rounded-[10px] overflow-hidden shadow-[0_4px_14px_rgba(0,0,0,0.07)] block border-0 p-0 cursor-pointer"
          >
            <div className="h-1.5" style={{ background: t.color || "#0E5C6B" }} />
            <div className="p-4.5 flex flex-col items-center text-center gap-2.5">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center font-display text-white text-base"
                style={{ background: t.color || "#0E5C6B" }}
              >
                {t.initials}
              </div>
              <div className="font-body font-extrabold text-base text-tms-ink leading-tight">{t.name}</div>
              <div className="text-[12.5px] text-tms-ink/50 font-mono">{t.city}</div>
              <div className="font-display text-tms-teal-dark text-sm">
                #{t.rank} · {t.pts} pts
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-1.5 h-6 bg-tms-orange rounded-sm" />
        <h2 className="font-display text-tms-teal-dark text-2xl sm:text-[26px] m-0">PLANTELES</h2>
        {interactive && <span className="ml-auto text-[13px] text-tms-ink/45">Tocá un equipo para ver su plantel</span>}
      </div>

      <div className="flex flex-col gap-5.5">
        {ranked.map((t) => {
          const roster = players.filter((p) => p.team === t.id);
          const abierto = !interactive || abiertos.has(t.id);
          return (
            <div key={t.id} id={t.anchor} className="scroll-mt-[90px] bg-white rounded-[10px] shadow-[0_4px_14px_rgba(0,0,0,0.06)] overflow-hidden">
              <button
                type="button"
                onClick={() => toggle(t.id, false)}
                disabled={!interactive}
                className="w-full flex items-center gap-3 px-5 py-3.5 flex-wrap border-0 text-left cursor-pointer"
                style={{ background: t.color || "#0E5C6B" }}
              >
                <span className="w-[34px] h-[34px] rounded-full bg-white/25 flex items-center justify-center font-display text-white text-[13px]">
                  {t.initials}
                </span>
                <span className="font-display text-white text-lg sm:text-[19px] tracking-wide">{t.name}</span>
                <span className="sm:ml-auto font-body text-white/85 text-[13px]">{t.city}</span>
                {interactive && (
                  <span className={`font-body text-white text-lg transition-transform ${abierto ? "rotate-180" : ""}`}>⌄</span>
                )}
              </button>
              {abierto &&
                (roster.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
                    {roster.map((p) => (
                      <div key={p.id} className="flex flex-col items-center text-center gap-2 py-4.5 px-2.5 border-b sm:border-b-0 md:border-r border-tms-ink/[0.06]">
                        <div
                          className="w-[52px] h-[52px] rounded-full flex items-center justify-center font-mono text-[9px] text-tms-ink/45"
                          style={{ background: "repeating-linear-gradient(45deg,#e7ddc8,#e7ddc8 5px,#ddd0b3 5px,#ddd0b3 10px)" }}
                        >
                          FOTO
                        </div>
                        <div className="font-body font-bold text-sm text-tms-ink">{p.name}</div>
                        <div className="flex gap-1.5 items-center">
                          <span className="font-display text-[15px] text-tms-orange">#{p.number}</span>
                          <span className="text-[11.5px] text-tms-ink/55 uppercase tracking-wide">{p.position}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-5.5 text-center text-tms-ink/45 text-[13.5px]">Todavía no hay jugadores cargados para este equipo.</div>
                ))}
            </div>
          );
        })}
      </div>
    </>
  );
}
