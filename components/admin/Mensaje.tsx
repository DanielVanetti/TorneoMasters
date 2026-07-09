export default function Mensaje({ texto, tipo }: { texto: string; tipo: "ok" | "error" }) {
  if (!texto) return null;
  return (
    <div
      className="px-4 py-3 rounded-md text-[14.5px] mb-4"
      style={tipo === "error" ? { background: "#f4d9d0", color: "#7a2c14" } : { background: "#dcefe0", color: "#1d5c33" }}
    >
      {texto}
    </div>
  );
}
