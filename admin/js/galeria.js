(async function () {
  await window.Admin.requireSession();
  const { client, llamarFuncion, mostrarMensaje, ocultarMensaje, fileToBase64 } = window.Admin;

  const form = document.getElementById("form-foto");
  const mensaje = document.getElementById("mensaje");
  const grid = document.getElementById("grid-fotos");
  const selectPartido = document.getElementById("partido_id");

  async function cargarPartidos() {
    const { data } = await client
      .from("partidos")
      .select("id, jornada, fecha, local:equipo_local_id(nombre), visitante:equipo_visitante_id(nombre)")
      .order("fecha", { ascending: false })
      .limit(60);
    const opciones = (data || [])
      .map((p) => `<option value="${p.id}">J${p.jornada} · ${p.local?.nombre || "?"} vs ${p.visitante?.nombre || "?"} (${p.fecha})</option>`)
      .join("");
    selectPartido.innerHTML = `<option value="">Ninguno / actividad general</option>${opciones}`;
  }

  async function cargarFotos() {
    const { data, error } = await client.from("imagenes").select("*").order("subida_en", { ascending: false });
    if (error) { grid.innerHTML = `<p>Error: ${error.message}</p>`; return; }
    if (!data.length) { grid.innerHTML = `<p>Todavía no hay fotos.</p>`; return; }

    grid.innerHTML = data.map((f) => `
      <div style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
        <img src="${f.url_imagen}" alt="${f.titulo || ""}" style="width:100%;aspect-ratio:4/3;object-fit:cover;display:block">
        <div style="padding:8px">
          <div style="font-size:13px;font-weight:700;margin-bottom:6px">${f.titulo || "(sin título)"}</div>
          <button class="btn small danger" data-eliminar="${f.id}">Eliminar</button>
        </div>
      </div>
    `).join("");

    grid.querySelectorAll("[data-eliminar]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("¿Eliminar esta foto de la galería?")) return;
        try {
          await llamarFuncion("eliminar-foto", { id: btn.dataset.eliminar });
          cargarFotos();
        } catch (err) {
          alert(err.message);
        }
      });
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    ocultarMensaje(mensaje);
    const archivo = document.getElementById("foto").files[0];
    if (!archivo) return;
    const boton = form.querySelector("button[type=submit]");
    boton.disabled = true;
    boton.textContent = "Subiendo…";
    try {
      const { base64, contentType, filename } = await fileToBase64(archivo);
      await llamarFuncion("subir-foto", {
        archivo_base64: base64,
        nombre_archivo: filename,
        content_type: contentType,
        titulo: document.getElementById("titulo").value,
        descripcion: document.getElementById("descripcion").value,
        partido_id: selectPartido.value || null,
      });
      mostrarMensaje(mensaje, "Foto subida correctamente.", "ok");
      form.reset();
      cargarFotos();
    } catch (err) {
      mostrarMensaje(mensaje, err.message, "error");
    } finally {
      boton.disabled = false;
      boton.textContent = "Subir foto";
    }
  });

  await cargarPartidos();
  cargarFotos();
})();
