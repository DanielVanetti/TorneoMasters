// Guarda el texto de Reglamento / Requisitos para participar.
const { verificarSesion } = require('./auth-check');
const { supabaseAdmin } = require('./_storage');

const CLAVES_VALIDAS = ['requisitos', 'reglamento'];

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método no permitido' };
  }

  const usuario = await verificarSesion(event);
  if (!usuario) {
    return { statusCode: 401, body: JSON.stringify({ ok: false, errores: ['No autorizado. Iniciá sesión.'] }) };
  }

  const { clave, titulo, contenido } = JSON.parse(event.body || '{}');
  if (!CLAVES_VALIDAS.includes(clave)) {
    return { statusCode: 400, body: JSON.stringify({ ok: false, errores: ['Sección inválida.'] }) };
  }

  const { data, error } = await supabaseAdmin
    .from('contenido_paginas')
    .upsert({ clave, titulo: titulo || null, contenido: contenido || '', actualizado_en: new Date().toISOString() }, { onConflict: 'clave' })
    .select();

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, errores: [error.message] }) };
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true, contenido: data[0] }) };
};
