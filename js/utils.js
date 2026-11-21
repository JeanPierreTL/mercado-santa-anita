/* Utilidades generales. Espacio de nombres global: window.MER */
(function (M) {
  var U = (M.U = {});
  M.Actions = {};   // acciones registradas por los controladores
  M.Views = {};     // pantallas registradas por las vistas
  M.Ctrl = {};

  U.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };
  U.money = function (n) { return 'S/ ' + Number(n).toFixed(2); };
  U.pad = function (n, l) { var s = String(n); while (s.length < l) s = '0' + s; return s; };
  U.hhmm = function () { return new Date().toTimeString().slice(0, 5); };
  U.$ = function (s) { return document.querySelector(s); };
  U.val = function (id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; };
})((window.MER = window.MER || {}));
