/* CONTROLADOR - Epica MER-4 Estibaje regulado: HU-11 estibadores, HU-12 tarifa oficial, HU-13 denuncias */
(function (M) {
  var A = M.Actions, U = M.U, UI = M.UI, St = M.Store, req = function (r) { return M.Auth.require(r); };
  var TARIFA = M.TARIFA = { Sacos: 40, Cajas: 35, Granel: 30 };   // S/ por tonelada
  var MINIMO = M.TARIFA_MIN = 20;

  /* HU-11 - Registro y carnetizacion de estibadores */
  A.registrarEst = function () {
    if (!req(['Administrador'])) return;
    var n = U.val('e_n'), d = U.val('e_d');
    if (!n) return UI.toast('Ingresa el nombre.');
    if (!/^\d{8}$/.test(d)) return UI.toast('El DNI debe tener 8 dígitos.');
    if (St.S.estibadores.some(function (e) { return e.dni === d; })) return UI.toast('Ya existe un estibador con ese DNI.');
    var cod = 'EST-' + U.pad(St.S.estibadores.length + 1, 3);
    St.S.estibadores.push({ cod: cod, nombre: n, dni: d, estado: 'Habilitado', libre: true });
    St.log('Registró al estibador ' + cod); St.save();
    UI.toast('Estibador registrado con código único ' + cod + '.', 1); M.Router.render();
  };

  A.toggleEst = function (k) {
    if (!req(['Administrador'])) return;
    var e = St.S.estibadores.filter(function (x) { return x.cod === k; })[0];
    e.estado = e.estado === 'Habilitado' ? 'Inhabilitado' : 'Habilitado';
    St.log('Cambió el estado de ' + k + ' a ' + e.estado); St.save();
    UI.toast('Estado actualizado.', 1); M.Router.render();
  };

  /* HU-12 - Solicitud de estibaje con tarifa oficial */
  A.solicitar = function () {
    if (!req(['Comerciante', 'Transportista'])) return;
    var t = U.val('s_t'), p = parseFloat(U.val('s_p'));
    if (!(p > 0)) return UI.toast('Ingresa el peso de la carga.');
    var disp = St.S.estibadores.filter(function (e) { return e.estado === 'Habilitado' && e.libre; })[0];
    if (!disp) return UI.toast('No hay estibadores habilitados disponibles. Los inhabilitados quedan bloqueados.');
    var monto = Math.max(MINIMO, Math.round(TARIFA[t] * p * 100) / 100);
    disp.libre = false;
    St.S.servicios.push({ id: St.S.seq.serv++, tipo: t, peso: p, monto: monto, est: disp.nombre + ' (' + disp.cod + ')', ec: disp.cod, estado: 'En curso', ownerId: St.me.id, ownerName: St.me.name });
    St.log('Solicitó estibaje de ' + p + ' t (' + t + ')'); St.save();
    UI.toast('Tarifa oficial ' + U.money(monto) + '. Estibador asignado: ' + disp.nombre + '.', 1); M.Router.render();
  };

  A.terminar = function (k) {
    if (!req(['Comerciante', 'Transportista'])) return;
    var s = St.S.servicios.filter(function (x) { return String(x.id) === k; })[0];
    s.estado = 'Terminado';
    St.S.estibadores.filter(function (e) { return e.cod === s.ec; })[0].libre = true;
    St.log('Confirmó el servicio de estibaje N.° ' + s.id); St.save();
    UI.toast('Servicio terminado y registrado con monto y estibador.', 1); M.Router.render();
  };

  /* HU-13 - Denuncia confidencial: NO se guarda quien denuncia */
  A.denunciar = function () {
    if (!req(['Comerciante'])) return;
    var t = U.val('d_t'), l = U.val('d_l');
    if (!t) return UI.toast('Describe lo ocurrido.');
    var cod = 'DEN-' + U.pad(St.S.seq.den++, 4);
    St.S.denuncias.push({ cod: cod, texto: t, lugar: l || 'sin indicar', estado: 'Recibida', acciones: ['Recibida'] });
    St.log('Se recibió una denuncia confidencial', true);  // sin identificar al denunciante
    St.save();
    UI.dlg('<h3>Denuncia registrada</h3><p>Tu identidad no fue guardada.<br>Código de seguimiento: <b>' + cod + '</b><br>Guárdalo para consultar el estado.</p>');
    M.Router.render();
  };

  A.seguimiento = function () {
    var d = St.S.denuncias.filter(function (x) { return x.cod === U.val('d_c').toUpperCase(); })[0];
    U.$('#d_r').innerHTML = d ? 'Estado: ' + UI.pill(d.estado, 'new') + ' — ' + U.esc(d.acciones.join(' → ')) : 'No se encontró ese código.';
  };

  A.estadoDen = function (k, x) {
    if (!req(['Administrador'])) return;
    var d = St.S.denuncias.filter(function (y) { return y.cod === k; })[0];
    d.estado = x; d.acciones.push(x);
    St.log('Cambió la denuncia ' + k + ' a "' + x + '"'); St.save();
    UI.toast('Estado de la denuncia actualizado.', 1); M.Router.render();
  };
})(window.MER);
