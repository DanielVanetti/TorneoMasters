import AdminHeader from "@/components/admin/AdminHeader";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminHeader />
      <main className="max-w-[1100px] mx-auto px-5 py-7 pb-16">{children}</main>
    </>
  );
}
