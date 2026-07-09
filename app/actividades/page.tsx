import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import Carousel from "@/components/Carousel";
import { getActividades } from "@/lib/queries";

export const revalidate = 30;

export default async function ActividadesPage() {
  const grupos = await getActividades();

  return (
    <>
      <Nav current="actividades" />
      <PageHeader title="ACTIVIDADES" subtitle="Fotos de partidos y actividades del torneo" />

      <div className="max-w-[1240px] mx-auto px-4 py-6 sm:px-12 sm:py-9 sm:pb-[60px]">
        {grupos.length === 0 && <EmptyState>Todavía no hay fotos publicadas. Volvé pronto.</EmptyState>}
        <div className="flex flex-col gap-9">
          {grupos.map((g) => (
            <div key={g.key}>
              <Carousel fotos={g.fotos} />
              <div className="mt-3">
                <div className="font-body font-extrabold text-tms-ink text-[15px]">{g.titulo}</div>
                <div className="font-body text-tms-ink/55 text-[13px]">{g.subtitulo}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}
