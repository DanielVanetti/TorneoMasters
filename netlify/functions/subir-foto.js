// Recibe una imagen en base64, la sube a Supabase Storage y guarda el
// link en la tabla imagenes (galería pública). Para fotos de jugador o
// logo de equipo usá subir-archivo.js en su lugar.
const { verificarSesion } = require('./auth-check');
const { supabaseAdmin, subirArchivo } = require('./_storage');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método no permitido' };
  }

  const usuario = await verificarSesion(event);
  if (!usuario) {
    return { statusCode: 401, body: JSON.stringify({ ok: false, errores: ['No autorizado. Iniciá sesión.'] }) };
  }

  const { archivo_base64, nombre_archivo, titulo, descripcion, partido_id, content_type } = JSON.parse(event.body || '{}');
  if (!archivo_base64 || !nombre_archivo) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, errores: ['Falta la imagen.'] }) };
  }

  let url;
  try {
    url = await subirArchivo(archivo_base64, nombre_archivo, 'galeria', content_type);
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, errores: [e.message] }) };
  }

  const { error } = await supabaseAdmin.from('imagenes').insert({
    partido_id: partido_id || null,
    titulo: titulo || null,
    descripcion: descripcion || null,
    url_imagen: url,
  });
  if (error) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, errores: [error.message] }) };
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true, url }) };
};
