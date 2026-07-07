// Helper compartido para subir archivos a Supabase Storage.
// Tampoco es una function invocable (no exporta `handler`).
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET = 'fotos-torneo';

async function subirArchivo(base64, nombreArchivo, carpeta, contentType) {
  const buffer = Buffer.from(base64, 'base64');
  const ruta = `${carpeta}/${Date.now()}-${nombreArchivo}`;
  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(ruta, buffer, {
    contentType: contentType || 'image/jpeg',
  });
  if (error) throw new Error(error.message);
  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(ruta);
  return data.publicUrl;
}

module.exports = { supabaseAdmin, subirArchivo };
