/* CONTROLADOR - Epica MER-3 Acceso vehicular: HU-08 citas, HU-09 control de ingreso, HU-10 andenes */
(function (M) {
  var A = M.Actions, U = M.U, UI = M.UI, St = M.Store, Q = M.Q, req = function (r) { return M.Auth.require(r); };

  /* HU-08 - Cita de descarga con QR */
  A.cita = function () {
    if (!req(['Transportista'])) return;
    var pl = U.val('c_pl').toUpperCase(), sl = U.val('c_sl');
    if (!/^[A-Z0-9]{3}-?[A-Z0-9]{3,4}$/.test(pl)) return UI.toast('Ingresa una placa válida (ejemplo: ABC-123).');
    var s = Q.slot(sl);
    if (Q.ocupacion(sl) >= s.cap) {
      var alt = St.S.slots.filter(function (x) { return Q.ocupacion(x.id) < x.cap; }).map(function (x) { return x.h; }).join(' / ');
      return UI.toast('Franja llena. Franjas alternativas: ' + (alt || 'ninguna disponible') + '.');
    }
    var cod = 'CITA-' + U.pad(St.S.seq.cita++, 4);
    St.S.citas.push({ cod: cod, placa: pl, tid: St.me.id, slot: sl, estado: 'Vigente', ingreso: null, salida: null, anden: null });
    St.log('Reservó la cita ' + cod + ' (' + pl + ')'); St.save();
    M.Router.render(); UI.toast('Cita ' + cod + ' creada.', 1); A.verQR(cod);
  };

  A.verQR = function (k) {
    UI.dlg('<h3>QR de la cita ' + k + '</h3><canvas id="qrc"></canvas><p class="sub">QR simulado para el prototipo. El sistema real lo genera con una librería QR.</p>');
    UI.qrDraw(U.$('#qrc'), k);
  };

  /* HU-09 - Control de ingreso y salida en la puerta */
  function intentar(cod) {
    var q = cod.toUpperCase();
    var c = St.S.citas.filter(function (x) { return x.cod === q || x.placa === q; })[0];
    function rechazar(m) {
      St.bit('Rechazado', c ? c.cod : q, c ? c.placa : '-', m);
      St.log('Denegó el ingreso de ' + (c ? c.cod : q)); St.save();
      UI.toast('Ingreso denegado: ' + m); M.Router.render();
    }
    if (!c) return rechazar('código inexistente.');
    if (c.estado === 'Vencida') return rechazar('el QR está vencido.');
    if (c.ingreso) return rechazar('el vehículo ya registró ingreso.');
    var ocupados = Q.dentro().map(function (x) { return x.anden; });
    var libre = St.S.andenes.filter(function (a) { return ocupados.indexOf(a) < 0; })[0];
    if (!libre) return rechazar('no hay andenes libres, debe esperar.');
    c.ingreso = U.hhmm(); c.anden = libre; c.estado = 'En mercado';
    St.bit('Ingreso autorizado', c.cod, c.placa, 'Andén ' + libre);
    St.log('Autorizó el ingreso de ' + c.cod); St.save();
    UI.toast('Ingreso autorizado. Hora ' + c.ingreso + ', andén ' + libre + '.', 1); M.Router.render();
  }
  A.controlar = function () {
    if (!req(['Seguridad'])) return;
    var c = U.val('g_cod'); if (!c) return UI.toast('Ingresa un código QR o una placa.');
    intentar(c);
  };
  A.controlarVencido = function () { if (req(['Seguridad'])) intentar('CITA-0000'); };

  A.salida = function (k) {
    if (!req(['Seguridad'])) return;
    var c = St.S.citas.filter(function (x) { return x.cod === k; })[0];
    c.salida = U.hhmm(); c.estado = 'Completada';
    St.bit('Salida', c.cod, c.placa, 'Andén ' + c.anden + ' liberado');
    St.log('Registró la salida de ' + c.cod); St.save();
    UI.toast('Salida registrada. Andén liberado.', 1); M.Router.render();
  };
})(window.MER);
