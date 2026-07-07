(function () {
  const cfg = window.SUPABASE_CONFIG || {};
  const sinConfigurar = !cfg.url || cfg.url.indexOf("TU_SUPABASE_URL") === 0;
  const mensaje = document.getElementById("mensaje");

  function mostrar(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.style.display = "block";
    mensaje.style.background = tipo === "error" ? "#f4d9d0" : "#dcefe0";
    mensaje.style.color = tipo === "error" ? "#7a2c14" : "#1d5c33";
  }

  if (sinConfigurar) {
    mostrar("Falta configurar Supabase en js/supabase-config.js antes de poder iniciar sesión.", "error");
    return;
  }

  const client = window.supabase.createClient(cfg.url, cfg.anonKey);

  // Si ya hay sesión activa, directo al dashboard.
  client.auth.getSession().then(({ data }) => {
    if (data.session) window.location.href = "./dashboard.html";
  });

  document.getElementById("form-login").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const boton = e.target.querySelector("button");
    boton.disabled = true;
    boton.textContent = "Ingresando…";

    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      mostrar("Usuario o contraseña incorrectos.", "error");
      boton.disabled = false;
      boton.textContent = "Iniciar sesión";
      return;
    }
    window.location.href = "./dashboard.html";
  });
})();
