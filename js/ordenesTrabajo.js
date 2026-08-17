import { dbGetAll } from "./db.js";
import { getOrdenesConEstado } from "./stockUtils.js";

function etiquetaEstado(o) {
  if (o.estado === "completada") return { texto: "Completada", clase: "sincronizado" };
  if (o.estado === "atrasada") return { texto: `Atrasada (${o.diasAtraso} día${o.diasAtraso === 1 ? "" : "s"})`, clase: "pendiente" };
  return { texto: "Pendiente", clase: "" };
}

// Órdenes de Trabajo pasó a ser de solo lectura (2026-08-17): las carga el
// asesor directo en la Sheet ("Órdenes de Trabajo"), no hay alta desde acá.
// La app solo las muestra ordenadas por fecha, con un filtro por contratista
// (mismo criterio que la tarjeta de stock pendiente en Fitosanitarios) para
// que cada uno vea rápido lo suyo: has, y por producto la dosis/ha cargada
// por el asesor junto con la necesidad total ya calculada (dosis × has).
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
      <div class="card" id="listaOrdenes"></div>
    `;

    container.querySelector("#fContratistaFiltro").addEventListener("change", (e) => {
      this.state.contratistaId = e.target.value;
      this.render(container);
    });

    const ordenesFiltradas = this.state.contratistaId
      ? ordenes.filter((o) => o.contratistaId === this.state.contratistaId)
      : ordenes;

    renderListadoOrdenes(container, ordenesFiltradas, this.state.contratistaId);
  },
};

function renderListadoOrdenes(container, ordenes, contratistaId) {
  const lista = container.querySelector("#listaOrdenes");
  if (ordenes.length === 0) {
    lista.innerHTML = contratistaId
      ? '<div class="empty-state">Este contratista no tiene órdenes asignadas.</div>'
      : '<div class="empty-state">No hay órdenes cargadas.</div>';
    return;
  }
  lista.innerHTML = `<h2 style="margin-top:0;">Órdenes (${ordenes.length})</h2>`;
  for (const o of ordenes) {
    const { texto: estadoTxt, clase: estadoClase } = etiquetaEstado(o);
    const lotesTxt = o.lotes.map((l) => `${l.loteNombre}${l.aplicado ? " ✓" : ""}`).join(", ");
    const productosTxt = o.comparacionProductos.length
      ? o.comparacionProductos
          .map(
            (p) => `
        <div class="muted">${p.productoNombre}: ${p.dosisPorHa} ${p.unidad || ""}/ha → necesita ${p.necesidadTotal} ${p.unidad || ""} en total (aplicado ${p.aplicado} ${p.unidad || ""}${
              p.diferencia !== 0 ? `, ${p.diferencia > 0 ? "+" : ""}${p.diferencia}` : ""
            })</div>`
          )
          .join("")
      : '<div class="muted">Sin productos cargados.</div>';

    const row = document.createElement("div");
    row.className = "list-item";
    row.innerHTML = `
      <div>
        <div><strong>${o.nombre}</strong> — ${o.contratistaNombre} <span class="pill ${estadoClase}">${estadoTxt}</span></div>
        <div class="muted">${o.has ? o.has + " ha · " : ""}Lotes (${o.lotesAplicadosCount}/${o.totalLotes} aplicados): ${lotesTxt}</div>
        <div class="muted">Asignada: ${o.fechaAsignacion || "sin definir"} · Plazo: ${o.fechaLimite || "sin definir"}${o.observaciones ? " · " + o.observaciones : ""}</div>
        ${productosTxt}
      </div>
    `;
    lista.appendChild(row);
  }
}

export { ordenesTrabajoView };
