/* VISTAS - Bloques compartidos (tablas y secciones que usan varios roles) */
(function (M) {
  var U = M.U, UI = M.UI, St = M.Store, Q = M.Q, Sh = (M.Sh = {});
  var S = function () { return St.S; };

  Sh.sum = function (a, f) { return a.reduce(function (t, x) { return t + f(x); }, 0); };

  /* HU-07 - Precios del dia */
  Sh.precios = function () {
    var by = Q.preciosHoy(), ks = Object.keys(by);
    return UI.card('Precios referenciales de hoy (' + M.hoy + ')', UI.tbl(['Producto', 'Mínimo', 'Promedio', 'Máximo', 'Ventas'],
      ks.map(function (k) {
        var a = by[k], mn = Math.min.apply(null, a), mx = Math.max.apply(null, a), av = a.reduce(function (x, y) { return x + y; }, 0) / a.length;
        return [U.esc(k), U.money(mn), U.money(av), U.money(mx), a.length];
      }), 'Sin ventas registradas hoy.'));
  };

  /* HU-06 - Comprobantes */
  Sh.comprobantes = function (list, titulo, verVendedor, verComprador) {
    var h = ['Número', 'Fecha'].concat(verVendedor ? ['Vendedor'] : [], verComprador ? ['Comprador'] : [], ['Detalle', 'Total', '']);
    return UI.card(titulo, UI.tbl(h, list.map(function (v) {
      return [v.num, v.fecha].concat(verVendedor ? [U.esc(Q.comer(v.ruc).nombre)] : [], verComprador ? [U.esc(v.cnombre)] : [],
        [U.esc(v.producto) + ' x ' + v.cant, U.money(v.total), '<button class="btn sm sec" data-a="verComprobante" data-k="' + v.num + '">Ver / PDF</button>']);
    }), 'Todavía no hay comprobantes.'));
  };

  /* Pedidos (HU-05). confirmar = true muestra el boton de confirmar venta (comerciante) */
  Sh.pedidos = function (list, titulo, confirmar, verComprador) {
    var h = ['N.°', 'Producto'].concat(verComprador ? ['Comprador'] : [], ['Cantidad', 'Total', 'Estado', '']);
    return UI.card(titulo, UI.tbl(h, list.map(function (p) {
      return [p.id, U.esc(p.producto)].concat(verComprador ? [U.esc(p.cnombre)] : [],
        [p.cant, U.money(p.total), UI.pill(p.estado, p.estado === 'Confirmado' ? 'ok' : 'warn'),
          confirmar && p.estado === 'Reservado' ? '<button class="btn sm" data-a="confirmar" data-k="' + p.id + '">Confirmar venta</button>' : '']);
    }), 'Todavía no hay pedidos.'));
  };

  /* HU-03 - Tarifas. pagar = true muestra el boton Pagar en linea */
  Sh.tarifas = function (list, pagar) {
    return UI.tbl(['Comerciante', 'Monto', 'Vence', 'Estado', ''], list.map(function (t) {
      var ven = Q.vencida(t);
      return [U.esc(Q.comer(t.ruc).nombre), U.money(t.monto), t.venc,
        UI.pill(t.estado === 'Pagado' ? 'Pagado' : (ven ? 'Vencida' : 'Pendiente'), t.estado === 'Pagado' ? 'ok' : (ven ? 'bad' : 'warn')),
        t.estado === 'Pagado' ? '<button class="btn sm sec" data-a="recibo" data-k="' + t.id + '">Comprobante</button>' :
          (pagar ? '<button class="btn sm" data-a="pagar" data-k="' + t.id + '">Pagar en línea</button>' : '')];
    }), 'No hay tarifas registradas.');
  };

  /* HU-08 - Tabla de citas */
  Sh.citas = function (list, verTransp) {
    var h = ['Código'].concat(['Placa'], verTransp ? ['Transportista'] : [], ['Franja', 'Estado', 'Ingreso', 'Salida', 'Andén', '']);
    return UI.tbl(h, list.map(function (c) {
      var tone = { Vigente: 'new', Vencida: 'bad', 'En mercado': 'warn', Completada: 'ok' }[c.estado] || 'new';
      return [c.cod, U.esc(c.placa)].concat(verTransp ? [U.esc(Q.transp(c.tid))] : [],
        [Q.slot(c.slot).h, UI.pill(c.estado, tone), c.ingreso || '-', c.salida || '-', c.anden || '-',
          '<button class="btn sm sec" data-a="verQR" data-k="' + c.cod + '">Ver QR</button>']);
    }), 'Todavía no hay citas.');
  };

  /* HU-09 - Bitacora de ingresos y salidas */
  Sh.bitacora = function (list) {
    return UI.tbl(['Hora', 'Código', 'Placa', 'Evento', 'Detalle'], list.map(function (b) {
      return [b.h, b.cod, U.esc(b.placa), UI.pill(b.ev, b.ev === 'Rechazado' ? 'bad' : (b.ev === 'Salida' ? 'new' : 'ok')), U.esc(b.det)];
    }), 'Sin movimientos todavía.');
  };

  /* HU-10 - Andenes */
  Sh.andenes = function () {
    var occ = {}; Q.dentro().forEach(function (c) { occ[c.anden] = c; });
    return '<div class="grid">' + S().andenes.map(function (a) {
      var c = occ[a];
      return '<div class="cell ' + (c ? 'busy' : 'free') + '"><b>' + a + '</b><br>' + (c ? U.esc(c.placa) : 'Libre') + '</div>';
    }).join('') + '</div>';
  };

  Sh.franjas = function () {
    return UI.bars(S().slots.map(function (x) { return [x.h + ' (cupo ' + x.cap + ')', Q.ocupacion(x.id)]; }));
  };

  /* HU-12 - Tabla de servicios de estibaje */
  Sh.servicios = function (list, verDueno, terminar) {
    var h = ['N.°', 'Carga'].concat(verDueno ? ['Solicitante'] : [], ['Tarifa oficial', 'Estibador', 'Estado', '']);
    return UI.tbl(h, list.map(function (s) {
      return [s.id, s.tipo + ' - ' + s.peso + ' t'].concat(verDueno ? [U.esc(s.ownerName)] : [],
        [U.money(s.monto), U.esc(s.est), UI.pill(s.estado, s.estado === 'Terminado' ? 'ok' : 'warn'),
          terminar && s.estado === 'En curso' ? '<button class="btn sm" data-a="terminar" data-k="' + s.id + '">Confirmar terminado</button>' : '']);
    }), 'Todavía no hay servicios de estibaje.');
  };

  /* HU-12 - Pantalla de solicitud (comerciante y transportista) */
  Sh.estibaje = function () {
    var me = St.me, mine = S().servicios.filter(function (x) { return x.ownerId === me.id; });
    var t = M.TARIFA;
    return UI.alert('<b>Tarifa oficial fija por tonelada:</b> Sacos ' + U.money(t.Sacos) + ' · Cajas ' + U.money(t.Cajas) + ' · Granel ' + U.money(t.Granel) +
      ' (mínimo ' + U.money(M.TARIFA_MIN) + '). Nadie puede cobrar un monto distinto.', 'ok') +
      UI.card('Solicitar estibadores', '<div class="row"><div><label>Tipo de carga</label><select id="s_t"><option>Sacos</option><option>Cajas</option><option>Granel</option></select></div>' +
        '<div><label>Peso (toneladas)</label><input id="s_p" type="number" step="0.1" min="0.1"></div></div><button class="btn" data-a="solicitar">Calcular tarifa y asignar</button>') +
      UI.card('Mis servicios de estibaje', Sh.servicios(mine, false, true));
  };

  /* Cabecera de bienvenida de cada pantalla de inicio */
  Sh.hola = function (txt) { return '<p class="sub">' + txt + '</p>'; };
})(window.MER);
