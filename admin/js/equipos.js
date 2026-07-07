(async function () {
  await window.Admin.requireSession();
  const { client, llamarFuncion, mostrarMensaje, ocultarMensaje, fileToBase64 } = window.Admin;

  const form = document.getElementById("form-equipo");
  const mensaje = document.getElementById("mensaje");
  const tabla = document.getElementById("tabla-equipos");
  const btnCancelar = document.getElementById("btn-cancelar");
  const formTitulo = document.getElementById("form-titulo");
  const logoInput = document.getElementById("logo");
  const logoPreview = document.getElementById("logo-preview");
  let logoUrlActual = null;

  logoInput.addEventListener("change", () => {
    const f = logoInput.files[0];
    if (!f) return;
    logoPreview.src = URL.createObjectURL(f);
    logoPreview.style.display = "block";
  });

  function limpiarForm() {
    form.reset();
    document.getElementById("equipo-id").value = "";
    document.getElementById("color").value = "#0E5C6B";
    logoPreview.style.display = "none";
    logoUrlActual = null;
    formTitulo.textContent = "Nuevo equipo";
    btnCancelar.style.display = "none";
  }

  btnCancelar.addEventListener("click", limpiarForm);

  async function cargarEquipos() {
    const { data, error } = await client.from("equipos").select("*").order("nombre");
    if (error) {
      tabla.innerHTML = `<tr><td colspan="4">Error cargando equipos: ${error.message}</td></tr>`;
      return;
    }
    if (!data.length) {
      tabla.innerHTML = `<tr><td colspan="4">Todavía no hay equipos.</td></tr>`;
      return;
    }
    tabla.innerHTML = data.map((e) => `
      <tr>
        <td><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${e.color || '#0E5C6B'};margin-right:8px"></span>${e.nombre}</td>
        <td>${e.ciudad || ""}</td>
        <td>${e.delegado || ""}</td>
        <td style="white-space:nowrap">
          <button class="btn small secondary" data-editar="${e.id}">Editar</button>
          <button class="btn small danger" data-eliminar="${e.id}">Eliminar</button>
        </td>
      </tr>
    `).join("");

    tabla.querySelectorAll("[data-editar]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const e = data.find((x) => x.id === btn.dataset.editar);
        if (!e) return;
        document.getElementById("equipo-id").value = e.id;
        document.getElementById("nombre").value = e.nombre || "";
        document.getElementById("ciudad").value = e.ciudad || "";
        document.getElementById("color").value = e.color || "#0E5C6B";
        document.getElementById("cancha_local").value = e.cancha_local || "";
        document.getElementById("delegado").value = e.delegado || "";
        document.getElementById("telefono").value = e.telefono || "";
        document.getElementById("email").value = e.email || "";
        logoUrlActual = e.logo_url || null;
        if (logoUrlActual) { logoPreview.src = logoUrlActual; logoPreview.style.display = "block"; }
        else logoPreview.style.display = "none";
        formTitulo.textContent = `Editando: ${e.nombre}`;
        btnCancelar.style.display = "inline-block";
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    tabla.querySelectorAll("[data-eliminar]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const e = data.find((x) => x.id === btn.dataset.eliminar);
        if (!e || !confirm(`¿Eliminar el equipo "${e.nombre}"? Esto también borra sus jugadores.`)) return;
        try {
          await llamarFuncion("eliminar-equipo", { id: e.id });
          cargarEquipos();
        } catch (err) {
          alert(err.message);
        }
      });
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    ocultarMensaje(mensaje);
    const boton = form.querySelector("button[type=submit]");
    boton.disabled = true;
    boton.textContent = "Guardando…";
    try {
      let logoUrl = logoUrlActual;
      const archivo = logoInput.files[0];
      if (archivo) {
        const { base64, contentType, filename } = await fileToBase64(archivo);
        const resSubida = await llamarFuncion("subir-archivo", {
          archivo_base64: base64, nombre_archivo: filename, content_type: contentType, carpeta: "equipos",
        });
        logoUrl = resSubida.url;
      }

      await llamarFuncion("guardar-equipo", {
        id: document.getElementById("equipo-id").value || undefined,
        nombre: document.getElementById("nombre").value,
        ciudad: document.getElementById("ciudad").value,
        color: document.getElementById("color").value,
        cancha_local: document.getElementById("cancha_local").value,
        delegado: document.getElementById("delegado").value,
        telefono: document.getElementById("telefono").value,
        email: document.getElementById("email").value,
        logo_url: logoUrl,
      });

      mostrarMensaje(mensaje, "Equipo guardado correctamente.", "ok");
      limpiarForm();
      cargarEquipos();
    } catch (err) {
      mostrarMensaje(mensaje, err.message, "error");
    } finally {
      boton.disabled = false;
      boton.textContent = "Guardar equipo";
    }
  });

  cargarEquipos();
})();
