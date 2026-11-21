/* MODELO - Almacen de datos (localStorage) y consultas */
(function (M) {
  var KEY = 'mer_proto_v2';
  var U = M.U;
  var Store = (M.Store = { S: null, me: null });

  Store.load = function () {
    try { var j = localStorage.getItem(KEY); Store.S = j ? JSON.parse(j) : M.seed(); }
    catch (e) { Store.S = M.seed(); }
  };
  Store.save = function () { try { localStorage.setItem(KEY, JSON.stringify(Store.S)); } catch (e) {} };
  Store.reset = function () { try { localStorage.removeItem(KEY); } catch (e) {} Store.S = M.seed(); };

  /* Auditoria: quien hizo que y cuando */
  Store.log = function (accion, anonimo) {
    var s = Store.S, me = Store.me;
    // anonimo = true: no se registra quien hizo la accion (denuncias confidenciales)
    s.audit.unshift({ h: U.hhmm(), quien: anonimo ? 'Anónimo' : (me ? me.role + ' - ' + me.name : 'Visitante'), a: accion });
    if (s.audit.length > 80) s.audit.length = 80;
  };
  /* Bitacora de ingresos y salidas de vehiculos */
  Store.bit = function (ev, cod, placa, det) {
    Store.S.bitacora.unshift({ h: U.hhmm(), cod: cod, placa: placa, ev: ev, det: det });
    if (Store.S.bitacora.length > 80) Store.S.bitacora.length = 80;
  };

  /* Consultas */
  var Q = (M.Q = {});
  Q.comer = function (ruc) { return Store.S.comerciantes.filter(function (c) { return c.ruc === ruc; })[0]; };
  Q.puestosDe = function (ruc) { return Store.S.puestos.filter(function (p) { return p.ruc === ruc; }); };
  Q.tarifasDe = function (ruc) { return Store.S.tarifas.filter(function (t) { return t.ruc === ruc; }); };
  Q.transp = function (id) { var t = Store.S.transportistas.filter(function (x) { return x.id === id; })[0]; return t ? t.nombre : '-'; };
  Q.slot = function (id) { return Store.S.slots.filter(function (s) { return s.id === id; })[0]; };
  Q.ocupacion = function (slotId) {
    return Store.S.citas.filter(function (c) { return c.slot === slotId && c.estado !== 'Vencida' && c.estado !== 'Cancelada'; }).length;
  };
  Q.dentro = function () { return Store.S.citas.filter(function (c) { return c.ingreso && !c.salida; }); };
  Q.vencida = function (t) { return t.estado !== 'Pagado' && t.venc < M.hoy; };
  Q.preciosHoy = function () {
    var by = {};
    Store.S.ventas.filter(function (v) { return v.fecha === M.hoy; }).forEach(function (v) { (by[v.producto] = by[v.producto] || []).push(v.pu); });
    return by;
  };
  Q.perfiles = function (role) {
    var s = Store.S;
    if (role === 'Comerciante') return s.comerciantes.filter(function (c) { return c.estado === 'Validado'; }).map(function (c) { return { id: c.ruc, name: c.nombre }; });
    if (role === 'Comprador') return s.compradores.map(function (c) { return { id: c.id, name: c.nombre }; });
    if (role === 'Transportista') return s.transportistas.map(function (c) { return { id: c.id, name: c.nombre }; });
    if (role === 'Seguridad') return [{ id: 'SEG1', name: 'Guardia de puerta' }];
    return [{ id: 'ADM1', name: 'Administración del mercado' }];
  };
})((window.MER = window.MER || {}));
