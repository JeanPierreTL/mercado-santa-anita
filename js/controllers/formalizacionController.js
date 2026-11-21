/* CONTROLADOR - Epica MER-1 Formalizacion: HU-01 registro, HU-02 puestos, HU-03 tarifas */
(function (M) {
  var A = M.Actions, U = M.U, UI = M.UI, St = M.Store, Q = M.Q, req = function (r) { return M.Auth.require(r); };

  /* HU-01 - Registro de comerciante (se hace desde la pantalla de ingreso) */
  A.abrirRegistro = function () {
    UI.dlg('<h3>Registrar mi negocio</h3><p class="sub">Tu solicitud quedará pendiente hasta que la administración la valide.</p>' +
      '<label>RUC (11 dígitos)</label><input id="f_ruc" maxlength="11" inputmode="numeric">' +
      '<label>DNI del representante (8 dígitos)</label><input id="f_dni" maxlength="8" inputmode="numeric">' +
      '<label>Razón social / nombre</label><input id="f_nom">' +
      '<label>Rubro</label><select id="f_rub"><option>Frutas</option><option>Verduras</option><option>Tubérculos</option></select>' +
      '<label>Documentos (simulado)</label><input id="f_doc" type="file" multiple>' +
      '<button class="btn" data-a="registrar">Enviar solicitud</button>', 'Cancelar');
  };

  A.registrar = function () {
    var ruc = U.val('f_ruc'), dni = U.val('f_dni'), nom = U.val('f_nom');
    if (!/^\d{11}$/.test(ruc)) return UI.toast('El RUC debe tener 11 dígitos.');
    if (!/^\d{8}$/.test(dni)) return UI.toast('El DNI debe tener 8 dígitos.');
    if (!nom) return UI.toast('Ingresa la razón social.');
    if (Q.comer(ruc)) return UI.toast('El RUC ya está registrado. Registro rechazado.');
    St.S.comerciantes.push({ ruc: ruc, dni: dni, nombre: nom, rubro: U.val('f_rub'), estado: 'Pendiente de validación' });
    St.log('Solicitud de registro de ' + nom);
    St.save(); UI.closeDlg();
    UI.toast('Solicitud creada en estado "Pendiente de validación".', 1);
    M.Router.render();
  };

  A.validar = function (k) {
    if (!req(['Administrador'])) return;
    var c = Q.comer(k); c.estado = 'Validado';
    St.log('Validó al comerciante ' + c.nombre); St.save();
    UI.toast('Comerciante validado.', 1); M.Router.render();
  };

  /* HU-02 - Asignacion de puestos */
  A.asignar = function () {
    if (!req(['Administrador'])) return;
    var ruc = U.val('as_c'), pid = U.val('as_p');
    if (!ruc) return UI.toast('No hay comerciantes validados.');
    var p = St.S.puestos.filter(function (x) { return x.id === pid; })[0];
    if (p.ruc) return UI.toast('El puesto ' + pid + ' ya está ocupado. Asignación impedida.');
    p.ruc = ruc;
    var d = new Date(); d.setDate(d.getDate() + 30);
    St.S.tarifas.push({ id: St.S.tarifas.length + 1, ruc: ruc, monto: 150, estado: 'Pendiente', venc: d.toISOString().slice(0, 10) });
    St.log('Asignó el puesto ' + pid + ' a ' + Q.comer(ruc).nombre); St.save();
    UI.toast('Puesto ' + pid + ' asignado. Se generó la tarifa del puesto.', 1); M.Router.render();
  };

  /* HU-03 - Pago de tarifas en linea */
  A.pagar = function (k) {
    if (!req(['Comerciante'])) return;
    var t = St.S.tarifas.filter(function (x) { return String(x.id) === k; })[0];
    t.estado = 'Pagado';
    St.log('Pagó la tarifa TAR-' + U.pad(t.id, 4)); St.save();
    UI.toast('Pago registrado. Se generó el comprobante.', 1); M.Router.render();
  };

  A.recibo = function (k) {
    var t = St.S.tarifas.filter(function (x) { return String(x.id) === k; })[0];
    UI.dlg('<h3>Comprobante de pago de tarifa</h3><p>Comerciante: ' + U.esc(Q.comer(t.ruc).nombre) + '<br>Monto: ' + U.money(t.monto) +
      '<br>Estado: Pagado<br>Referencia: TAR-' + U.pad(t.id, 4) + '</p>');
  };
})(window.MER);
