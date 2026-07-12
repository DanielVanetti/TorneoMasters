"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ITEMS = [
  { key: "dashboard", label: "Inicio", href: "/admin" },
  { key: "equipos", label: "Equipos", href: "/admin/equipos" },
  { key: "jugadores", label: "Jugadores", href: "/admin/jugadores" },
  { key: "partidos", label: "Partidos", href: "/admin/partidos" },
  { key: "actividades", label: "Actividades", href: "/admin/actividades" },
  { key: "reglamento", label: "Reglamento", href: "/admin/reglamento" },
  { key: "importar", label: "Importar", href: "/admin/importar" },
  { key: "temporadas", label: "Temporadas", href: "/admin/temporadas" },
];

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <header className="bg-tms-teal-dark border-b-4 border-tms-gold px-6 py-3.5 flex items-center gap-4 flex-wrap">
      <Link href="/admin" className="text-tms-cream font-extrabold text-lg tracking-wide no-underline">
        Admin · Torneo Máster
      </Link>
      <nav className="flex gap-1.5 flex-wrap ml-auto">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`no-underline font-bold text-[13.5px] uppercase tracking-wide px-3 py-2 rounded-md transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tms-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-tms-teal-dark motion-reduce:transition-none ${
                active ? "bg-tms-gold text-[#3A2408]" : "text-tms-cream/85 hover:bg-white/10"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={logout}
        className="bg-transparent border border-tms-cream/50 text-tms-cream px-3.5 py-2 rounded-md font-bold text-[13px] uppercase cursor-pointer transition-colors duration-200 ease-out hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tms-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-tms-teal-dark motion-reduce:transition-none"
      >
        Salir
      </button>
    </header>
  );
}
