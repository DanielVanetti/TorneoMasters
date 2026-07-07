// Subida genérica (foto de jugador, logo de equipo, etc.): sube el
// archivo y devuelve la URL pública — no toca ninguna tabla. El
// formulario que llama a esto se encarga de mandar esa URL como
// foto_url / logo_url al guardar el equipo o jugador.
const { verificarSesion } = require('./auth-check');
const { subirArchivo } = require('./_storage');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método no permitido' };
  }

  const usuario = await verificarSesion(event);
  if (!usuario) {
    return { statusCode: 401, body: JSON.stringify({ ok: false, errores: ['No autorizado. Iniciá sesión.'] }) };
  }

  const { archivo_base64, nombre_archivo, carpeta, content_type } = JSON.parse(event.body || '{}');
  if (!archivo_base64 || !nombre_archivo) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, errores: ['Falta el archivo.'] }) };
  }
  const carpetaSegura = ['jugadores', 'equipos'].includes(carpeta) ? carpeta : 'otros';

  try {
    const url = await subirArchivo(archivo_base64, nombre_archivo, carpetaSegura, content_type);
    return { statusCode: 200, body: JSON.stringify({ ok: true, url }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, errores: [e.message] }) };
  }
};
