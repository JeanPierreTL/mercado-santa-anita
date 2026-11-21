/* VISTAS - Administrador */
(function (M) {
  var V = M.Views, U = M.U, UI = M.UI, St = M.Store, Q = M.Q, Sh = M.Sh;
  var S = function () { return St.S; };

  V.a_home = function () {
    var s = S(), val = s.comerciantes.filter(function (c) { return c.estado === 'Validado'; }).length, pend = s.comerciantes.length - val;
    var ocu = s.puestos.filter(function (p) { return p.ruc; }).length;
    var cob = Sh.sum(s.tarifas.filter(function (t) { return t.estado === 'Pagado'; }), function (t) { return t.monto; });
    var por = Sh.sum(s.tarifas.filter(function (t) { return t.estado !== 'Pagado'; }), function (t) { return t.monto; });
    var den = s.denuncias.filter(function (d) { return d.estado !== 'Resuelta'; }).length;
    var vp = {}; s.ventas.forEach(function (v) { vp[v.producto] = (vp[v.producto] || 0) + v.total; });
    return Sh.hola('Resumen general del mercado.') +
      UI.stats([['Comerciantes validados', val + (pend ? ' (+' + pend + ' por validar)' : '')], ['Puestos ocupados', ocu + ' / ' + s.puestos.length],
        ['Tarifas cobradas', U.money(cob), 'ok'], ['Tarifas por cobrar', U.money(por), por ? 'warn' : ''],
        ['Vehículos dentro', Q.dentro().length], ['Denuncias abiertas', den, den ? 'bad' : '']]) +
      '<div class="two">' + UI.card('Ocupación de franjas de descarga', Sh.franjas()) +
      UI.card('Ventas por producto', UI.bars(Object.keys(vp).map(function (k) { return [k, vp[k]]; }), true)) + '</div>' +
      UI.card('Últimos movimientos del sistema', UI.tbl(['Hora', 'Quién', 'Acción'], s.audit.slice(0, 8).map(function (a) { return [a.h, U.esc(a.quien), U.esc(a.a)]; })));
  };

  /* HU-01 */
  V.a_com = function () {
    var s = S();
    return Sh.hola('Aquí validas las solicitudes de registro. Los comerciantes nuevos se registran desde la pantalla de ingreso.') +
      UI.card('Comerciantes y solicitudes', UI.tbl(['RUC', 'Nombre', 'Rubro', 'Puestos', 'Estado', ''], s.comerciantes.map(function (c) {
        return [c.ruc, U.esc(c.nombre), U.esc(c.rubro), Q.puestosDe(c.ruc).map(function (p) { return p.id; }).join(', ') || '-',
          UI.pill(c.estado, c.estado === 'Validado' ? 'ok' : 'warn'),
          c.estado !== 'Validado' ? '<button class="btn sm" data-a="validar" data-k="' + c.ruc + '">Validar</button>' : ''];
      })));
  };

  /* HU-02 */
  V.a_pue = function () {
    var s = S(), vs = s.comerciantes.filter(function (c) { return c.estado === 'Validado'; });
    return Sh.hola('Asigna puestos libres a comerciantes validados.') +
      UI.card('Asignar puesto', '<div class="row"><div><label>Comerciante validado</label><select id="as_c">' +
        vs.map(function (c) { return '<option value="' + c.ruc + '">' + U.esc(c.nombre) + '</option>'; }).join('') +
        '</select></div><div><label>Puesto</label><select id="as_p">' +
        s.puestos.map(function (p) { return '<option value="' + p.id + '">' + p.id + (p.ruc ? ' (ocupado)' : ' (libre)') + '</option>'; }).join('') +
        '</select></div></div><button class="btn" data-a="asignar">Confirmar asignación</button>') +
      UI.card('Estado de puestos', '<div class="grid">' + s.puestos.map(function (p) {
        return '<div class="cell ' + (p.ruc ? 'busy' : 'free') + '"><b>' + p.id + '</b><br>' + (p.ruc ? U.esc(Q.comer(p.ruc).nombre) : 'Libre') + '</div>';
      }).join('') + '</div>');
  };

  /* HU-03 */
  V.a_tar = function () {
    var s = S(), t = s.tarifas;
    var cob = Sh.sum(t.filter(function (x) { return x.estado === 'Pagado'; }), function (x) { return x.monto; });
    var ven = t.filter(Q.vencida);
    return Sh.hola('Seguimiento de las tarifas de puesto.') +
      UI.stats([['Cobrado', U.money(cob), 'ok'], ['Pendiente', U.money(Sh.sum(t.filter(function (x) { return x.estado !== 'Pagado' && !Q.vencida(x); }), function (x) { return x.monto; }))],
        ['Vencido', U.money(Sh.sum(ven, function (x) { return x.monto; })), ven.length ? 'bad' : '']]) +
      UI.card('Todas las tarifas', Sh.tarifas(t, false));
  };

  /* HU-08, 09, 10 */
  V.a_veh = function () {
    var s = S(), n = Q.dentro().length;
    return Sh.hola('Vista completa de citas, andenes y movimientos de vehículos.') +
      UI.stats([['Andenes libres', s.andenes.length - n, 'ok'], ['Andenes ocupados', n], ['Citas vigentes', s.citas.filter(function (c) { return c.estado === 'Vigente'; }).length]]) +
      '<div class="two">' + UI.card('Ocupación de franjas', Sh.franjas()) + UI.card('Estado de cada andén', Sh.andenes()) + '</div>' +
      UI.card('Todas las citas', Sh.citas(s.citas, true)) + UI.card('Bitácora de ingresos y salidas', Sh.bitacora(s.bitacora));
  };

  /* HU-11 y seguimiento de HU-12 */
  V.a_est = function () {
    var s = S();
    return Sh.hola('Registra estibadores y supervisa los servicios con tarifa oficial.') +
      UI.card('Registrar y carnetizar estibador', '<div class="row"><div><label>Nombre completo</label><input id="e_n"></div>' +
        '<div><label>DNI (8 dígitos)</label><input id="e_d" maxlength="8" inputmode="numeric"></div></div><button class="btn" data-a="registrarEst">Registrar</button>') +
      UI.card('Estibadores', UI.tbl(['Código único', 'Nombre', 'DNI', 'Estado', 'Disponible', ''], s.estibadores.map(function (e) {
        return [e.cod, U.esc(e.nombre), e.dni, UI.pill(e.estado, e.estado === 'Habilitado' ? 'ok' : 'bad'), e.libre ? 'Sí' : 'En servicio',
          '<button class="btn sm sec" data-a="toggleEst" data-k="' + e.cod + '">' + (e.estado === 'Habilitado' ? 'Inhabilitar' : 'Habilitar') + '</button>'];
      }))) + UI.card('Servicios de estibaje', Sh.servicios(s.servicios, true, false));
  };

  /* HU-13 */
  V.a_den = function () {
    var s = S();
    return Sh.hola('Las denuncias son confidenciales: no se guarda quién las envió.') +
      UI.card('Denuncias recibidas', UI.tbl(['Código', 'Detalle', 'Estado', 'Acciones'], s.denuncias.map(function (d) {
        return [d.cod, U.esc(d.texto) + ' <span class="sub">(' + U.esc(d.lugar) + ')</span>',
          UI.pill(d.estado, d.estado === 'Resuelta' ? 'ok' : (d.estado === 'En investigación' ? 'warn' : 'new')),
          ['En investigación', 'Resuelta'].map(function (x) { return '<button class="btn sm sec" data-a="estadoDen" data-k="' + d.cod + '" data-x="' + x + '">' + x + '</button>'; }).join(' ') +
            '<div class="sub" style="margin:4px 0 0">' + U.esc(d.acciones.join(' → ')) + '</div>'];
      }), 'No hay denuncias.'));
  };

  /* HU-06 y HU-07 */
  V.a_ven = function () {
    var s = S(), vc = {}; s.ventas.forEach(function (v) { var n = Q.comer(v.ruc).nombre; vc[n] = (vc[n] || 0) + v.total; });
    return Sh.hola('Ventas del mercado y precios del día.') +
      UI.stats([['Ventas registradas', s.ventas.length], ['Total vendido', U.money(Sh.sum(s.ventas, function (v) { return v.total; })), 'ok']]) +
      '<div class="two">' + UI.card('Ventas por comerciante', UI.bars(Object.keys(vc).map(function (k) { return [k, vc[k]]; }), true)) + Sh.precios() + '</div>' +
      Sh.comprobantes(s.ventas, 'Todos los comprobantes', true, true);
  };

  V.a_aud = function () {
    return Sh.hola('Registro de quién hizo qué y cuándo (trazabilidad).') +
      UI.card('Auditoría', UI.tbl(['Hora', 'Quién', 'Acción'], S().audit.map(function (a) { return [a.h, U.esc(a.quien), U.esc(a.a)]; })));
  };
})(window.MER);
