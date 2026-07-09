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
              className={`no-underline font-bold text-[13.5px] uppercase tracking-wide px-3 py-2 rounded-md ${
                active ? "bg-tms-gold text-[#3A2408]" : "text-tms-cream/85"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={logout}
        className="bg-transparent border border-tms-cream/50 text-tms-cream px-3.5 py-2 rounded-md font-bold text-[13px] uppercase cursor-pointer"
      >
        Salir
      </button>
    </header>
  );
}
