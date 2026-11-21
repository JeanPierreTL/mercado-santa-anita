/* VISTAS - Comprador */
(function (M) {
  var V = M.Views, U = M.U, UI = M.UI, St = M.Store, Q = M.Q, Sh = M.Sh;
  var S = function () { return St.S; };
  function mios(arr) { return arr.filter(function (x) { return x.cid === St.me.id; }); }

  V.p_home = function () {
    var ped = mios(S().pedidos), ven = mios(S().ventas);
    return Sh.hola('Hola, ' + U.esc(St.me.name) + '. Reserva productos antes de ir al mercado.') +
      UI.stats([['Pedidos reservados', ped.filter(function (p) { return p.estado === 'Reservado'; }).length, 'warn'],
        ['Pedidos confirmados', ped.filter(function (p) { return p.estado === 'Confirmado'; }).length, 'ok'],
        ['Comprobantes', ven.length], ['Total comprado', U.money(Sh.sum(ven, function (v) { return v.total; }))]]) +
      '<div class="two">' + Sh.pedidos(ped.slice(-5).reverse(), 'Mis pedidos recientes', false, false) + Sh.precios() + '</div>';
  };

  /* HU-05 y HU-07 */
  V.p_cat = function () {
    var by = Q.preciosHoy();
    return Sh.hola('Elige la cantidad y reserva. El stock se descuenta al confirmar tu pedido.') +
      UI.card('Catálogo', UI.tbl(['Producto', 'Comerciante', 'Precio', 'Promedio de hoy', 'Stock', 'Cantidad', ''], S().ofertas.map(function (o) {
        var a = by[o.producto], av = a ? U.money(a.reduce(function (x, y) { return x + y; }, 0) / a.length) : '-';
        return [U.esc(o.producto), U.esc(Q.comer(o.ruc).nombre), U.money(o.precio) + '/' + o.unidad, av, o.stock,
          '<input id="q' + o.id + '" type="number" min="1" style="width:80px">', '<button class="btn sm" data-a="reservar" data-k="' + o.id + '">Reservar</button>'];
      }))) + Sh.precios();
  };

  V.p_ped = function () {
    return Sh.hola('Estado de tus reservas. El comerciante las confirma y emite el comprobante.') + Sh.pedidos(mios(S().pedidos).slice().reverse(), 'Mis pedidos', false, false);
  };

  /* HU-06 */
  V.p_com = function () {
    return Sh.hola('Descarga tus comprobantes en PDF.') + Sh.comprobantes(mios(S().ventas).slice().reverse(), 'Mis comprobantes', true, false);
  };
})(window.MER);
