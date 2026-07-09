"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden bg-tms-orange text-tms-cream font-body font-extrabold uppercase text-sm px-5 py-2.5 rounded no-underline border-0 cursor-pointer"
    >
      Imprimir / Guardar PDF
    </button>
  );
}
