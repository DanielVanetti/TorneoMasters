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

const BUCKET = "fotos-torneo";

// Sube un archivo (dado en base64) al bucket público y devuelve su URL.
// Reemplaza a netlify/functions/_storage.js (subirArchivo).
export async function subirArchivo(
  base64: string,
  nombreArchivo: string,
  carpeta: string,
  contentType?: string
) {
  const buffer = Buffer.from(base64, "base64");
  const ruta = `${carpeta}/${Date.now()}-${nombreArchivo}`;
  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(ruta, buffer, {
    contentType: contentType || "image/jpeg",
  });
  if (error) throw new Error(error.message);
  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(ruta);
  return data.publicUrl;
}
