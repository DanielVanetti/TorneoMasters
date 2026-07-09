import Nav from "@/components/Nav";
import PageHeader from "@/components/PageHeader";
import EquiposGrid from "@/components/EquiposGrid";
import PrintButton from "@/components/PrintButton";
import { getPosiciones, getJugadores } from "@/lib/queries";

export const revalidate = 30;

export default async function EquiposImprimirPage() {
  const [teams, players] = await Promise.all([getPosiciones(), getJugadores()]);

  return (
    <>
      <div className="print:hidden">
        <Nav current="equipos" />
      </div>
      <PageHeader title="EQUIPOS" subtitle="Hacé clic en un equipo para ver su plantel" />
      <div className="max-w-[1240px] mx-auto px-4 py-6 sm:px-12 sm:py-9 sm:pb-[60px]">
        <div className="flex justify-end mb-5 print:hidden">
          <PrintButton />
        </div>
        <EquiposGrid teams={teams} players={players} interactive={false} />
      </div>
    </>
  );
}
