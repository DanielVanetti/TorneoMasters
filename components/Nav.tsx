import Link from "next/link";

const ITEMS = [
  { key: "inicio", label: "Inicio", href: "/" },
  { key: "posiciones", label: "Posiciones", href: "/posiciones" },
  { key: "goleadores", label: "Goleadores", href: "/goleadores" },
  { key: "calendario", label: "Calendario", href: "/calendario" },
  { key: "equipos", label: "Equipos", href: "/equipos" },
  { key: "actividades", label: "Actividades", href: "/actividades" },
  { key: "reglamento", label: "Reglamento", href: "/reglamento" },
] as const;

export default function Nav({ current }: { current: string }) {
  return (
    <header className="sticky top-0 z-50 bg-tms-teal-dark border-b-4 border-tms-gold shadow-[0_4px_14px_rgba(0,0,0,0.18)]">
      <div className="max-w-[1240px] mx-auto flex items-center gap-2.5 sm:gap-[22px] flex-wrap px-4 py-2.5 sm:px-7 sm:py-3.5">
        <Link href="/" className="flex items-center gap-3 no-underline shrink-0">
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-display text-base sm:text-xl text-[#3a2408] shrink-0 shadow-[inset_0_-3px_0_rgba(0,0,0,0.25),0_2px_6px_rgba(0,0,0,0.35)]"
            style={{ background: "radial-gradient(circle at 32% 28%, #ffe9ad, #F2C94C 45%, #C97B2E 100%)" }}
          >
            TMS
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-tms-cream text-lg sm:text-[22px] tracking-wide">TORNEO MÁSTER</span>
            <span className="font-body text-tms-gold text-[11px] sm:text-[13px] font-bold tracking-[2px]">SANTA CRUZ · GUANACASTE</span>
          </div>
        </Link>
        <nav className="w-full sm:w-auto sm:ml-auto flex gap-1.5 flex-nowrap sm:flex-wrap font-body overflow-x-auto sm:overflow-visible pb-0.5 sm:pb-0">
          {ITEMS.map((item) => {
            const active = item.key === current;
            return (
              <Link
                key={item.key}
                href={item.href}
                className="rounded-md no-underline font-bold text-[12.5px] sm:text-sm tracking-wide uppercase whitespace-nowrap px-3 py-2 sm:px-3.5 sm:py-2.5"
                style={active ? { background: "#F2C94C", color: "#3A2408" } : { color: "#FAF3E9" }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
