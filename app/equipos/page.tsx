import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import EquiposGrid from "@/components/EquiposGrid";
import { getPosiciones, getJugadores } from "@/lib/queries";

export const revalidate = 30;

export default async function EquiposPage() {
  const [teams, players] = await Promise.all([getPosiciones(), getJugadores()]);

  return (
    <>
      <Nav current="equipos" />
      <PageHeader title="EQUIPOS" subtitle="Hacé clic en un equipo para ver su plantel" />
      <div className="max-w-[1240px] mx-auto px-4 py-6 sm:px-12 sm:py-9 sm:pb-[60px]">
        <EquiposGrid teams={teams} players={players} />
      </div>
      <Footer />
    </>
  );
}
