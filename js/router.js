/* ENRUTADOR - Define que ve cada rol (menu) y dibuja la pantalla actual */
(function (M) {
  var U = M.U, R = (M.Router = { view: null });

  /* Tabla de rutas por rol: [idVista, texto del menu, historia] */
  var MENU = {
    Administrador: [['a_home', 'Inicio', ''], ['a_com', 'Comerciantes', 'HU-01'], ['a_pue', 'Puestos', 'HU-02'], ['a_tar', 'Tarifas', 'HU-03'],
      ['a_veh', 'Vehículos y andenes', 'HU-08 a 10'], ['a_est', 'Estibaje', 'HU-11'], ['a_den', 'Denuncias', 'HU-13'],
      ['a_ven', 'Ventas y precios', 'HU-06 y 07'], ['a_aud', 'Auditoría', '']],
    Comerciante: [['c_home', 'Inicio', ''], ['c_tar', 'Mis tarifas', 'HU-03'], ['c_pro', 'Mis productos', 'HU-04'], ['c_ped', 'Pedidos recibidos', 'HU-05'],
      ['c_ven', 'Mis ventas', 'HU-06 y 07'], ['c_est', 'Estibaje', 'HU-12'], ['c_den', 'Denunciar', 'HU-13']],
    Comprador: [['p_home', 'Inicio', ''], ['p_cat', 'Catálogo', 'HU-05 y 07'], ['p_ped', 'Mis pedidos', 'HU-05'], ['p_com', 'Mis comprobantes', 'HU-06']],
    Transportista: [['t_home', 'Inicio', ''], ['t_cit', 'Mis citas', 'HU-08'], ['t_est', 'Estibaje', 'HU-12']],
    Seguridad: [['s_home', 'Inicio', ''], ['s_ing', 'Control de ingreso', 'HU-09'], ['s_and', 'Andenes y bitácora', 'HU-10']]
  };
  R.MENU = MENU;

  R.home = function (role) { return MENU[role][0][0]; };
  R.go = function (v) { R.view = v; R.render(); window.scrollTo(0, 0); };

  R.render = function () {
    var app = U.$('#app'), me = M.Store.me;
    if (!me) { app.innerHTML = M.Views.login(); return; }
    var items = MENU[me.role];
    var cur = items.filter(function (i) { return i[0] === R.view; })[0];
    if (!cur) { cur = items[0]; R.view = cur[0]; }          // una ruta que no es de su rol no se muestra
    var nav = items.map(function (i) {
      return '<button data-v="' + i[0] + '" class="' + (i[0] === R.view ? 'on' : '') + '">' + U.esc(i[1]) + (i[2] ? '<span class="tag">' + i[2] + '</span>' : '') + '</button>';
    }).join('');
    app.innerHTML = '<div class="top"><h1>Mercado Mayorista de Santa Anita</h1><div><span class="chip">' + U.esc(me.role) + ' · ' + U.esc(me.name) +
      '</span> <button data-a="salir">Cambiar de rol</button></div></div>' +
      '<div class="layout"><nav>' + nav + '</nav><main><h2>' + U.esc(cur[1]) + (cur[2] ? '<span class="hu">' + cur[2] + '</span>' : '') + '</h2>' +
      M.Views[R.view]() + '<p class="foot">Prototipo de evidencia: los datos se guardan solo en este navegador.</p></main></div>';
  };
})(window.MER);
