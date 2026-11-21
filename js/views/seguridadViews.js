/* VISTAS - Seguridad (puerta) */
(function (M) {
  var V = M.Views, U = M.U, UI = M.UI, St = M.Store, Q = M.Q, Sh = M.Sh;
  var S = function () { return St.S; };

  V.s_home = function () {
    var b = S().bitacora, n = Q.dentro().length;
    return Sh.hola('Turno en la puerta. Valida el QR o la placa de cada vehículo.') +
      UI.stats([['Vehículos dentro', n], ['Andenes libres', S().andenes.length - n, 'ok'],
        ['Ingresos autorizados', b.filter(function (x) { return x.ev === 'Ingreso autorizado'; }).length],
        ['Ingresos rechazados', b.filter(function (x) { return x.ev === 'Rechazado'; }).length, 'bad']]) +
      UI.card('Últimos movimientos', Sh.bitacora(b.slice(0, 6)));
  };

  /* HU-09 */
  V.s_ing = function () {
    var dentro = Q.dentro();
    return Sh.hola('Escribe el código del QR (por ejemplo CITA-0001) o la placa.') +
      UI.card('Validar vehículo en la puerta', '<div class="row"><div><label>Código del QR o placa</label><input id="g_cod" placeholder="CITA-0001"></div></div>' +
        '<button class="btn" data-a="controlar">Validar ingreso</button> <button class="btn sec" data-a="controlarVencido" style="margin-left:6px">Probar QR vencido (CITA-0000)</button>') +
      UI.card('Vehículos dentro del mercado', UI.tbl(['Código', 'Placa', 'Ingreso', 'Andén', ''], dentro.map(function (c) {
        return [c.cod, U.esc(c.placa), c.ingreso, c.anden, '<button class="btn sm" data-a="salida" data-k="' + c.cod + '">Registrar salida</button>'];
      }), 'Ningún vehículo dentro.'));
  };

  /* HU-10 */
  V.s_and = function () {
    var n = Q.dentro().length;
    return Sh.hola('Estado de los andenes y bitácora del día.') +
      UI.stats([['Libres', S().andenes.length - n, 'ok'], ['Ocupados', n], ['Total', S().andenes.length]]) +
      UI.card('Estado de cada andén', Sh.andenes()) + UI.card('Bitácora de ingresos y salidas', Sh.bitacora(S().bitacora));
  };
})(window.MER);
