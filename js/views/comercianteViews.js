/* VISTAS - Comerciante */
(function (M) {
  var V = M.Views, U = M.U, UI = M.UI, St = M.Store, Q = M.Q, Sh = M.Sh;
  var S = function () { return St.S; };
  function mios(arr) { return arr.filter(function (x) { return x.ruc === St.me.id; }); }

  V.c_home = function () {
    var me = St.me, pu = Q.puestosDe(me.id), tar = Q.tarifasDe(me.id), ven = mios(S().ventas), ped = mios(S().pedidos);
    var deuda = tar.filter(Q.vencida);
    var porConf = ped.filter(function (p) { return p.estado === 'Reservado'; }).length;
    var h = Sh.hola('Hola, ' + U.esc(me.name) + '. Este es el resumen de tu negocio.');
    deuda.forEach(function (t) { h += UI.alert('Alerta de deuda: tu tarifa de ' + U.money(t.monto) + ' venció el ' + t.venc + '. Pásate a "Mis tarifas" para pagarla.', 'bad'); });
    if (!pu.length) h += UI.alert('Aún no tienes un puesto asignado. La administración lo asigna al validar tu registro.', 'warn');
    h += UI.stats([['Mi puesto', pu.length ? pu.map(function (p) { return p.id; }).join(', ') : 'Sin puesto'],
      ['Productos publicados', mios(S().ofertas).length], ['Pedidos por confirmar', porConf, porConf ? 'warn' : ''],
      ['Total vendido', U.money(Sh.sum(ven, function (v) { return v.total; })), 'ok']]);
    return h + Sh.pedidos(ped.slice(-5).reverse(), 'Pedidos recientes', true, true);
  };

  /* HU-03 */
  V.c_tar = function () {
    var tar = Q.tarifasDe(St.me.id), h = Sh.hola('Paga la tarifa de tu puesto en línea, sin efectivo ni intermediarios.');
    tar.filter(Q.vencida).forEach(function (t) { h += UI.alert('Tienes una tarifa vencida el ' + t.venc + '.', 'bad'); });
    return h + UI.card('Mis tarifas', Sh.tarifas(tar, true));
  };

  /* HU-04 */
  V.c_pro = function () {
    var me = St.me, h = Sh.hola('Publica tus productos con precio y stock para que los compradores los vean.');
    if (!Q.puestosDe(me.id).length) h += UI.alert('Necesitas un puesto activo para publicar productos.', 'warn');
    h += UI.card('Publicar producto', '<div class="row"><div><label>Producto</label><input id="o_p"></div><div><label>Unidad</label><select id="o_u"><option>saco</option><option>kilo</option><option>caja</option></select></div></div>' +
      '<div class="row"><div><label>Precio (S/)</label><input id="o_pr" type="number" step="0.01"></div><div><label>Stock</label><input id="o_s" type="number"></div></div><button class="btn" data-a="publicar">Publicar</button>');
    return h + UI.card('Mis productos', UI.tbl(['Producto', 'Precio', 'Stock'], mios(S().ofertas).map(function (o) {
      return [U.esc(o.producto), U.money(o.precio) + ' / ' + o.unidad, UI.pill(o.stock + ' ' + o.unidad + '(s)', o.stock > 20 ? 'ok' : 'warn')];
    }), 'Aún no publicaste productos.'));
  };

  /* HU-05 y HU-06 */
  V.c_ped = function () {
    return Sh.hola('Confirma los pedidos reservados para emitir el comprobante de venta.') + Sh.pedidos(mios(S().pedidos).slice().reverse(), 'Pedidos recibidos', true, true);
  };

  /* HU-06 y HU-07 */
  V.c_ven = function () {
    var ven = mios(S().ventas), by = {};
    ven.forEach(function (v) { by[v.producto] = (by[v.producto] || 0) + v.total; });
    return Sh.hola('Tus ventas y los precios de referencia del día.') +
      UI.stats([['Ventas', ven.length], ['Total vendido', U.money(Sh.sum(ven, function (v) { return v.total; })), 'ok']]) +
      '<div class="two">' + UI.card('Mis ventas por producto', UI.bars(Object.keys(by).map(function (k) { return [k, by[k]]; }), true)) + Sh.precios() + '</div>' +
      Sh.comprobantes(ven.slice().reverse(), 'Mis comprobantes', false, true);
  };

  V.c_est = function () { return Sh.hola('Pide estibadores con tarifa oficial.') + Sh.estibaje(); };

  /* HU-13 */
  V.c_den = function () {
    return UI.alert('Tu identidad no se guarda con la denuncia. Conserva el código de seguimiento.', 'ok') +
      UI.card('Reportar un cobro ilegal', '<label>¿Qué ocurrió?</label><input id="d_t" style="max-width:100%"><label>Lugar</label><input id="d_l" style="max-width:100%">' +
        '<button class="btn" data-a="denunciar">Enviar denuncia confidencial</button>') +
      UI.card('Consultar el seguimiento', '<label>Código de seguimiento</label><input id="d_c" placeholder="DEN-0001"><button class="btn sec" data-a="seguimiento">Consultar</button><div id="d_r" class="sub" style="margin-top:10px"></div>');
  };
})(window.MER);
