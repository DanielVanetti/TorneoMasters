import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getPosiciones, getProximosPartidos, getGoleadores } from "@/lib/queries";

export const revalidate = 30;

export default async function InicioPage() {
  const [teams, fixtures, scorers] = await Promise.all([
    getPosiciones(),
    getProximosPartidos(3),
    getGoleadores(),
  ]);

  const top5 = teams.slice(0, 5);
  const leader = teams[0];
  const topScorerGoals = scorers[0] ? scorers[0].goals : null;

  return (
    <>
      <Nav current="inicio" />

      <div
        className="relative overflow-hidden px-6 py-10 sm:px-12 sm:py-14"
        style={{ background: "linear-gradient(135deg,#0A4652 0%,#0E5C6B 55%,#2F7D4F 100%)" }}
      >
        <div className="absolute -right-16 -top-10 w-[340px] h-[340px] rounded-full bg-tms-gold/10" />
        <div className="max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-7 md:gap-10 items-center relative z-2">
          <div>
            <div className="inline-flex bg-tms-gold text-[#3A2408] font-body font-extrabold tracking-wide text-[13px] px-3.5 py-1.5 rounded uppercase mb-4">
              Categoría Máster · +50 años
            </div>
            <h1 className="font-display text-tms-cream text-[36px] sm:text-[46px] md:text-[70px] leading-[0.95] m-0">
              TORNEO MÁSTER
              <br />
              <span className="text-tms-gold">SANTA CRUZ</span>
            </h1>
            <p className="font-body text-tms-cream/85 text-lg max-w-[520px] my-4.5">
              Sabana, tradición y comunidad. Equipos de Santa Cruz compitiendo jornada a jornada por el título de este año.
            </p>
            <div className="flex flex-col sm:flex-row gap-3.5">
              <Link
                href="/calendario"
                className="bg-tms-orange text-tms-cream font-extrabold no-underline px-6.5 py-3.5 rounded font-body text-base uppercase text-center"
              >
                Próxima jornada
              </Link>
              <Link
                href="/equipos"
                className="bg-transparent border-2 border-tms-cream/60 text-tms-cream font-extrabold no-underline px-6.5 py-3 rounded font-body text-base uppercase text-center"
              >
                Los equipos
              </Link>
            </div>
          </div>
          <div
            className="h-[200px] md:h-[320px] flex items-center justify-center order-first md:order-none"
            style={{
              clipPath: "polygon(12% 0,100% 0,100% 100%,0 100%)",
              background: "repeating-linear-gradient(70deg,#C97B2E,#C97B2E 24px,#A6452B 24px,#A6452B 48px)",
            }}
          >
            <span className="font-mono text-tms-cream/60 text-[13px] -rotate-[8deg]">FOTO: cancha / sabana, Santa Cruz</span>
          </div>
        </div>
      </div>

      <div className="bg-tms-cream px-4 sm:px-12">
        <div className="max-w-[1240px] mx-auto -mt-8 grid grid-cols-2 md:grid-cols-4 bg-tms-teal-dark rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.2)] relative z-3">
          {[
            { value: teams.length || "—", label: "Equipos" },
            { value: fixtures[0] ? fixtures[0].jornada : "—", label: "Jornada actual" },
            { value: topScorerGoals ?? "—", label: "Goles del líder" },
            { value: leader ? leader.pts : "—", label: "Pts. del líder" },
          ].map((s, i) => (
            <div key={i} className="p-5 text-center border-b sm:border-b-0 sm:border-r border-tms-cream/15 last:border-0">
              <div className="font-display text-tms-gold text-[30px]">{s.value}</div>
              <div className="font-body text-tms-cream/75 text-xs uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="max-w-[1240px] mx-auto py-9 sm:py-11 grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-7 sm:gap-9">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-1.5 h-6 bg-tms-orange rounded-sm" />
              <h2 className="font-display text-tms-teal-dark text-2xl sm:text-[26px] m-0">PRÓXIMOS PARTIDOS</h2>
            </div>
            {fixtures.length > 0 ? (
              fixtures.map((m, i) => (
                <div key={i} className="flex items-center gap-2.5 sm:gap-4 py-3.5 border-b border-tms-ink/10">
                  <div className="font-body font-extrabold text-tms-teal-dark text-[13px] sm:text-[15px] w-[86px] sm:w-[150px]">
                    {m.date}
                    <br />
                    <span className="text-tms-orange">{m.time}</span>
                  </div>
                  <div className="flex-1 font-body font-bold text-base sm:text-[17px] text-tms-ink">
                    {m.home} <span className="text-tms-ink/40">vs</span> {m.away}
                  </div>
                  <div className="hidden sm:block font-mono text-xs text-tms-ink/50">{m.venue}</div>
                </div>
              ))
            ) : (
              <div className="py-7.5 px-2.5 text-tms-ink/45 text-[14.5px]">Aún no hay partidos programados. Próximamente.</div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-1.5 h-6 bg-tms-gold rounded-sm" />
              <h2 className="font-display text-tms-teal-dark text-2xl sm:text-[26px] m-0">TOP 5</h2>
            </div>
            {top5.length > 0 ? (
              <div className="bg-tms-teal-dark rounded-lg overflow-hidden">
                {top5.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-tms-cream/10 last:border-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: t.color || "#0E5C6B" }} />
                    <span className="flex-1 font-body font-bold text-tms-cream text-[15px]">{t.name}</span>
                    <span className="font-display text-tms-cream text-[17px]">{t.pts}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-tms-teal-dark rounded-lg py-7.5 px-4 text-center text-tms-cream/55 text-[14.5px]">
                Aún no hay tabla de posiciones.
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
