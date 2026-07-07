(async function () {
  await window.Admin.requireSession();
  const client = window.Admin.client;

  const [{ count: equipos }, { count: jugados }, { count: programados }] = await Promise.all([
    client.from("equipos").select("*", { count: "exact", head: true }),
    client.from("partidos").select("*", { count: "exact", head: true }).eq("estado", "Jugado"),
    client.from("partidos").select("*", { count: "exact", head: true }).eq("estado", "Programado"),
  ]);

  document.getElementById("stat-equipos").textContent = equipos ?? "0";
  document.getElementById("stat-jugados").textContent = jugados ?? "0";
  document.getElementById("stat-programados").textContent = programados ?? "0";
})();
