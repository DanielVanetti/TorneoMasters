// Clases de Tailwind reutilizadas por los formularios del admin — puerto de
// admin/css/admin.css a utilidades, para no repetir la misma cadena en cada página.
export const panelCls = "bg-white rounded-[10px] shadow-[0_4px_14px_rgba(0,0,0,0.07)] p-5.5 mb-6";
export const labelCls = "block font-bold text-[13px] uppercase tracking-wide text-tms-ink/65 mt-3.5 mb-1.5 first:mt-0";
export const inputCls =
  "w-full px-3 py-2.5 border border-tms-ink/[0.18] rounded-md font-body text-[15px] bg-white text-tms-ink transition-shadow duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-tms-teal/40 focus:border-tms-teal motion-reduce:transition-none";
export const btnCls =
  "inline-block bg-tms-orange text-white border-0 px-5.5 py-3 rounded-md font-body font-extrabold text-[15px] uppercase tracking-wide cursor-pointer mt-4.5 transition-colors duration-200 ease-out hover:bg-tms-orange/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tms-orange/50 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-default motion-reduce:transition-none";
export const btnSecondaryCls = btnCls.replace(/bg-tms-orange/g, "bg-tms-teal").replace("ring-tms-orange/50", "ring-tms-teal/50");
export const btnDangerCls =
  "bg-tms-brick text-white border-0 px-3.5 py-1.5 rounded-md font-body font-bold text-[12.5px] uppercase cursor-pointer transition-colors duration-200 ease-out hover:bg-tms-brick/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tms-brick/50 focus-visible:ring-offset-2 motion-reduce:transition-none";
export const btnSmallSecondaryCls =
  "bg-tms-teal text-white border-0 px-3.5 py-1.5 rounded-md font-body font-bold text-[12.5px] uppercase cursor-pointer transition-colors duration-200 ease-out hover:bg-tms-teal/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tms-teal/50 focus-visible:ring-offset-2 motion-reduce:transition-none";
export const formRowCls = "grid grid-cols-1 sm:grid-cols-2 gap-4";
export const tableCls = "w-full border-collapse text-[14.5px]";
export const thCls = "p-2.5 text-left bg-tms-teal/[0.08] text-tms-teal-dark text-[12.5px] uppercase tracking-wide";
export const tdCls = "p-2.5 border-b border-tms-ink/[0.08]";
