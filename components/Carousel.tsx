"use client";

import { useRef } from "react";
import Image from "next/image";
import type { Foto } from "@/lib/queries";

export default function Carousel({ fotos }: { fotos: Foto[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollBy(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {fotos.map((f) => (
          <div
            key={f.id}
            className="relative shrink-0 w-[78%] sm:w-[360px] aspect-[4/3] rounded-[10px] overflow-hidden bg-[#e7ddc8] snap-start"
          >
            <Image src={f.url} alt={f.titulo || ""} fill className="object-cover" sizes="(max-width:640px) 78vw, 360px" />
            {f.titulo && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/55 text-white text-[13px] font-body font-bold px-3 py-2">
                {f.titulo}
              </div>
            )}
          </div>
        ))}
      </div>
      {fotos.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => scrollBy(-1)}
            className="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-tms-teal-dark text-white items-center justify-center border-0 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Siguiente"
            onClick={() => scrollBy(1)}
            className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-tms-teal-dark text-white items-center justify-center border-0 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
