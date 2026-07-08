(async function () {
  await window.Admin.requireSession();
  const { client, llamarFuncion, mostrarMensaje, ocultarMensaje } = window.Admin;

  const mensaje = document.getElementById("mensaje");
  const reqTitulo = document.getElementById("req-titulo");
  const reqContenido = document.getElementById("req-contenido");
  const regTitulo = document.getElementById("reg-titulo");
  const regContenido = document.getElementById("reg-contenido");

  async function cargar() {
    const { data, error } = await client.from("contenido_paginas").select("clave, titulo, contenido");
    if (error) { mostrarMensaje(mensaje, `Error cargando contenido: ${error.message}`, "error"); return; }
    const porClave = {};
    (data || []).forEach((row) => { porClave[row.clave] = row; });

    reqTitulo.value = porClave.requisitos?.titulo || "Requisitos para participar";
    reqContenido.value = porClave.requisitos?.contenido || "";
    regTitulo.value = porClave.reglamento?.titulo || "Reglamento del torneo";
    regContenido.value = porClave.reglamento?.contenido || "";
  }

  async function guardar(clave, titulo, contenido, boton) {
    ocultarMensaje(mensaje);
    const textoOriginal = boton.textContent;
    boton.disabled = true;
    boton.textContent = "Guardando…";
    try {
      await llamarFuncion("guardar-contenido", { clave, titulo, contenido });
      mostrarMensaje(mensaje, "Guardado correctamente.", "ok");
    } catch (err) {
      mostrarMensaje(mensaje, err.message, "error");
    } finally {
      boton.disabled = false;
      boton.textContent = textoOriginal;
    }
  }

  document.getElementById("btn-guardar-requisitos").addEventListener("click", (e) => {
    guardar("requisitos", reqTitulo.value, reqContenido.value, e.target);
  });
  document.getElementById("btn-guardar-reglamento").addEventListener("click", (e) => {
    guardar("reglamento", regTitulo.value, regContenido.value, e.target);
  });

  cargar();
})();
