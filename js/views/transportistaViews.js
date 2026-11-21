/* VISTAS - Transportista */
(function (M) {
  var V = M.Views, U = M.U, UI = M.UI, St = M.Store, Q = M.Q, Sh = M.Sh;
  var S = function () { return St.S; };
  function mias() { return S().citas.filter(function (c) { return c.tid === St.me.id; }); }

  V.t_home = function () {
    var c = mias(), vig = c.filter(function (x) { return x.estado === 'Vigente'; });
    return Sh.hola('Hola, ' + U.esc(St.me.name) + '. Reserva tu franja para entrar sin hacer cola.') +
      UI.stats([['Citas vigentes', vig.length, vig.length ? 'ok' : ''], ['Descargas completadas', c.filter(function (x) { return x.estado === 'Completada'; }).length],
        ['Servicios de estibaje', S().servicios.filter(function (x) { return x.ownerId === St.me.id; }).length]]) +
      '<div class="two">' + UI.card('Cupo de franjas hoy', Sh.franjas()) + UI.card('Mis próximas citas', Sh.citas(vig, false)) + '</div>';
  };

  /* HU-08 */
  V.t_cit = function () {
    var s = S();
    return Sh.hola('Reserva una franja horaria y recibe tu código QR para la puerta.') +
      UI.card('Reservar franja de descarga', '<div class="row"><div><label>Placa del vehículo</label><input id="c_pl" maxlength="8" placeholder="ABC-123"></div>' +
        '<div><label>Franja horaria</label><select id="c_sl">' + s.slots.map(function (x) {
          var o = Q.ocupacion(x.id); return '<option value="' + x.id + '">' + x.h + ' (' + o + '/' + x.cap + (o >= x.cap ? ' - llena' : '') + ')</option>';
        }).join('') + '</select></div></div><button class="btn" data-a="cita">Reservar y generar QR</button>') +
      UI.card('Mis citas', Sh.citas(mias().slice().reverse(), false));
  };

  V.t_est = function () { return Sh.hola('Pide estibadores con tarifa oficial.') + Sh.estibaje(); };
})(window.MER);
