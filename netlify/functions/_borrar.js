// Fábrica de handlers "eliminar por id" — la usan eliminar-equipo.js,
// eliminar-jugador.js, eliminar-partido.js y eliminar-foto.js.
const { verificarSesion } = require('./auth-check');
const { supabaseAdmin } = require('./_storage');

function crearBorrador(tabla) {
  return async (event) => {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Método no permitido' };
    }
    const usuario = await verificarSesion(event);
    if (!usuario) {
      return { statusCode: 401, body: JSON.stringify({ ok: false, errores: ['No autorizado. Iniciá sesión.'] }) };
    }
    const { id } = JSON.parse(event.body || '{}');
    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, errores: ['Falta el id.'] }) };
    }
    const { error } = await supabaseAdmin.from(tabla).delete().eq('id', id);
    if (error) {
      return { statusCode: 500, body: JSON.stringify({ ok: false, errores: [error.message] }) };
    }
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  };
}

module.exports = { crearBorrador };
