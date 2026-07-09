import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { getProximosPartidos } from "@/lib/queries";

export const revalidate = 30;

export default async function CalendarioPage() {
  const fixtures = await getProximosPartidos();

  return (
    <>
      <Nav current="calendario" />
      <PageHeader title="PRÓXIMA JORNADA" subtitle="Partidos programados, actualizados desde el panel admin" />

      <div className="max-w-[1240px] mx-auto px-4 py-6 sm:px-12 sm:py-9 sm:pb-[60px]">
        {fixtures.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
            {fixtures.map((m, i) => (
              <div key={i} className="bg-white rounded-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.07)] overflow-hidden border-t-[5px] border-tms-orange">
                <div className="flex justify-between items-center px-4.5 py-3 bg-tms-teal/[0.06]">
                  <span className="font-body font-extrabold text-tms-teal-dark text-sm uppercase tracking-wide">{m.date}</span>
                  <span className="font-display text-tms-orange text-base">{m.time}</span>
                </div>
                <div className="py-5.5 px-4.5 flex items-center justify-center gap-4.5">
                  <span className="font-body font-extrabold text-[19px] text-tms-ink text-right flex-1">{m.home}</span>
                  <span className="font-display text-[#8a7a68] text-sm bg-tms-ink/[0.06] px-2.5 py-1 rounded-md">VS</span>
                  <span className="font-body font-extrabold text-[19px] text-tms-ink flex-1">{m.away}</span>
                </div>
                <div className="px-4.5 pb-4 text-center font-mono text-[12.5px] text-tms-ink/55">{m.venue}</div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState>Aún no hay partidos programados. Volvé pronto.</EmptyState>
        )}
      </div>

      <Footer />
    </>
  );
}
