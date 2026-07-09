import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { getPosiciones } from "@/lib/queries";

export const revalidate = 30;

const COLS = ["#", "Equipo", "PJ", "PG", "PE", "PP", "GF", "GC", "DG", "Pts"];

export default async function PosicionesPage() {
  const teams = await getPosiciones();

  return (
    <>
      <Nav current="posiciones" />
      <PageHeader title="TABLA DE POSICIONES" subtitle="Se actualiza automáticamente con cada partido jugado" />

      <div className="max-w-[1240px] mx-auto px-4 py-6 sm:px-12 sm:py-9 sm:pb-[60px]">
        {teams.length > 0 ? (
          <>
            <div className="overflow-x-auto rounded-lg shadow-[0_4px_18px_rgba(0,0,0,0.08)]">
              <table className="w-full border-collapse font-body bg-white">
                <thead>
                  <tr className="bg-tms-teal text-tms-cream">
                    {COLS.map((c, i) => (
                      <th
                        key={c}
                        className={`p-2 sm:p-3 text-[12px] sm:text-[13px] tracking-wide uppercase ${i <= 1 ? "text-left" : ""}`}
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {teams.map((t, i) => {
                    const rank = i + 1;
                    return (
                      <tr
                        key={t.id}
                        className={i % 2 === 1 ? "bg-tms-teal/[0.045]" : "bg-white"}
                        style={{ borderLeft: rank <= 4 ? "4px solid #F2C94C" : "4px solid transparent" }}
                      >
                        <td className="p-2 sm:p-2.5 font-display text-[16px]" style={{ color: rank <= 4 ? "#C97B2E" : "#8a7a68" }}>
                          {rank}
                        </td>
                        <td className="p-2 sm:p-2.5 font-bold text-tms-ink text-[15.5px]">
                          <span className="inline-flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: t.color || "#0E5C6B" }} />
                            {t.name}
                          </span>
                        </td>
                        <td className="p-2 sm:p-2.5 text-center text-[#3d3025]">{t.pj}</td>
                        <td className="p-2 sm:p-2.5 text-center text-[#3d3025]">{t.pg}</td>
                        <td className="p-2 sm:p-2.5 text-center text-[#3d3025]">{t.pe}</td>
                        <td className="p-2 sm:p-2.5 text-center text-[#3d3025]">{t.pp}</td>
                        <td className="p-2 sm:p-2.5 text-center text-[#3d3025]">{t.gf}</td>
                        <td className="p-2 sm:p-2.5 text-center text-[#3d3025]">{t.gc}</td>
                        <td className="p-2 sm:p-2.5 text-center text-[#3d3025]">{t.dg > 0 ? `+${t.dg}` : t.dg}</td>
                        <td className="p-2 sm:p-2.5 text-center font-display text-[17px] text-tms-teal-dark">{t.pts}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex gap-5 mt-4.5 text-[13px] text-tms-ink/60 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-tms-gold rounded-sm inline-block" />
                Clasifica a semifinales (top 4)
              </span>
              <span>PJ: Jugados · PG: Ganados · PE: Empatados · PP: Perdidos · GF: Goles a favor · GC: Goles en contra · DG: Diferencia de goles</span>
            </div>
          </>
        ) : (
          <EmptyState>Aún no hay partidos jugados. La tabla de posiciones se publicará cuando arranque el torneo.</EmptyState>
        )}
      </div>

      <Footer />
    </>
  );
}
