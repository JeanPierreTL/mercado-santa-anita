/* CONTROLADOR - Autenticacion simulada y control de acceso por rol (RBAC) */
(function (M) {
  var A = M.Actions, U = M.U, UI = M.UI, Auth = (M.Auth = { sel: null });

  /* Verifica que el usuario actual tenga uno de los roles permitidos. Si no, error 403. */
  Auth.require = function (roles) {
    var me = M.Store.me;
    if (me && roles.indexOf(me.role) >= 0) return true;
    UI.toast('Error 403: tu rol no tiene permiso para esta acción.');
    return false;
  };

  A.elegirRol = function (k) { Auth.sel = k; M.Router.render(); };

  A.entrar = function () {
    var role = Auth.sel;
    if (!role) return UI.toast('Primero elige tu rol.');
    var ps = M.Q.perfiles(role);
    var id = U.val('lg_user') || ps[0].id;
    var p = ps.filter(function (x) { return x.id === id; })[0] || ps[0];
    M.Store.me = { role: role, id: p.id, name: p.name };
    M.Store.log('Inició sesión');
    M.Store.save();
    M.Router.go(M.Router.home(role));
  };

  A.salir = function () { M.Store.me = null; Auth.sel = null; M.Router.render(); };

  A.reiniciar = function () {
    M.Store.reset();
    UI.toast('Datos de ejemplo restablecidos.', 1);
    M.Router.render();
  };
})(window.MER);
