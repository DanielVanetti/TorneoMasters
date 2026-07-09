import { createClient } from "@/lib/supabase/client";

const MAX_FOTO_MB = 6;

// Llama a un endpoint app/api/* adjuntando el token de sesión — equivalente
// a admin-common.js: llamarFuncion().
export async function llamarFuncion(nombre: string, body: Record<string, unknown> = {}) {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    window.location.href = "/admin/login";
    throw new Error("Sin sesión");
  }
  const res = await fetch(`/api/${nombre}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data.session.access_token}`,
    },
    body: JSON.stringify(body || {}),
  });
  let json: { ok: boolean; errores?: string[]; [key: string]: unknown };
  try {
    json = await res.json();
  } catch {
    throw new Error(`Respuesta inválida del servidor (${res.status})`);
  }
  if (!json.ok) {
    throw new Error((json.errores || ["Error desconocido"]).join(" "));
  }
  return json;
}

export function fileToBase64(file: File): Promise<{ base64: string; contentType: string; filename: string }> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FOTO_MB * 1024 * 1024) {
      reject(new Error(`La imagen pesa más de ${MAX_FOTO_MB}MB. Elegí una más liviana o comprimila antes de subirla.`));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = String(reader.result).split(",")[1];
      resolve({ base64, contentType: file.type, filename: file.name });
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.readAsDataURL(file);
  });
}
