import { createBrowserClient } from "@supabase/ssr";

// Cliente de Supabase para usar dentro de Client Components (formularios del
// admin, login). Misma anon key pública que el resto del sitio.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
