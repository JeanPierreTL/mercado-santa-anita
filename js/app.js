/* ARRANQUE - Carga los datos y conecta los clics con los controladores */
(function (M) {
  M.Store.load();

  document.addEventListener('click', function (e) {
    var v = e.target.closest('[data-v]');
    if (v) { M.Router.go(v.getAttribute('data-v')); return; }
    var r = e.target.closest('[data-role]');
    if (r) { M.Actions.elegirRol(r.getAttribute('data-role')); return; }
    var a = e.target.closest('[data-a]');
    if (a && M.Actions[a.getAttribute('data-a')]) {
      M.Actions[a.getAttribute('data-a')](a.getAttribute('data-k'), a.getAttribute('data-x'));
    }
  });

  M.Router.render();
})(window.MER);
