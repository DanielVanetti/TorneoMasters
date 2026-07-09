const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

export function formatFecha(fechaISO: string | null): string {
  if (!fechaISO) return "";
  const d = new Date(fechaISO + "T00:00:00");
  return `${DIAS[d.getDay()]} ${String(d.getDate()).padStart(2, "0")} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatHora(horaStr: string | null): string {
  if (!horaStr) return "";
  const [hStr, m] = horaStr.split(":");
  const h = parseInt(hStr, 10);
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m || "00"} ${ampm}`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter((w) => w.length > 2 || /^[A-Z0-9]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);
}
