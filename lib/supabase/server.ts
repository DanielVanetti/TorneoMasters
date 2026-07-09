import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente de solo lectura (anon key) para Server Components y Route Handlers.
// Lee/escribe la sesión desde las cookies del navegador — las políticas RLS
// del schema siguen limitando esta key a lectura pública.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll fue llamado desde un Server Component sin poder escribir
            // cookies — está bien, el middleware ya se encarga de refrescar
            // la sesión en cada request.
          }
        },
      },
    }
  );
}

// Sesión del usuario actual (o null), a partir de las cookies de la request.
// Usado tanto por middleware.ts como por cada Route Handler antes de escribir.
export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
