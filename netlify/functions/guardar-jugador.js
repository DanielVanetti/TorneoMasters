const { verificarSesion } = require('./auth-check');
const { supabaseAdmin } = require('./_storage');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método no permitido' };
  }

  const usuario = await verificarSesion(event);
  if (!usuario) {
    return { statusCode: 401, body: JSON.stringify({ ok: false, errores: ['No autorizado. Iniciá sesión.'] }) };
  }

  const datos = JSON.parse(event.body || '{}');
  const errores = [];
  if (!datos.nombre || !datos.nombre.trim()) errores.push('El jugador necesita un nombre.');
  if (!datos.equipo_id) errores.push('Debés elegir el equipo del jugador.');
  if (errores.length > 0) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, errores }) };
  }

  const payload = {
    nombre: datos.nombre.trim(),
    equipo_id: datos.equipo_id,
    numero: datos.numero || null,
    posicion: datos.posicion || null,
    fecha_nacimiento: datos.fecha_nacimiento || null,
    foto_url: datos.foto_url || null,
  };

  const query = datos.id
    ? supabaseAdmin.from('jugadores').update(payload).eq('id', datos.id).select()
    : supabaseAdmin.from('jugadores').insert(payload).select();

  const { data, error } = await query;
  if (error) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, errores: [error.message] }) };
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true, jugador: data[0] }) };
};
