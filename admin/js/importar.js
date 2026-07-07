(async function () {
  await window.Admin.requireSession();
  const { llamarFuncion, mostrarMensaje, ocultarMensaje } = window.Admin;

  const inputArchivo = document.getElementById("archivo");
  const preview = document.getElementById("preview");
  const btnImportar = document.getElementById("btn-importar");
  const mensaje = document.getElementById("mensaje");
  let parsed = { equipos: [], jugadores: [] };

  function normalizarClaves(fila) {
    const out = {};
    for (const k in fila) out[k.trim().toLowerCase()] = fila[k];
    return out;
  }

  function buscarHoja(workbook, nombre) {
    const clave = Object.keys(workbook.Sheets).find((n) => n.trim().toLowerCase() === nombre);
    return clave ? XLSX.utils.sheet_to_json(workbook.Sheets[clave]) : [];
  }

  inputArchivo.addEventListener("change", () => {
    const archivo = inputArchivo.files[0];
    ocultarMensaje(mensaje);
    parsed = { equipos: [], jugadores: [] };
    btnImportar.disabled = true;
    preview.textContent = "";
    if (!archivo) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: "array" });
        const filasEquipos = buscarHoja(workbook, "equipos").map(normalizarClaves);
        const filasJugadores = buscarHoja(workbook, "jugadores").map(normalizarClaves);

        parsed.equipos = filasEquipos.map((f) => ({ nombre: f.nombre, ciudad: f.ciudad, color: f.color }));
        parsed.jugadores = filasJugadores.map((f) => ({ nombre: f.nombre, equipo: f.equipo, numero: f.numero, posicion: f.posicion }));

        if (!parsed.equipos.length && !parsed.jugadores.length) {
          preview.textContent = "No se encontraron hojas 'Equipos' o 'Jugadores' con datos en este archivo.";
          return;
        }

        preview.textContent = `Se encontraron ${parsed.equipos.length} equipo(s) y ${parsed.jugadores.length} jugador(es) en el archivo. Revisá que sean los correctos antes de importar.`;
        btnImportar.disabled = false;
      } catch (err) {
        preview.textContent = `No se pudo leer el archivo: ${err.message}`;
      }
    };
    reader.readAsArrayBuffer(archivo);
  });

  btnImportar.addEventListener("click", async () => {
    ocultarMensaje(mensaje);
    btnImportar.disabled = true;
    btnImportar.textContent = "Importando…";
    try {
      const res = await llamarFuncion("importar-datos", parsed);
      const r = res.resultado;
      let texto = `Listo: ${r.equiposCreados} equipo(s) y ${r.jugadoresCreados} jugador(es) guardados.`;
      if (r.errores.length) texto += ` ${r.errores.length} fila(s) con problemas: ${r.errores.slice(0, 5).join(" | ")}`;
      mostrarMensaje(mensaje, texto, r.errores.length ? "error" : "ok");
    } catch (err) {
      mostrarMensaje(mensaje, err.message, "error");
    } finally {
      btnImportar.disabled = false;
      btnImportar.textContent = "Importar";
    }
  });
})();
