import AdminHeader from "@/components/admin/AdminHeader";
import PendientesPartidos from "@/components/admin/PendientesPartidos";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminHeader />
      <PendientesPartidos />
      <main className="max-w-[1100px] mx-auto px-5 py-7 pb-16">{children}</main>
    </>
  );
}
