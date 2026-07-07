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
  if (!datos.nombre || !datos.nombre.trim()) errores.push('El equipo necesita un nombre.');
  if (errores.length > 0) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, errores }) };
  }

  const payload = {
    nombre: datos.nombre.trim(),
    ciudad: datos.ciudad || null,
    color: datos.color || '#0E5C6B',
    delegado: datos.delegado || null,
    telefono: datos.telefono || null,
    email: datos.email || null,
    cancha_local: datos.cancha_local || null,
    logo_url: datos.logo_url || null,
  };

  const query = datos.id
    ? supabaseAdmin.from('equipos').update(payload).eq('id', datos.id).select()
    : supabaseAdmin.from('equipos').insert(payload).select();

  const { data, error } = await query;
  if (error) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, errores: [error.message] }) };
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true, equipo: data[0] }) };
};
