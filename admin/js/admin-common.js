// Lógica compartida por todas las páginas del admin: sesión, logout,
// helper para llamar Netlify Functions con el token, y utilidades de UI.
// Requiere que la página ya haya cargado, en este orden:
//   ../js/supabase-config.js
//   https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js
window.Admin = (function () {
  const cfg = window.SUPABASE_CONFIG || {};
  const sinConfigurar = !cfg.url || cfg.url.indexOf("TU_SUPABASE_URL") === 0;
  const client = sinConfigurar ? null : window.supabase.createClient(cfg.url, cfg.anonKey);

  const MAX_FOTO_MB = 6;

  async function requireSession() {
    if (!client) {
      alert("Falta configurar Supabase en js/supabase-config.js antes de poder usar el admin.");
      throw new Error("Supabase sin configurar");
    }
    const { data } = await client.auth.getSession();
    if (!data.session) {
      window.location.href = "./login.html";
      throw new Error("Sin sesión");
    }
    return data.session;
  }

  async function logout() {
    if (client) await client.auth.signOut();
    window.location.href = "./login.html";
  }

  async function llamarFuncion(nombre, body) {
    const { data } = await client.auth.getSession();
    if (!data.session) {
      window.location.href = "./login.html";
      throw new Error("Sin sesión");
    }
    const res = await fetch(`/.netlify/functions/${nombre}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.session.access_token}`,
      },
      body: JSON.stringify(body || {}),
    });
    let json;
    try {
      json = await res.json();
    } catch (e) {
      throw new Error(`Respuesta inválida del servidor (${res.status})`);
    }
    if (!json.ok) {
      throw new Error((json.errores || ["Error desconocido"]).join(" "));
    }
    return json;
  }

  function mostrarMensaje(el, texto, tipo) {
    if (!el) return;
    el.textContent = texto;
    el.style.display = "block";
    el.style.background = tipo === "error" ? "#f4d9d0" : "#dcefe0";
    el.style.color = tipo === "error" ? "#7a2c14" : "#1d5c33";
  }

  function ocultarMensaje(el) {
    if (el) el.style.display = "none";
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      if (file.size > MAX_FOTO_MB * 1024 * 1024) {
        reject(new Error(`La imagen pesa más de ${MAX_FOTO_MB}MB. Elegí una más liviana o comprimila antes de subirla.`));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = String(reader.result).split(",")[1];
        resolve({ base64, contentType: file.type, filename: file.name });
      };
      reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
      reader.readAsDataURL(file);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btn-logout");
    if (btn) btn.addEventListener("click", logout);
    const activo = document.body.dataset.page;
    if (activo) {
      const link = document.querySelector(`.admin-header nav a[data-nav="${activo}"]`);
      if (link) link.classList.add("active");
    }
  });

  return { client, requireSession, logout, llamarFuncion, mostrarMensaje, ocultarMensaje, fileToBase64 };
})();
