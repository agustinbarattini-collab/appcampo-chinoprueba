const APP_CONFIG = {
  empresaId: "chinoprueba",
  empresaNombre: "Chino Prueba",
  colorPrimario: "#2e5339",
  colorSecundario: "#4a7c59",
  // URL del Web App de Google Apps Script (ver DUPLICAR.md). Vacío = sin sincronización.
  sheetsWebAppUrl: "https://script.google.com/macros/s/AKfycbycoSiKY2R_05eJUg36QNtrUaNm1p4yC9H9od1DCJuxKfRcayDwknfBOnzNPycwWds4/exec",
  // Mismo token que SHARED_SECRET en google-apps-script/Code.gs.
  sheetsSyncToken: "Chino",
  // Subir este número fuerza, en cada teléfono, un borrado del caché local
  // (IndexedDB) y una resincronización completa desde cero contra la Sheet
  // — sin que haya que tocar nada a mano en el celular. Se usa cuando se
  // borra o reordena algo grande directo en la Sheet (ej. "arrancar de 0"
  // el stock de Insumos) y hace falta que la app deje de mostrar lo viejo.
  // Ver verificarResetRemoto() en app.js. Dejar en 0 en el uso normal.
  resetVersion: 0,
};

export { APP_CONFIG };
