"use client";

import { useEffect, useState } from "react";
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
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Cierra el menú mobile al navegar a otra sección.
  useEffect(() => {
    setMenuAbierto(false);
  }, [pathname]);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <header className="bg-tms-teal-dark border-b-4 border-tms-gold px-6 py-3.5">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="text-tms-cream font-extrabold text-lg tracking-wide no-underline">
          Admin · Torneo Máster
        </Link>
        <nav className="hidden sm:flex gap-1.5 flex-wrap ml-auto">
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
          className="hidden sm:inline-block bg-transparent border border-tms-cream/50 text-tms-cream px-3.5 py-2 rounded-md font-bold text-[13px] uppercase cursor-pointer transition-colors duration-200 ease-out hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tms-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-tms-teal-dark motion-reduce:transition-none"
        >
          Salir
        </button>
        <button
          onClick={() => setMenuAbierto((v) => !v)}
          aria-expanded={menuAbierto}
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          className="sm:hidden ml-auto w-11 h-11 flex items-center justify-center bg-transparent border border-tms-cream/50 rounded-md text-tms-cream cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tms-gold/70"
        >
          <span className="sr-only">Menú</span>
          {menuAbierto ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4l12 12M16 4L4 16" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 5h14M3 10h14M3 15h14" />
            </svg>
          )}
        </button>
      </div>

      {menuAbierto && (
        <nav className="sm:hidden flex flex-col gap-1 mt-3.5 pt-3.5 border-t border-tms-cream/15">
          {ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`no-underline font-bold text-[14px] uppercase tracking-wide px-3 py-2.5 rounded-md transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tms-gold/70 motion-reduce:transition-none ${
                  active ? "bg-tms-gold text-[#3A2408]" : "text-tms-cream/85 hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={logout}
            className="mt-1.5 bg-transparent border border-tms-cream/50 text-tms-cream px-3.5 py-2.5 rounded-md font-bold text-[13px] uppercase cursor-pointer text-left transition-colors duration-200 ease-out hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tms-gold/70 motion-reduce:transition-none"
          >
            Salir
          </button>
        </nav>
      )}
    </header>
  );
}
