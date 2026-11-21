/* CONTROLADOR - Epica MER-2 Comercializacion: HU-04 ofertas, HU-05 pedidos, HU-06 comprobantes */
(function (M) {
  var A = M.Actions, U = M.U, UI = M.UI, St = M.Store, Q = M.Q, req = function (r) { return M.Auth.require(r); };

  /* HU-04 - Publicar oferta */
  A.publicar = function () {
    if (!req(['Comerciante'])) return;
    var me = St.me, p = U.val('o_p'), pr = parseFloat(U.val('o_pr')), stock = parseInt(U.val('o_s'), 10);
    if (!Q.puestosDe(me.id).length) return UI.toast('Necesitas un puesto activo para publicar.');
    if (!p) return UI.toast('Ingresa el nombre del producto.');
    if (!(pr > 0)) return UI.toast('Error de validación: el precio debe ser mayor a 0.');
    if (!(stock >= 0)) return UI.toast('Ingresa un stock válido.');
    St.S.ofertas.push({ id: St.S.ofertas.length + 1, ruc: me.id, producto: p, unidad: U.val('o_u'), precio: pr, stock: stock });
    St.log('Publicó el producto ' + p); St.save();
    UI.toast('Producto publicado en el catálogo.', 1); M.Router.render();
  };

  /* HU-05 - Pedido anticipado con control de stock */
  A.reservar = function (k) {
    if (!req(['Comprador'])) return;
    var me = St.me, o = St.S.ofertas.filter(function (x) { return String(x.id) === k; })[0], q = parseInt(U.val('q' + k), 10);
    if (!(q > 0)) return UI.toast('Ingresa una cantidad válida.');
    if (q > o.stock) return UI.toast('Stock insuficiente: solo hay ' + o.stock + ' ' + o.unidad + '(s).');
    o.stock -= q;
    St.S.pedidos.push({ id: St.S.seq.ped++, oid: o.id, ruc: o.ruc, producto: o.producto, cant: q, pu: o.precio, total: q * o.precio, estado: 'Reservado', cid: me.id, cnombre: me.name });
    St.log('Reservó ' + q + ' x ' + o.producto); St.save();
    UI.toast('Pedido reservado. Se descontó el stock y se notificó al comerciante.', 1); M.Router.render();
  };

  /* HU-06 - Confirmar la venta y emitir comprobante con numero correlativo */
  A.confirmar = function (k) {
    if (!req(['Comerciante'])) return;
    var p = St.S.pedidos.filter(function (x) { return String(x.id) === k; })[0];
    p.estado = 'Confirmado';
    var num = 'B001-' + U.pad(St.S.seq.comp++, 6);
    St.S.ventas.push({ num: num, fecha: M.hoy, ruc: p.ruc, producto: p.producto, cant: p.cant, pu: p.pu, total: p.total, cid: p.cid, cnombre: p.cnombre });
    St.log('Confirmó la venta y emitió ' + num); St.save();
    UI.toast('Venta confirmada. Comprobante ' + num + ' emitido.', 1); M.Router.render();
  };

  A.verComprobante = function (k) {
    var v = St.S.ventas.filter(function (x) { return x.num === k; })[0];
    UI.dlg('<h3>Comprobante ' + v.num + '</h3><p>Fecha: ' + v.fecha + '<br>Vendedor: ' + U.esc(Q.comer(v.ruc).nombre) + ' (RUC ' + v.ruc + ')' +
      '<br>Comprador: ' + U.esc(v.cnombre) + '<br>Detalle: ' + U.esc(v.producto) + ' x ' + v.cant + ' a ' + U.money(v.pu) +
      '<br><b>Total: ' + U.money(v.total) + '</b></p><button class="btn noprint" onclick="window.print()">Imprimir / guardar como PDF</button>');
  };
})(window.MER);
