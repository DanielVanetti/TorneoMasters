// Cliente de Supabase de SOLO LECTURA para el sitio público.
// La anon key es pública a propósito (protegida por las políticas RLS
// de "lectura pública" del schema.sql) — está bien que viva en el navegador.
// Las credenciales se editan en un solo lugar: js/supabase-config.js
(function () {
  var CONFIG_URL = "./js/supabase-config.js";
  var SDK_URL = "https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js";

  var DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  var MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

  function formatFecha(fechaISO) {
    if (!fechaISO) return "";
    var d = new Date(fechaISO + "T00:00:00");
    return DIAS[d.getDay()] + " " + String(d.getDate()).padStart(2, "0") + " " + MESES[d.getMonth()] + " " + d.getFullYear();
  }

  function formatHora(horaStr) {
    if (!horaStr) return "";
    var partes = horaStr.split(":");
    var h = parseInt(partes[0], 10);
    var m = partes[1] || "00";
    var ampm = h >= 12 ? "pm" : "am";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ":" + m + " " + ampm;
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.async = false;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error("No se pudo cargar " + src)); };
      document.head.appendChild(s);
    });
  }

  function vacio() {
    console.warn("[supabase-client] Falta configurar TU_SUPABASE_URL / TU_SUPABASE_ANON_KEY en js/supabase-client.js — mostrando datos vacíos.");
    return Promise.resolve([]);
  }

  function buildHelpers(client) {
    return {
      client: client,

      async getPosiciones() {
        const { data, error } = await client.from("v_posiciones").select("*")
          .order("pts", { ascending: false }).order("dg", { ascending: false }).order("gf", { ascending: false });
        if (error) { console.error("getPosiciones:", error.message); return []; }
        return (data || []).map((t) => ({
          id: t.equipo_id, name: t.equipo, city: t.city, color: t.color,
          pj: t.pj, pg: t.pg, pe: t.pe, pp: t.pp, gf: t.gf, gc: t.gc, pts: t.pts, dg: t.dg,
        }));
      },

      async getGoleadores() {
        const { data, error } = await client.from("v_goleadores").select("*").order("goals", { ascending: false });
        if (error) { console.error("getGoleadores:", error.message); return []; }
        return (data || []).map((s) => ({ name: s.name, team: s.team, goals: s.goals }));
      },

      async getProximosPartidos(limite) {
        let query = client.from("v_proximos_partidos").select("*").order("fecha", { ascending: true }).order("hora", { ascending: true });
        if (limite) query = query.limit(limite);
        const { data, error } = await query;
        if (error) { console.error("getProximosPartidos:", error.message); return []; }
        return (data || []).map((p) => ({
          jornada: p.jornada, date: formatFecha(p.fecha), time: formatHora(p.hora),
          venue: p.cancha || "", home: p.home, away: p.away,
        }));
      },

      async getJugadores() {
        const { data, error } = await client.from("jugadores").select("id, nombre, numero, posicion, equipo_id, foto_url");
        if (error) { console.error("getJugadores:", error.message); return []; }
        return (data || []).map((p) => ({ team: p.equipo_id, name: p.nombre, number: p.numero, position: p.posicion, fotoUrl: p.foto_url }));
      },

      async getContenido() {
        const { data, error } = await client.from("contenido_paginas").select("clave, titulo, contenido");
        if (error) { console.error("getContenido:", error.message); return { requisitos: null, reglamento: null }; }
        const porClave = {};
        (data || []).forEach((row) => { porClave[row.clave] = row; });
        return { requisitos: porClave.requisitos || null, reglamento: porClave.reglamento || null };
      },

      async getGaleria() {
        const { data, error } = await client.from("imagenes").select("id, titulo, descripcion, url_imagen, subida_en").order("subida_en", { ascending: false });
        if (error) { console.error("getGaleria:", error.message); return []; }
        return (data || []).map((f) => ({ id: f.id, titulo: f.titulo, descripcion: f.descripcion, url: f.url_imagen }));
      },
    };
  }

  window.TorneoDBReady = loadScript(CONFIG_URL).then(function () {
    var cfg = window.SUPABASE_CONFIG || {};
    var sinConfigurar = !cfg.url || cfg.url.indexOf("TU_SUPABASE_URL") === 0;
    if (sinConfigurar) {
      return {
        client: null,
        getPosiciones: vacio, getGoleadores: vacio, getProximosPartidos: vacio,
        getJugadores: vacio, getGaleria: vacio,
        getContenido: () => { vacio(); return Promise.resolve({ requisitos: null, reglamento: null }); },
      };
    }
    return loadScript(SDK_URL).then(function () {
      var client = window.supabase.createClient(cfg.url, cfg.anonKey);
      return buildHelpers(client);
    });
  });
})();
