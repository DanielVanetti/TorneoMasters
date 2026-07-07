(async function () {
  await window.Admin.requireSession();
  const { client, llamarFuncion, mostrarMensaje, ocultarMensaje } = window.Admin;

  const form = document.getElementById("form-partido");
  const mensaje = document.getElementById("mensaje");
  const tabla = document.getElementById("tabla-partidos");
  const selectLocal = document.getElementById("equipo_local_id");
  const selectVisitante = document.getElementById("equipo_visitante_id");
  const golesFilas = document.getElementById("goles-filas");
  const btnAgregarGol = document.getElementById("btn-agregar-gol");
  const btnCancelar = document.getElementById("btn-cancelar");
  const formTitulo = document.getElementById("form-titulo");
  let equipos = [];
  let jugadoresDeAmbos = [];

  function limpiarForm() {
    form.reset();
    document.getElementById("partido-id").value = "";
    golesFilas.innerHTML = "";
    formTitulo.textContent = "Nuevo partido";
    btnCancelar.style.display = "none";
  }
  btnCancelar.addEventListener("click", limpiarForm);

  async function cargarEquipos() {
    const { data, error } = await client.from("equipos").select("id, nombre").order("nombre");
    if (error) { selectLocal.innerHTML = selectVisitante.innerHTML = `<option value="">Error: ${error.message}</option>`; return; }
    equipos = data || [];
    const opciones = `<option value="">Elegí un equipo</option>` + equipos.map((e) => `<option value="${e.id}">${e.nombre}</option>`).join("");
    selectLocal.innerHTML = opciones;
    selectVisitante.innerHTML = opciones;
  }

  async function cargarJugadoresDeEquipos() {
    const ids = [selectLocal.value, selectVisitante.value].filter(Boolean);
    if (!ids.length) { jugadoresDeAmbos = []; return; }
    const { data, error } = await client.from("jugadores").select("id, nombre, equipo_id").in("equipo_id", ids);
    jugadoresDeAmbos = error ? [] : (data || []);
  }

  function opcionesJugadores(seleccionadoId) {
    const opts = jugadoresDeAmbos.map((j) => {
      const equipo = equipos.find((e) => e.id === j.equipo_id);
      const etiqueta = equipo ? `${j.nombre} (${equipo.nombre})` : j.nombre;
      return `<option value="${j.id}" ${j.id === seleccionadoId ? "selected" : ""}>${etiqueta}</option>`;
    }).join("");
    return `<option value="">Elegí jugador</option>${opts}`;
  }

  function agregarFilaGol(jugadorId, cantidad) {
    const fila = document.createElement("div");
    fila.className = "goles-fila";
    fila.innerHTML = `
      <select class="gol-jugador">${opcionesJugadores(jugadorId || "")}</select>
      <input type="number" class="gol-cantidad" min="1" value="${cantidad || 1}">
      <button type="button" class="btn small danger">Quitar</button>
    `;
    fila.querySelector("button").addEventListener("click", () => fila.remove());
    golesFilas.appendChild(fila);
  }

  btnAgregarGol.addEventListener("click", async () => {
    if (!selectLocal.value || !selectVisitante.value) {
      alert("Elegí primero el equipo local y visitante.");
      return;
    }
    await cargarJugadoresDeEquipos();
    agregarFilaGol();
  });

  [selectLocal, selectVisitante].forEach((sel) => sel.addEventListener("change", () => {
    golesFilas.innerHTML = "";
  }));

  function leerGolesDelForm() {
    return [...golesFilas.querySelectorAll(".goles-fila")].map((fila) => ({
      jugador_id: fila.querySelector(".gol-jugador").value,
      cantidad: Number(fila.querySelector(".gol-cantidad").value || 0),
    })).filter((g) => g.jugador_id && g.cantidad > 0);
  }

  async function cargarPartidos() {
    const { data, error } = await client
      .from("partidos")
      .select("*, local:equipo_local_id(nombre), visitante:equipo_visitante_id(nombre)")
      .order("fecha", { ascending: false });
    if (error) { tabla.innerHTML = `<tr><td colspan="6">Error: ${error.message}</td></tr>`; return; }
    if (!data.length) { tabla.innerHTML = `<tr><td colspan="6">Todavía no hay partidos cargados.</td></tr>`; return; }

    tabla.innerHTML = data.map((p) => `
      <tr>
        <td>${p.jornada}</td>
        <td>${p.fecha}</td>
        <td>${p.local ? p.local.nombre : "?"} vs ${p.visitante ? p.visitante.nombre : "?"}</td>
        <td>${p.estado === "Jugado" ? `${p.goles_local} - ${p.goles_visitante}` : "—"}</td>
        <td>${p.estado}</td>
        <td style="white-space:nowrap">
          <button class="btn small secondary" data-editar="${p.id}">Editar</button>
          <button class="btn small danger" data-eliminar="${p.id}">Eliminar</button>
        </td>
      </tr>
    `).join("");

    tabla.querySelectorAll("[data-editar]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const p = data.find((x) => x.id === btn.dataset.editar);
        if (!p) return;
        document.getElementById("partido-id").value = p.id;
        document.getElementById("jornada").value = p.jornada;
        document.getElementById("estado").value = p.estado;
        document.getElementById("fecha").value = p.fecha;
        document.getElementById("hora").value = p.hora || "";
        document.getElementById("cancha").value = p.cancha || "";
        selectLocal.value = p.equipo_local_id;
        selectVisitante.value = p.equipo_visitante_id;
        document.getElementById("goles_local").value = p.goles_local ?? "";
        document.getElementById("goles_visitante").value = p.goles_visitante ?? "";
        document.getElementById("arbitro_nombre").value = p.arbitro_nombre || "";
        document.getElementById("informe_arbitro").value = p.informe_arbitro || "";
        document.getElementById("incidencias").value = p.incidencias || "";

        golesFilas.innerHTML = "";
        await cargarJugadoresDeEquipos();
        const { data: goles } = await client.from("goles").select("jugador_id, cantidad").eq("partido_id", p.id);
        (goles || []).forEach((g) => agregarFilaGol(g.jugador_id, g.cantidad));

        formTitulo.textContent = `Editando jornada ${p.jornada}: ${p.local?.nombre} vs ${p.visitante?.nombre}`;
        btnCancelar.style.display = "inline-block";
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    tabla.querySelectorAll("[data-eliminar]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("¿Eliminar este partido? También se borran sus goles.")) return;
        try {
          await llamarFuncion("eliminar-partido", { id: btn.dataset.eliminar });
          cargarPartidos();
        } catch (err) {
          alert(err.message);
        }
      });
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    ocultarMensaje(mensaje);
    if (selectLocal.value === selectVisitante.value) {
      mostrarMensaje(mensaje, "El equipo local y visitante no pueden ser el mismo.", "error");
      return;
    }
    const boton = form.querySelector("button[type=submit]");
    boton.disabled = true;
    boton.textContent = "Guardando…";
    try {
      await llamarFuncion("guardar-partido", {
        id: document.getElementById("partido-id").value || undefined,
        jornada: Number(document.getElementById("jornada").value),
        estado: document.getElementById("estado").value,
        fecha: document.getElementById("fecha").value,
        hora: document.getElementById("hora").value || null,
        cancha: document.getElementById("cancha").value,
        equipo_local_id: selectLocal.value,
        equipo_visitante_id: selectVisitante.value,
        goles_local: document.getElementById("goles_local").value === "" ? null : Number(document.getElementById("goles_local").value),
        goles_visitante: document.getElementById("goles_visitante").value === "" ? null : Number(document.getElementById("goles_visitante").value),
        arbitro_nombre: document.getElementById("arbitro_nombre").value,
        informe_arbitro: document.getElementById("informe_arbitro").value,
        incidencias: document.getElementById("incidencias").value,
        goles: leerGolesDelForm(),
      });

      mostrarMensaje(mensaje, "Partido guardado correctamente.", "ok");
      limpiarForm();
      cargarPartidos();
    } catch (err) {
      mostrarMensaje(mensaje, err.message, "error");
    } finally {
      boton.disabled = false;
      boton.textContent = "Guardar partido";
    }
  });

  await cargarEquipos();
  cargarPartidos();
})();
