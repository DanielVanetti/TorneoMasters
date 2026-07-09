import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente anon de solo lectura para las páginas públicas. A diferencia de
// lib/supabase/server.ts, este NO toca cookies — así Next.js puede seguir
// tratando estas páginas como estáticas/ISR (revalidate) en vez de
// renderizarlas 100% dinámicas en cada request, que es lo que pasa
// automáticamente en cuanto un Server Component llama a cookies().
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
