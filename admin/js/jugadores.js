(async function () {
  await window.Admin.requireSession();
  const { client, llamarFuncion, mostrarMensaje, ocultarMensaje, fileToBase64 } = window.Admin;

  const form = document.getElementById("form-jugador");
  const mensaje = document.getElementById("mensaje");
  const tabla = document.getElementById("tabla-jugadores");
  const selectEquipo = document.getElementById("equipo_id");
  const filtroEquipo = document.getElementById("filtro-equipo");
  const btnCancelar = document.getElementById("btn-cancelar");
  const formTitulo = document.getElementById("form-titulo");
  const fotoInput = document.getElementById("foto");
  const fotoPreview = document.getElementById("foto-preview");
  let fotoUrlActual = null;
  let equipos = [];

  fotoInput.addEventListener("change", () => {
    const f = fotoInput.files[0];
    if (!f) return;
    fotoPreview.src = URL.createObjectURL(f);
    fotoPreview.style.display = "block";
  });

  function limpiarForm() {
    form.reset();
    document.getElementById("jugador-id").value = "";
    fotoPreview.style.display = "none";
    fotoUrlActual = null;
    formTitulo.textContent = "Nuevo jugador";
    btnCancelar.style.display = "none";
  }
  btnCancelar.addEventListener("click", limpiarForm);

  async function cargarEquipos() {
    const { data, error } = await client.from("equipos").select("id, nombre").order("nombre");
    if (error) { selectEquipo.innerHTML = `<option value="">Error: ${error.message}</option>`; return; }
    equipos = data || [];
    const opciones = equipos.map((e) => `<option value="${e.id}">${e.nombre}</option>`).join("");
    selectEquipo.innerHTML = `<option value="">Elegí un equipo</option>${opciones}`;
    filtroEquipo.innerHTML = `<option value="">Todos los equipos</option>${opciones}`;
  }

  async function cargarJugadores() {
    let query = client.from("jugadores").select("*, equipos(nombre)").order("nombre");
    if (filtroEquipo.value) query = query.eq("equipo_id", filtroEquipo.value);
    const { data, error } = await query;
    if (error) { tabla.innerHTML = `<tr><td colspan="5">Error: ${error.message}</td></tr>`; return; }
    if (!data.length) { tabla.innerHTML = `<tr><td colspan="5">No hay jugadores para mostrar.</td></tr>`; return; }

    tabla.innerHTML = data.map((j) => `
      <tr>
        <td>${j.nombre}</td>
        <td>${j.equipos ? j.equipos.nombre : ""}</td>
        <td>${j.numero ?? ""}</td>
        <td>${j.posicion || ""}</td>
        <td style="white-space:nowrap">
          <button class="btn small secondary" data-editar="${j.id}">Editar</button>
          <button class="btn small danger" data-eliminar="${j.id}">Eliminar</button>
        </td>
      </tr>
    `).join("");

    tabla.querySelectorAll("[data-editar]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const j = data.find((x) => x.id === btn.dataset.editar);
        if (!j) return;
        document.getElementById("jugador-id").value = j.id;
        selectEquipo.value = j.equipo_id || "";
        document.getElementById("nombre").value = j.nombre || "";
        document.getElementById("numero").value = j.numero ?? "";
        document.getElementById("posicion").value = j.posicion || "";
        document.getElementById("fecha_nacimiento").value = j.fecha_nacimiento || "";
        fotoUrlActual = j.foto_url || null;
        if (fotoUrlActual) { fotoPreview.src = fotoUrlActual; fotoPreview.style.display = "block"; }
        else fotoPreview.style.display = "none";
        formTitulo.textContent = `Editando: ${j.nombre}`;
        btnCancelar.style.display = "inline-block";
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    tabla.querySelectorAll("[data-eliminar]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const j = data.find((x) => x.id === btn.dataset.eliminar);
        if (!j || !confirm(`¿Eliminar a "${j.nombre}"?`)) return;
        try {
          await llamarFuncion("eliminar-jugador", { id: j.id });
          cargarJugadores();
        } catch (err) {
          alert(err.message);
        }
      });
    });
  }

  filtroEquipo.addEventListener("change", cargarJugadores);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    ocultarMensaje(mensaje);
    const boton = form.querySelector("button[type=submit]");
    boton.disabled = true;
    boton.textContent = "Guardando…";
    try {
      let fotoUrl = fotoUrlActual;
      const archivo = fotoInput.files[0];
      if (archivo) {
        const { base64, contentType, filename } = await fileToBase64(archivo);
        const resSubida = await llamarFuncion("subir-archivo", {
          archivo_base64: base64, nombre_archivo: filename, content_type: contentType, carpeta: "jugadores",
        });
        fotoUrl = resSubida.url;
      }

      await llamarFuncion("guardar-jugador", {
        id: document.getElementById("jugador-id").value || undefined,
        equipo_id: selectEquipo.value,
        nombre: document.getElementById("nombre").value,
        numero: document.getElementById("numero").value || null,
        posicion: document.getElementById("posicion").value,
        fecha_nacimiento: document.getElementById("fecha_nacimiento").value || null,
        foto_url: fotoUrl,
      });

      mostrarMensaje(mensaje, "Jugador guardado correctamente.", "ok");
      limpiarForm();
      cargarJugadores();
    } catch (err) {
      mostrarMensaje(mensaje, err.message, "error");
    } finally {
      boton.disabled = false;
      boton.textContent = "Guardar jugador";
    }
  });

  await cargarEquipos();
  cargarJugadores();
})();
