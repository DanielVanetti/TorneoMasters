// El guardián que usan TODAS las demás functions que escriben datos.
// No es una function invocable por su cuenta (no exporta `handler`) —
// solo se importa con require('./auth-check') dentro de las otras.
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function verificarSesion(event) {
  const token = event.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;

  return data.user; // si llega acá, está logueado y puede escribir
}

module.exports = { verificarSesion };
