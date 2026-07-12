import "server-only";
import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";

// Cliente con la service_role key — se salta RLS por diseño.
// `server-only` hace que el build falle si algo intenta importar este
// archivo desde un Client Component: nunca debe llegar al navegador.
// La key vive SOLO como variable de entorno de Netlify, nunca en el repo.
// Se crea recién en el primer uso (no al cargar el módulo) para que el
// `next build` no explote en máquinas/entornos donde esa env var todavía
// no está seteada (por ejemplo, en local sin querer probar el admin).
let _supabaseAdmin: SupabaseClient | null = null;
function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  }
  return _supabaseAdmin;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdmin();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

// Borra una fila por id de la tabla indicada — reemplaza a
// netlify/functions/_borrar.js (crearBorrador).
export async function borrarPorId(tabla: string, id: string) {
  const { error } = await supabaseAdmin.from(tabla).delete().eq("id", id);
  return error;
}

// Resuelve la temporada activa server-side, para asignársela a
// equipos/partidos/fotos nuevos sin confiar en lo que mande el cliente.
// Nunca se usa para decidir a qué temporada mover un registro ya
// existente (editar no debe cambiar su temporada_id).
export async function getTemporadaActivaIdAdmin(): Promise<string | null> {
  const { data, error } = await supabaseAdmin.from("temporadas").select("id").eq("activa", true).maybeSingle();
  if (error) {
    console.error("getTemporadaActivaIdAdmin:", error.message);
    return null;
  }
  return data?.id ?? null;
}

const BUCKET = "fotos-torneo";
const MAX_BYTES = 6 * 1024 * 1024;

// Tipos MIME permitidos y sus magic bytes — el content_type que manda el
// cliente es solo una sugerencia, así que igual verificamos los primeros
// bytes reales del archivo antes de subirlo (evita que alguien con sesión
// admin suba un SVG/HTML con <script> disfrazado de imagen a un bucket
// público servido desde nuestro propio dominio de Supabase).
const FIRMAS: Record<string, (b: Buffer) => boolean> = {
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/png": (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  "image/webp": (b) => b.slice(0, 4).toString("ascii") === "RIFF" && b.slice(8, 12).toString("ascii") === "WEBP",
};

function sanitizarNombre(nombre: string) {
  const base = nombre.split(/[/\\]/).pop() || "archivo";
  return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
}

// Sube un archivo (dado en base64) al bucket público y devuelve su URL.
// Reemplaza a netlify/functions/_storage.js (subirArchivo).
export async function subirArchivo(
  base64: string,
  nombreArchivo: string,
  carpeta: string
) {
  const buffer = Buffer.from(base64, "base64");
  if (buffer.length === 0) throw new Error("El archivo está vacío.");
  if (buffer.length > MAX_BYTES) throw new Error(`El archivo pesa más de ${MAX_BYTES / (1024 * 1024)}MB.`);

  const tipoDetectado = Object.entries(FIRMAS).find(([, esValido]) => esValido(buffer))?.[0];
  if (!tipoDetectado) throw new Error("Tipo de archivo no permitido. Usá JPG, PNG o WEBP.");

  const ruta = `${carpeta}/${Date.now()}-${sanitizarNombre(nombreArchivo)}`;
  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(ruta, buffer, {
    contentType: tipoDetectado,
  });
  if (error) throw new Error(error.message);
  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(ruta);
  return data.publicUrl;
}

// Borra del bucket el archivo detrás de una URL pública generada por
// subirArchivo — se usa al reemplazar un logo/foto o al eliminar una
// imagen de la galería, para no dejar archivos huérfanos en Storage.
// No falla el flujo llamante si la URL no matchea o el borrado falla:
// es housekeeping, no algo que deba bloquear guardar/eliminar el dato.
export async function borrarArchivoPorUrl(url: string | null | undefined) {
  if (!url) return;
  const marca = `/storage/v1/object/public/${BUCKET}/`;
  const i = url.indexOf(marca);
  if (i === -1) return;
  const ruta = url.slice(i + marca.length);
  if (!ruta) return;
  await supabaseAdmin.storage.from(BUCKET).remove([ruta]);
}
