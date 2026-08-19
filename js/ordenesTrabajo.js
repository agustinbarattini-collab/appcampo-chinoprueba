import { dbGetAll } from "./db.js";
import { getOrdenesConEstado } from "./stockUtils.js";
import { formatearFechaCorta } from "./ui.js";

// Órdenes de Trabajo pasó a ser de solo lectura (2026-08-17): las carga el
// asesor directo en la Sheet ("Órdenes de Trabajo"), no hay alta desde acá.
// La app solo las muestra, separadas en pendientes/realizadas y ordenadas
// por fecha de inicio, con un filtro por contratista (mismo criterio que la
// tarjeta de stock pendiente en Fitosanitarios) para que cada uno vea rápido
// lo suyo: has, y por producto la dosis/ha cargada por el asesor junto con
// la necesidad total ya calculada (dosis × has).
const ordenesTrabajoView = {
  state: { contratistaId: "" },

  async render(container) {
    const [contratistas, ordenes] = await Promise.all([
      dbGetAll("contratistas"),
      getOrdenesConEstado(),
    ]);

    if (ordenes.length === 0) {
      container.innerHTML = `
        <h2>Órdenes de Trabajo</h2>
        <div class="card empty-state">
          Todavía no hay ninguna Orden de Trabajo cargada en la planilla.<br/>
          Las carga el asesor directo en la pestaña "Órdenes de Trabajo" de la Sheet — tocá "Actualizar desde Sheets" en Maestros para traerlas.
        </div>`;
      return;
    }

    container.innerHTML = `
      <h2>Órdenes de Trabajo</h2>
      <div class="card">
        <label style="font-size:0.8rem;">Ver órdenes de</label>
        <select id="fContratistaFiltro">
          <option value="">Todos los contratistas</option>
          ${contratistas
            .slice()
            .sort((a, b) => a.nombre.localeCompare(b.nombre))
            .map((c) => `<option value="${c.id}" ${c.id === this.state.contratistaId ? "selected" : ""}>${c.nombre}</option>`)
            .join("")}
        </select>
      </div>
      <div class="card" id="listaPendientes"></div>
      <div class="card" id="listaRealizadas"></div>
    `;

    container.querySelector("#fContratistaFiltro").addEventListener("change", (e) => {
      this.state.contratistaId = e.target.value;
      this.render(container);
    });

    const ordenesFiltradas = this.state.contratistaId
      ? ordenes.filter((o) => o.contratistaId === this.state.contratistaId)
      : ordenes;

    // Por fecha de inicio (fechaAsignacion) — antes se ordenaba por plazo,
    // ahora separado en 2 grupos así que el orden de "arranque" es más útil.
    const porFechaInicio = (a, b) => (a.fechaAsignacion || "").localeCompare(b.fechaAsignacion || "");
    const pendientes = ordenesFiltradas.filter((o) => o.estado !== "completada").sort(porFechaInicio);
    const realizadas = ordenesFiltradas.filter((o) => o.estado === "completada").sort(porFechaInicio);

    renderListado(container.querySelector("#listaPendientes"), "Pendientes", pendientes, this.state.contratistaId, "Este contratista no tiene órdenes pendientes.");
    renderListado(container.querySelector("#listaRealizadas"), "Realizadas", realizadas, this.state.contratistaId, "Este contratista no tiene órdenes realizadas todavía.");
  },
};

function renderListado(lista, titulo, ordenes, contratistaId, mensajeVacioConFiltro) {
  if (ordenes.length === 0) {
    lista.innerHTML = `<h2 style="margin-top:0;">${titulo} (0)</h2><div class="empty-state">${
      contratistaId ? mensajeVacioConFiltro : "No hay órdenes en este grupo."
    }</div>`;
    return;
  }
  lista.innerHTML = `<h2 style="margin-top:0;">${titulo} (${ordenes.length})</h2>`;
  for (const o of ordenes) {
    const lotesTxt = o.lotes.map((l) => l.loteNombre).join(", ");
    const filasProductos = o.comparacionProductos.length
      ? o.comparacionProductos
          .map(
            (p) => `
        <tr>
          <td>${p.productoNombre}</td>
          <td>${p.dosisPorHa} ${p.unidad || ""}/ha</td>
          <td>${p.necesidadTotal} ${p.unidad || ""}</td>
        </tr>`
          )
          .join("")
      : '<tr><td colspan="3" class="muted">Sin productos cargados.</td></tr>';

    const row = document.createElement("div");
    row.className = "list-item";
    row.style.flexDirection = "column";
    row.style.alignItems = "stretch";
    row.innerHTML = `
      <div><strong>${o.nombre}</strong></div>
      <div class="muted">Lote${o.lotes.length > 1 ? "s" : ""}: ${lotesTxt}</div>
      <div class="muted">Fecha: ${formatearFechaCorta(o.fechaAsignacion)}${o.fechaLimite ? " – " + formatearFechaCorta(o.fechaLimite) : ""}</div>
      <table class="tabla-orden">
        <thead><tr><th>Producto</th><th>Dosis</th><th>Necesidad total</th></tr></thead>
        <tbody>${filasProductos}</tbody>
      </table>
    `;
    lista.appendChild(row);
  }
}

export { ordenesTrabajoView };
