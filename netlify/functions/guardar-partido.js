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

  if (!datos.equipo_local_id || !datos.equipo_visitante_id) {
    errores.push('Debés elegir equipo local y visitante.');
  }
  if (datos.equipo_local_id === datos.equipo_visitante_id) {
    errores.push('El equipo local y visitante no pueden ser el mismo.');
  }
  if (!datos.jornada) errores.push('Falta la jornada.');
  if (!datos.fecha) errores.push('Falta la fecha.');
  if (datos.estado === 'Jugado' &&
      (datos.goles_local === '' || datos.goles_local == null ||
       datos.goles_visitante === '' || datos.goles_visitante == null)) {
    errores.push('Si el partido ya se jugó, necesitás cargar el marcador.');
  }

  if (errores.length > 0) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, errores }) };
  }

  const payload = {
    jornada: datos.jornada,
    fecha: datos.fecha,
    hora: datos.hora || null,
    cancha: datos.cancha || null,
    equipo_local_id: datos.equipo_local_id,
    equipo_visitante_id: datos.equipo_visitante_id,
    goles_local: datos.goles_local === '' ? null : datos.goles_local,
    goles_visitante: datos.goles_visitante === '' ? null : datos.goles_visitante,
    estado: datos.estado || 'Programado',
    arbitro_nombre: datos.arbitro_nombre || null,
    informe_arbitro: datos.informe_arbitro || null,
    tarjetas_amarillas: datos.tarjetas_amarillas || null,
    tarjetas_rojas: datos.tarjetas_rojas || null,
    incidencias: datos.incidencias || null,
  };

  const query = datos.id
    ? supabaseAdmin.from('partidos').update(payload).eq('id', datos.id).select()
    : supabaseAdmin.from('partidos').insert(payload).select();

  const { data, error } = await query;
  if (error) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, errores: [error.message] }) };
  }
  const partido = data[0];

  // Goleadores del partido: se reemplazan por completo en cada guardado
  // (borrar + insertar) para que editar un resultado no deje goles viejos.
  if (Array.isArray(datos.goles)) {
    const { error: errorBorrar } = await supabaseAdmin.from('goles').delete().eq('partido_id', partido.id);
    if (errorBorrar) {
      return { statusCode: 500, body: JSON.stringify({ ok: false, errores: [errorBorrar.message] }) };
    }
    const filas = datos.goles
      .filter((g) => g.jugador_id && Number(g.cantidad) > 0)
      .map((g) => ({ partido_id: partido.id, jugador_id: g.jugador_id, cantidad: Number(g.cantidad) }));
    if (filas.length) {
      const { error: errorGoles } = await supabaseAdmin.from('goles').insert(filas);
      if (errorGoles) {
        return { statusCode: 500, body: JSON.stringify({ ok: false, errores: [errorGoles.message] }) };
      }
    }
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true, partido }) };
};
