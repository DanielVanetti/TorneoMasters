import { llamarFuncion, ErrorDeRed } from "@/lib/admin-client";

// Cola de partidos guardados sin conexión — vive en localStorage del
// celular/navegador, no en el servidor. Alcance acotado a "guardar-partido"
// a propósito: es el único flujo que se carga en vivo, parado en la cancha,
// donde perder la señal a mitad de un guardado es un caso real.
const CLAVE = "tms_partidos_pendientes";

type PartidoPendiente = { id: string; cuerpo: Record<string, unknown>; creadoEn: number };

function leer(): PartidoPendiente[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CLAVE) || "[]");
  } catch {
    return [];
  }
}

function escribir(items: PartidoPendiente[]) {
  localStorage.setItem(CLAVE, JSON.stringify(items));
}

export function guardarPartidoOffline(cuerpo: Record<string, unknown>) {
  const items = leer();
  items.push({ id: crypto.randomUUID(), cuerpo, creadoEn: Date.now() });
  escribir(items);
}

export function contarPartidosPendientes(): number {
  return leer().length;
}

// Reintenta enviar cada partido pendiente. Los que siguen fallando por
// falta de conexión quedan en la cola para el próximo intento; los que
// fallan por otro motivo (por ejemplo, el partido fue borrado mientras
// tanto) se sacan de la cola — reintentarlos para siempre no serviría de
// nada — y se devuelven como error para avisarle al admin.
export async function sincronizarPartidosPendientes(): Promise<{ enviados: number; errores: string[] }> {
  const items = leer();
  if (items.length === 0) return { enviados: 0, errores: [] };

  const quedan: PartidoPendiente[] = [];
  const errores: string[] = [];
  let enviados = 0;

  for (const item of items) {
    try {
      await llamarFuncion("guardar-partido", item.cuerpo);
      enviados++;
    } catch (e) {
      if (e instanceof ErrorDeRed) {
        quedan.push(item);
      } else {
        errores.push(e instanceof Error ? e.message : String(e));
      }
    }
  }

  escribir(quedan);
  return { enviados, errores };
}
