import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { getGoleadores } from "@/lib/queries";

export const revalidate = 30;

const MEDALS = [
  { bg: "linear-gradient(135deg,#D9A62E,#C97B2E)", medalColor: "#3A2408", medalLabel: "1º LUGAR" },
  { bg: "linear-gradient(135deg,#8a97a3,#5c6b78)", medalColor: "#eee", medalLabel: "2º LUGAR" },
  { bg: "linear-gradient(135deg,#A6452B,#7a3220)", medalColor: "#f3ddd2", medalLabel: "3º LUGAR" },
];

export default async function GoleadoresPage() {
  const scorers = await getGoleadores();
  const podium = scorers.slice(0, 3).map((s, i) => ({ ...s, ...MEDALS[i] }));

  return (
    <>
      <Nav current="goleadores" />
      <PageHeader title="TABLA DE GOLEADORES" subtitle="Se actualiza automáticamente con cada gol registrado" />

      <div className="max-w-[1240px] mx-auto px-4 py-6 sm:px-12 sm:py-9 sm:pb-[60px]">
        {scorers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 mb-8">
              {podium.map((p) => (
                <div key={p.name} className="rounded-[10px] p-6 px-5 text-center shadow-[0_4px_14px_rgba(0,0,0,0.1)]" style={{ background: p.bg }}>
                  <div className="font-display text-[15px] tracking-wide" style={{ color: p.medalColor }}>{p.medalLabel}</div>
                  <div className="w-16 h-16 rounded-full bg-white/25 mx-auto my-3 flex items-center justify-center font-mono text-[11px] text-white/70">
                    FOTO
                  </div>
                  <div className="font-body font-extrabold text-lg text-white">{p.name}</div>
                  <div className="font-body text-sm text-white/80 mt-0.5">{p.team}</div>
                  <div className="font-display text-4xl text-white mt-2">
                    {p.goals}
                    <span className="text-sm font-body font-semibold"> goles</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto rounded-lg shadow-[0_4px_18px_rgba(0,0,0,0.08)]">
              <table className="w-full border-collapse font-body bg-white">
                <thead>
                  <tr className="bg-tms-teal text-tms-cream">
                    <th className="p-2 sm:p-3 text-left text-[12px] sm:text-[13px] tracking-wide uppercase">#</th>
                    <th className="p-2 sm:p-3 text-left text-[12px] sm:text-[13px] tracking-wide uppercase">Jugador</th>
                    <th className="p-2 sm:p-3 text-left text-[12px] sm:text-[13px] tracking-wide uppercase">Equipo</th>
                    <th className="p-2 sm:p-3 text-[12px] sm:text-[13px] tracking-wide uppercase">Goles</th>
                  </tr>
                </thead>
                <tbody>
                  {scorers.map((s, i) => (
                    <tr key={i} className={i % 2 === 1 ? "bg-tms-teal/[0.045]" : "bg-white"}>
                      <td className="p-2 sm:p-2.5 font-display text-[#8a7a68] text-[15px]">{i + 1}</td>
                      <td className="p-2 sm:p-2.5 font-bold text-tms-ink text-[15.5px]">{s.name}</td>
                      <td className="p-2 sm:p-2.5 text-[#3d3025]">{s.team}</td>
                      <td className="p-2 sm:p-2.5 text-center font-display text-[17px] text-tms-teal-dark">{s.goals}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <EmptyState>Aún no hay goles registrados en el torneo.</EmptyState>
        )}
      </div>

      <Footer />
    </>
  );
}
