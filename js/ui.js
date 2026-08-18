// Aviso rápido y no bloqueante para confirmar que algo se guardó — a
// diferencia de alert(), no interrumpe el flujo ni hay que cerrarlo:
// aparece abajo (arriba de la tabbar) y desaparece solo.
function toast(mensaje, duracionMs = 2200) {
  let contenedor = document.getElementById("toastContainer");
  if (!contenedor) {
    contenedor = document.createElement("div");
    contenedor.id = "toastContainer";
    contenedor.className = "toast-container";
    document.body.appendChild(contenedor);
  }
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = mensaje;
  contenedor.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 250);
  }, duracionMs);
}

// Formatea una fecha a dd/mm/aaaa para mostrar. Acepta tanto "2026-08-28"
// (input type=date) como "2026-08-28T03:00:00.000Z" (Date de Google Sheets
// serializado) — en ambos casos toma solo la parte de fecha, ignorando la
// hora (que para estos usos no aporta nada y ensucia la lectura).
function formatearFechaCorta(fecha) {
  if (!fecha) return "sin definir";
  const soloFecha = String(fecha).slice(0, 10);
  const [anio, mes, dia] = soloFecha.split("-");
  if (!anio || !mes || !dia) return String(fecha);
  return `${dia}/${mes}/${anio}`;
}

export { toast, formatearFechaCorta };
