import Image from "next/image";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { getGaleria } from "@/lib/queries";

export const revalidate = 30;

export default async function GaleriaPage() {
  const fotos = await getGaleria();

  return (
    <>
      <Nav current="galeria" />
      <PageHeader title="GALERÍA" subtitle="Fotos de partidos y actividades del torneo" />

      <div className="max-w-[1240px] mx-auto px-4 py-6 sm:px-12 sm:py-9 sm:pb-[60px]">
        {fotos.length === 0 && <EmptyState>Todavía no hay fotos publicadas. Volvé pronto.</EmptyState>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4.5">
          {fotos.map((f) => (
            <div key={f.id} className="bg-white rounded-[10px] overflow-hidden shadow-[0_4px_14px_rgba(0,0,0,0.08)]">
              <div className="w-full aspect-[4/3] bg-[#e7ddc8] overflow-hidden relative">
                <Image src={f.url} alt={f.titulo || ""} fill className="object-cover" sizes="(max-width:640px) 100vw, (max-width:768px) 50vw, 33vw" />
              </div>
              {f.titulo && (
                <div className="px-3.5 py-3">
                  <div className="font-body font-bold text-[14.5px] text-tms-ink">{f.titulo}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}
