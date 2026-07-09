import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import { getContenido } from "@/lib/queries";

export const revalidate = 30;

function Seccion({ accent, titulo, texto }: { accent: string; titulo: string; texto: string }) {
  return (
    <div className="bg-white rounded-[10px] shadow-[0_4px_14px_rgba(0,0,0,0.06)] p-6 sm:p-8 mb-6 last:mb-0">
      <div className="flex items-center gap-2.5 mb-3.5">
        <div className="w-1.5 h-6 rounded-sm" style={{ background: accent }} />
        <h2 className="font-display text-tms-teal-dark text-[22px] m-0">{titulo}</h2>
      </div>
      {texto ? (
        <p className="whitespace-pre-wrap text-[15.5px] leading-relaxed text-[#3d3025] m-0">{texto}</p>
      ) : (
        <p className="text-tms-ink/45 text-[15px] m-0">Esta sección se publicará pronto.</p>
      )}
    </div>
  );
}

export default async function ReglamentoPage() {
  const { requisitos, reglamento } = await getContenido();

  return (
    <>
      <Nav current="reglamento" />
      <PageHeader title="REGLAMENTO" subtitle="Requisitos para participar y reglamento oficial del torneo" />

      <div className="max-w-[900px] mx-auto px-4 py-6 sm:px-12 sm:py-9 sm:pb-[60px]">
        <Seccion
          accent="#C97B2E"
          titulo={requisitos?.titulo || "Requisitos para participar"}
          texto={(requisitos?.contenido || "").trim()}
        />
        <Seccion
          accent="#F2C94C"
          titulo={reglamento?.titulo || "Reglamento del torneo"}
          texto={(reglamento?.contenido || "").trim()}
        />
      </div>

      <Footer />
    </>
  );
}
