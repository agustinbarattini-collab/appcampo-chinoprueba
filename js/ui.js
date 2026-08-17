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

export { toast };
