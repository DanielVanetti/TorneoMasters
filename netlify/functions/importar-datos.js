// Carga masiva de equipos y jugadores. El admin lee el Excel/CSV en el
// navegador (con SheetJS) y manda acá filas ya parseadas como JSON —
// esta function no procesa archivos, solo hace los upserts.
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

  const { equipos, jugadores } = JSON.parse(event.body || '{}');
  const resultado = { equiposCreados: 0, jugadoresCreados: 0, errores: [] };
  const idPorNombre = {};

  if (Array.isArray(equipos)) {
    for (const eq of equipos) {
      const nombre = (eq.nombre || '').trim();
      if (!nombre) continue;
      const { data, error } = await supabaseAdmin
        .from('equipos')
        .upsert({ nombre, ciudad: eq.ciudad || null, color: eq.color || '#0E5C6B' }, { onConflict: 'nombre' })
        .select();
      if (error) {
        resultado.errores.push(`Equipo "${nombre}": ${error.message}`);
        continue;
      }
      idPorNombre[nombre] = data[0].id;
      resultado.equiposCreados++;
    }
  }

  if (Array.isArray(jugadores)) {
    // Los jugadores también pueden apuntar a equipos que ya existían antes
    // de esta importación (no solo a los que vinieron en este mismo archivo).
    const { data: existentes } = await supabaseAdmin.from('equipos').select('id, nombre');
    for (const e of existentes || []) {
      if (!idPorNombre[e.nombre]) idPorNombre[e.nombre] = e.id;
    }

    for (const j of jugadores) {
      const nombre = (j.nombre || '').trim();
      const equipoId = idPorNombre[(j.equipo || '').trim()];
      if (!nombre || !equipoId) {
        resultado.errores.push(`Jugador "${nombre || '(sin nombre)'}": equipo "${j.equipo || ''}" no encontrado.`);
        continue;
      }
      const { error } = await supabaseAdmin.from('jugadores').insert({
        nombre, equipo_id: equipoId, numero: j.numero || null, posicion: j.posicion || null,
      });
      if (error) {
        resultado.errores.push(`Jugador "${nombre}": ${error.message}`);
        continue;
      }
      resultado.jugadoresCreados++;
    }
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true, resultado }) };
};
